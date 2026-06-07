import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AssetLookupArgs,
  AssetManifest,
  AssetRegistryEntry,
  AssetResearchResult,
  AssetReturnContext,
  AssetSummary,
  AssetSummaryDimension,
  DimensionPossibleGrade,
  QuantitativeRiskReturnLayer,
  RubricDefinition,
  RubricScoringOption,
  SocialResearchLayer,
  SimpleTokenReturnEstimate,
} from "./types.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_ROOT = path.join(PROJECT_ROOT, "data");
const ASSET_ROOT = path.join(DATA_ROOT, "assets");

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function listAssetEntries(): Promise<AssetRegistryEntry[]> {
  const directories = await readdir(ASSET_ROOT, { withFileTypes: true });
  const entries: AssetRegistryEntry[] = [];

  for (const dirent of directories) {
    if (!dirent.isDirectory()) continue;
    const directory = path.join(ASSET_ROOT, dirent.name);
    const manifestPath = path.join(directory, "manifest.json");
    const manifest = await readJsonFile<AssetManifest>(manifestPath);
    entries.push({ manifest, directory });
  }

  return entries.sort((a, b) => a.manifest.slug.localeCompare(b.manifest.slug));
}

export async function listAssets(): Promise<AssetManifest[]> {
  return (await listAssetEntries()).map((entry) => entry.manifest);
}

function manifestLookupKeys(manifest: AssetManifest): string[] {
  const keys = new Set<string>();
  keys.add(manifest.asset_id);
  keys.add(manifest.slug);
  keys.add(manifest.symbol);
  keys.add(manifest.display_name);

  if (manifest.address) keys.add(manifest.address);
  if (manifest.market_address) keys.add(manifest.market_address);
  if (manifest.pt_address) keys.add(manifest.pt_address);
  for (const alias of manifest.aliases ?? []) keys.add(alias);

  return Array.from(keys).map(normalizeLookupKey);
}

export async function resolveAsset(args: AssetLookupArgs): Promise<AssetRegistryEntry> {
  const requested = args.asset_id ?? args.symbol;
  if (!requested?.trim()) {
    const available = (await listAssets()).map((asset) => `${asset.symbol} (${asset.asset_id})`).join(", ");
    throw new Error(`Provide asset_id or symbol. Available assets: ${available}`);
  }

  const lookupKey = normalizeLookupKey(requested);
  const entries = await listAssetEntries();
  const matches = entries.filter((entry) => manifestLookupKeys(entry.manifest).includes(lookupKey));

  if (matches.length === 1) return matches[0]!;

  if (matches.length > 1) {
    throw new Error(
      `Ambiguous asset lookup '${requested}'. Use one of: ${matches
        .map((entry) => `${entry.manifest.symbol}=${entry.manifest.asset_id}`)
        .join(", ")}`,
    );
  }

  const available = entries.map((entry) => `${entry.manifest.symbol} (${entry.manifest.asset_id})`).join(", ");
  throw new Error(`Unknown asset '${requested}'. Available assets: ${available}`);
}

export async function getAssetSummary(args: AssetLookupArgs): Promise<AssetSummary> {
  const entry = await resolveAsset(args);
  const summary = await readJsonFile<AssetSummary>(path.join(entry.directory, entry.manifest.summary_path));
  const rubricVersion = summary.rubric?.version ?? entry.manifest.rubric_version;
  const rubric = await readJsonFile<RubricDefinition>(path.join(DATA_ROOT, "rubrics", `${rubricVersion}.json`));
  return attachReturnContext(attachScoringHelper(summary, rubric));
}

function relationToSelected(option: RubricScoringOption, dimension: AssetSummaryDimension): DimensionPossibleGrade["relation_to_selected"] {
  if (option.id === dimension.selected_option) return "selected";
  if (option.score_range[1] < dimension.score) return "lower_score";
  return "higher_score";
}

