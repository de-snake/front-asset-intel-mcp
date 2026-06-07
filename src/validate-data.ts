import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_ROOT, getAssetResearch, getAssetSummary, listAssetEntries } from "./registry.js";

type RubricOption = {
  id: string;
  score_range: [number, number];
  score_band: string;
  default_status: string;
  default_evidence_state: string;
};
type RubricDimension = { id: string; max_score: number; options: RubricOption[] };
type Rubric = { version: string; max_score: number; dimensions: RubricDimension[] };
type EvidencePointer = string | { source: string; quote?: string };

type SummaryDimension = {
  id: string;
  question: string;
  score: number;
  max_score: number;
  selected_option: string;
  score_band: string;
  status: string;
  evidence_state: string;
  missing_behavior: string;
  answer: string;
  evidence: EvidencePointer[];
  confidence: string;
};
type Summary = {
  summary_schema_version: string;
  asset_id: string;
  symbol: string;
  asset_type: string;
  rubric: {
    version: string;
    score: number;
    max_score: number;
    score_label: string;
    score_meaning: string;
    score_status: string;
    decision_class: string;
  };
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

function evidencePointerHasContent(item: EvidencePointer): boolean {
  if (typeof item === "string") {
    return item.trim().length > 0;
  }
  return typeof item.source === "string" && item.source.trim().length > 0;
}

const rubricPath = path.join(DATA_ROOT, "rubrics", "asset_risk_v1.json");
const rubric = await readJsonFile<Rubric>(rubricPath);
const rubricMax = rubric.dimensions.reduce((sum, dim) => sum + dim.max_score, 0);
assert(rubricMax === rubric.max_score, `Rubric dimension max sum ${rubricMax} != max_score ${rubric.max_score}`);
const rubricDimensionMax = new Map(rubric.dimensions.map((dim) => [dim.id, dim.max_score]));
const rubricDimensionById = new Map(rubric.dimensions.map((dim) => [dim.id, dim]));
const validScoreBands = new Set(["strong", "partial", "weak"]);
const validStatuses = new Set(["usable_for_review", "review_required", "block_automation", "cannot_underwrite"]);
const validDecisionClasses = new Set(["usable_with_live_preview", "review_required", "blocked_or_cannot_underwrite"]);
const validEvidenceStates = new Set(["verified", "partially_supported", "source_inconclusive", "missing_or_unknown", "negative_evidence"]);

for (const dimension of rubric.dimensions) {
  assert(dimension.options.length > 0, `Rubric dimension ${dimension.id} has no options`);
  for (const option of dimension.options) {
    assert(validScoreBands.has(option.score_band), `Rubric option ${option.id}: invalid score_band ${option.score_band}`);
    assert(validStatuses.has(option.default_status), `Rubric option ${option.id}: invalid default_status ${option.default_status}`);
    assert(
      validEvidenceStates.has(option.default_evidence_state),
      `Rubric option ${option.id}: invalid default_evidence_state ${option.default_evidence_state}`,
    );
    assert(option.score_range.length === 2, `Rubric option ${option.id}: score_range must have two values`);
    assert(option.score_range[0] <= option.score_range[1], `Rubric option ${option.id}: invalid score_range`);
    assert(option.score_range[0] >= 0, `Rubric option ${option.id}: score_range below zero`);
    assert(option.score_range[1] <= dimension.max_score, `Rubric option ${option.id}: score_range above dimension max`);
  }
}

const entries = await listAssetEntries();
assert(entries.length > 0, "No assets found");

for (const entry of entries) {
  const manifest = entry.manifest;
  const summary = (await getAssetSummary({ asset_id: manifest.asset_id })) as Summary;
  const research = await getAssetResearch({ asset_id: manifest.asset_id });

  assert(summary.summary_schema_version === "asset_summary_v1.1", `${manifest.slug}: unexpected summary_schema_version`);
  assert(summary.asset_id === manifest.asset_id, `${manifest.slug}: summary asset_id mismatch`);
  assert(summary.symbol === manifest.symbol, `${manifest.slug}: summary symbol mismatch`);
  assert(summary.rubric.version === manifest.rubric_version, `${manifest.slug}: rubric version mismatch`);
  assert(summary.rubric.max_score === rubric.max_score, `${manifest.slug}: rubric max_score mismatch`);
  assert(summary.rubric.score_label === "asset_quality_evidence_score", `${manifest.slug}: rubric score_label mismatch`);
  assert(summary.rubric.score_status === "precomputed", `${manifest.slug}: rubric score_status mismatch`);
  assert(summary.rubric.score_meaning.length > 40, `${manifest.slug}: rubric score_meaning is missing`);
  assert(validDecisionClasses.has(summary.rubric.decision_class), `${manifest.slug}: invalid top-level decision_class`);
  assert(research.markdown.length > 500, `${manifest.slug}: research markdown is unexpectedly short`);

  const seen = new Set<string>();
  let score = 0;
  for (const dimension of summary.dimensions) {
    assert(!seen.has(dimension.id), `${manifest.slug}: duplicate dimension ${dimension.id}`);
    seen.add(dimension.id);
    const expectedMax = rubricDimensionMax.get(dimension.id);
    const rubricDimension = rubricDimensionById.get(dimension.id);
    assert(expectedMax !== undefined, `${manifest.slug}: unknown rubric dimension ${dimension.id}`);
    assert(rubricDimension !== undefined, `${manifest.slug}: unknown rubric dimension ${dimension.id}`);
    assert(dimension.max_score === expectedMax, `${manifest.slug}: dimension ${dimension.id} max_score mismatch`);
    assert(dimension.score >= 0, `${manifest.slug}: negative score for ${dimension.id}`);
    assert(dimension.score <= dimension.max_score, `${manifest.slug}: score exceeds max for ${dimension.id}`);

    const selectedOption = rubricDimension.options.find((option) => option.id === dimension.selected_option);
    assert(selectedOption, `${manifest.slug}: dimension ${dimension.id} selected unknown option ${dimension.selected_option}`);
    const [minScore, maxScore] = selectedOption.score_range;
    assert(
      dimension.score >= minScore && dimension.score <= maxScore,
      `${manifest.slug}: dimension ${dimension.id} score ${dimension.score} outside ${dimension.selected_option} range ${minScore}-${maxScore}`,
    );
    assert(
      dimension.score_band === selectedOption.score_band,
      `${manifest.slug}: dimension ${dimension.id} score_band ${dimension.score_band} != ${selectedOption.score_band}`,
    );
    assert(
      dimension.evidence_state === selectedOption.default_evidence_state,
      `${manifest.slug}: dimension ${dimension.id} evidence_state ${dimension.evidence_state} != ${selectedOption.default_evidence_state}`,
    );
    assert(validStatuses.has(dimension.status), `${manifest.slug}: dimension ${dimension.id} invalid status ${dimension.status}`);
    assert(dimension.status === dimension.missing_behavior, `${manifest.slug}: dimension ${dimension.id} status != missing_behavior`);
    assert(dimension.question.length > 10, `${manifest.slug}: dimension ${dimension.id} missing question`);
    assert(dimension.answer.length > 10, `${manifest.slug}: dimension ${dimension.id} missing answer`);
    assert(Array.isArray(dimension.evidence), `${manifest.slug}: dimension ${dimension.id} evidence must be an array`);
    assert(dimension.evidence.length > 0, `${manifest.slug}: dimension ${dimension.id} missing evidence`);
    assert(dimension.evidence.every(evidencePointerHasContent), `${manifest.slug}: dimension ${dimension.id} has empty evidence item`);
    assert(dimension.confidence.length > 0, `${manifest.slug}: dimension ${dimension.id} missing confidence`);
    score += dimension.score;
  }

  assert(seen.size === rubric.dimensions.length, `${manifest.slug}: expected ${rubric.dimensions.length} dimensions, got ${seen.size}`);
  assert(score === summary.rubric.score, `${manifest.slug}: dimension score sum ${score} != summary score ${summary.rubric.score}`);
  if (score < 40) {
    assert(
      summary.rubric.decision_class === "blocked_or_cannot_underwrite",
      `${manifest.slug}: score below 40 must be blocked_or_cannot_underwrite`,
    );
  }
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
