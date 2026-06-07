import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_ROOT, getAssetResearch, getAssetSummary, listAssetEntries } from "./registry.js";

type RubricDimension = { id: string; max_score: number };
type Rubric = { version: string; max_score: number; dimensions: RubricDimension[] };
type SummaryDimension = { id: string; score: number; max_score: number };
type Summary = {
  asset_id: string;
  symbol: string;
  asset_type: string;
  rubric: { version: string; score: number; max_score: number; decision_class: string };
  dimensions: SummaryDimension[];
  return_profile?: unknown;
  blocking_unknowns: string[];
  source_report: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

const rubricPath = path.join(DATA_ROOT, "rubrics", "asset_risk_v1.json");
const rubric = await readJsonFile<Rubric>(rubricPath);
const rubricMax = rubric.dimensions.reduce((sum, dim) => sum + dim.max_score, 0);
assert(rubricMax === rubric.max_score, `Rubric dimension max sum ${rubricMax} != max_score ${rubric.max_score}`);
const rubricDimensionMax = new Map(rubric.dimensions.map((dim) => [dim.id, dim.max_score]));

const entries = await listAssetEntries();
assert(entries.length > 0, "No assets found");

for (const entry of entries) {
  const manifest = entry.manifest;
  const summary = (await getAssetSummary({ asset_id: manifest.asset_id })) as Summary;
  const research = await getAssetResearch({ asset_id: manifest.asset_id });

  assert(summary.asset_id === manifest.asset_id, `${manifest.slug}: summary asset_id mismatch`);
  assert(summary.symbol === manifest.symbol, `${manifest.slug}: summary symbol mismatch`);
  assert(summary.rubric.version === manifest.rubric_version, `${manifest.slug}: rubric version mismatch`);
  assert(summary.rubric.max_score === rubric.max_score, `${manifest.slug}: rubric max_score mismatch`);
  assert(research.markdown.length > 500, `${manifest.slug}: research markdown is unexpectedly short`);

  const seen = new Set<string>();
  let score = 0;
  for (const dimension of summary.dimensions) {
    assert(!seen.has(dimension.id), `${manifest.slug}: duplicate dimension ${dimension.id}`);
    seen.add(dimension.id);
    const expectedMax = rubricDimensionMax.get(dimension.id);
    assert(expectedMax !== undefined, `${manifest.slug}: unknown rubric dimension ${dimension.id}`);
    assert(dimension.max_score === expectedMax, `${manifest.slug}: dimension ${dimension.id} max_score mismatch`);
    assert(dimension.score >= 0, `${manifest.slug}: negative score for ${dimension.id}`);
    assert(dimension.score <= dimension.max_score, `${manifest.slug}: score exceeds max for ${dimension.id}`);
    score += dimension.score;
  }

  assert(seen.size === rubric.dimensions.length, `${manifest.slug}: expected ${rubric.dimensions.length} dimensions, got ${seen.size}`);
  assert(score === summary.rubric.score, `${manifest.slug}: dimension score sum ${score} != summary score ${summary.rubric.score}`);
  assert(Array.isArray(summary.blocking_unknowns), `${manifest.slug}: blocking_unknowns must be an array`);
  assert(summary.blocking_unknowns.length > 0, `${manifest.slug}: expected blocking unknowns for review-required seed assets`);

  if (manifest.asset_type === "pendle_pt") {
    assert(summary.return_profile, `${manifest.slug}: PT summary must include return_profile`);
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      rubric: rubric.version,
      assets: entries.map((entry) => entry.manifest.slug),
    },
    null,
    2,
  ),
);