function attachScoringHelper(summary: AssetSummary, rubric: RubricDefinition): AssetSummary {
  const rubricDimensions = new Map(rubric.dimensions.map((dimension) => [dimension.id, dimension]));
  const dimensions = summary.dimensions.map((dimension) => {
    const rubricDimension = rubricDimensions.get(dimension.id);
    if (!rubricDimension) return dimension;

    const possible_grades: DimensionPossibleGrade[] = rubricDimension.options.map((option) => ({
      ...option,
      is_selected: option.id === dimension.selected_option,
      relation_to_selected: relationToSelected(option, dimension),
    }));

    return {
      ...dimension,
      possible_grades,
    };
  });

  return {
    ...summary,
    dimensions,
    scoring_helper: {
      purpose: "Let downstream analyst agents use this asset summary as a scoring helper, not just a terse score. Each dimension keeps the asset-specific answer beside all fixed rubric grade buckets so the agent can see what a lower, selected, or higher-quality state would look like.",
      use_as:
        "Use the pre-scored dimension score as canonical unless explicitly rescoring. Use dimensions[].possible_grades as comparative anchors when explaining why the asset lands in the selected bucket or what evidence would move it up/down.",
      rubric_version: rubric.version,
      rubric_max_score: rubric.max_score,
      note: "possible_grades are static rubric anchors loaded from data/rubrics; they do not add new evidence and they do not regenerate scores at runtime.",
      possible_grades_location: "dimensions[].possible_grades",
    },
  };
}

type SummaryWithReturnInputs = AssetSummary & {
  agent_display?: {
    score_display?: string;
    simple_token_return_display?: string;
    simple_token_return_estimate?: SimpleTokenReturnEstimate;
    fixed_return_metrics?: Record<string, unknown>;
  };
  return_profile?: Record<string, unknown>;
  quantitative_risk_return_layer?: QuantitativeRiskReturnLayer;
  social_research_layer?: SocialResearchLayer;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
  summary_mode?: string;
};

function attachReturnContext(summary: AssetSummary): AssetSummary {
  const withInputs = summary as SummaryWithReturnInputs;
  const return_context = buildReturnContext(withInputs);
  if (!return_context) return summary;
  return { ...summary, return_context };
}

function buildReturnContext(summary: SummaryWithReturnInputs): AssetReturnContext | undefined {
  const sourceFields = ["agent_display", "quantitative_risk_return_layer", "social_research_layer"];
  const common = {
    source_basis: "full_local_research_package" as const,
    summary_mode: summary.summary_mode,
    quantitative_risk_return_layer: summary.quantitative_risk_return_layer,
    social_research_layer: summary.social_research_layer,
  };

  if (summary.asset_type === "pendle_pt") {
    if (!summary.return_profile) return undefined;
    return {
      kind: "fixed_maturity_pt_return",
      ...common,
      source_fields: ["return_profile", ...sourceFields, "agent_display.fixed_return_metrics"],
      display: summary.agent_display?.score_display,
      pt_return_profile: summary.return_profile,
      notes: [
        "PT ROI is the fixed discount-to-maturity return against the accounting asset, then adjusted by expected-loss and exit-cost assumptions.",
        "Variable yield and incentive economics belong to the separated YT leg and are not part of the PT-holder base return.",
        "Social/X and quantitative overlays are included when present because they can change the underwriting view even if the fixed-return arithmetic is unchanged.",
      ],
    };
  }

  const tokenEstimate = summary.simple_token_return_estimate ?? summary.agent_display?.simple_token_return_estimate;
  if (!tokenEstimate) return undefined;
  return {
    kind: "direct_or_variable_token_return",
    ...common,
    source_fields: ["simple_token_return_estimate", ...sourceFields, "agent_display.simple_token_return_display"],
    display: summary.agent_display?.simple_token_return_display,
    token_return_estimate: tokenEstimate,
    notes: [
      "Direct/non-PT ROI combines organic or variable token return, fresh-farming points value when quantitatively modeled, expected-loss prior, and exit-cost assumptions.",
      "Risk-adjusted ROI uses the same formula and horizon in summary JSON and research output; the research report below remains the source context for audit details.",
      "Social/X and quantitative overlays are included when present because they can change the expected-loss or automation decision even when the visible ROI line is unchanged.",
    ],
  };
}

type SummaryWithSimpleTokenReturnEstimate = {
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
  agent_display?: {
    simple_token_return_display?: string;
    simple_token_return_estimate?: SimpleTokenReturnEstimate;
  };
};

export async function getAssetResearch(args: AssetLookupArgs): Promise<AssetResearchResult> {
  const entry = await resolveAsset(args);
  const [markdown, summary] = await Promise.all([
    readFile(path.join(entry.directory, entry.manifest.research_path), "utf8"),
    getAssetSummary({ asset_id: entry.manifest.asset_id }),
  ]);
  const withEstimate = summary as SummaryWithSimpleTokenReturnEstimate;
  return {
    manifest: entry.manifest,
    markdown,
    return_context: summary.return_context,
    simple_token_return_display: withEstimate.agent_display?.simple_token_return_display,
    simple_token_return_estimate: withEstimate.simple_token_return_estimate ?? withEstimate.agent_display?.simple_token_return_estimate,
  };
}
