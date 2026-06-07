import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AssetListItem,
  AssetLookupArgs,
  AssetManifest,
  AssetRegistryEntry,
  AssetResearchResult,
  AssetReturnContext,
  AssetSummary,
  AssetSummaryDimension,
  AvailableAssetsResult,
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

function addLookupValue(values: Set<string>, value: string | undefined): void {
  if (value?.trim()) values.add(value.trim());
}

function addressLookupValues(manifest: AssetManifest): string[] {
  const values = new Set<string>();
  for (const address of [manifest.address, manifest.market_address, manifest.pt_address]) {
    addLookupValue(values, address);
    if (address) addLookupValue(values, `${manifest.chain}:${address}`);
  }
  return Array.from(values);
}

function manifestLookupValues(manifest: AssetManifest): string[] {
  const values = new Set<string>();
  addLookupValue(values, manifest.asset_id);
  addLookupValue(values, manifest.slug);
  addLookupValue(values, manifest.symbol);
  addLookupValue(values, manifest.display_name);

  for (const value of addressLookupValues(manifest)) addLookupValue(values, value);
  for (const alias of manifest.aliases ?? []) addLookupValue(values, alias);

  return Array.from(values);
}

function manifestLookupKeys(manifest: AssetManifest): string[] {
  return manifestLookupValues(manifest).map(normalizeLookupKey);
}

function preferredAddressLookup(manifest: AssetManifest): string | undefined {
  return manifest.address ?? manifest.market_address ?? manifest.pt_address;
}

function toAssetListItem(manifest: AssetManifest): AssetListItem {
  const preferredAddress = preferredAddressLookup(manifest);
  const recommended_calls: AssetListItem["recommended_calls"] = [
    {
      purpose: "Compact scoring / table / routing decision surface by known symbol",
      tool: "get_asset_summary" as const,
      arguments: { symbol: manifest.symbol },
    },
    {
      purpose: "Full Markdown source report by known symbol",
      tool: "get_asset_research" as const,
      arguments: { symbol: manifest.symbol },
    },
  ];

  if (preferredAddress) {
    recommended_calls.push(
      {
        purpose: "Compact scoring / table / routing decision surface by known address",
        tool: "get_asset_summary" as const,
        arguments: { asset_id: preferredAddress },
      },
      {
        purpose: "Full Markdown source report by known address",
        tool: "get_asset_research" as const,
        arguments: { asset_id: preferredAddress },
      },
    );
  }

  return {
    asset_id: manifest.asset_id,
    slug: manifest.slug,
    asset_type: manifest.asset_type,
    symbol: manifest.symbol,
    display_name: manifest.display_name,
    chain: manifest.chain,
    chain_id: manifest.chain_id,
    underlying_asset_id: manifest.underlying_asset_id,
    addresses: {
      token_address: manifest.address,
      market_address: manifest.market_address,
      pt_address: manifest.pt_address,
      sy_address: manifest.sy_address,
      yt_address: manifest.yt_address,
    },
    aliases: manifest.aliases ?? [],
    accepted_lookup_values: manifestLookupValues(manifest),
    recommended_calls,
  };
}

export async function getAvailableAssets(): Promise<AvailableAssetsResult> {
  const assets = (await listAssets()).map(toAssetListItem);
  return {
    endpoint: "list_available_assets",
    available_asset_count: assets.length,
    usage: {
      purpose:
        "Discovery endpoint for agents before calling asset intelligence tools. Use it to see which static, precomputed assets this MCP can answer about and which lookup strings are accepted.",
      no_runtime_discovery:
        "The server only serves local precomputed data. If an address or symbol is not listed here, get_asset_summary/get_asset_research cannot dynamically fetch or score it.",
      summary_tool:
        "Call get_asset_summary for compact JSON: rubric score, agent_display table fields, blockers, normalized return_context, and scoring-helper grade anchors.",
      research_tool:
        "Call get_asset_research for the full Markdown source report plus the same normalized return_context inline for auditability.",
      if_agent_knows_symbol:
        "Pass the known symbol or alias in the symbol argument, e.g. {\"symbol\":\"USDat\"} or {\"symbol\":\"PT-USDat\"}.",
      if_agent_knows_address:
        "Pass the known token address, Pendle market address, PT address, chain-prefixed address, canonical asset_id, or slug in the asset_id argument, e.g. {\"asset_id\":\"0x9afe7a057a09cf5da748d952078c9c99938b4329\"}.",
      accepted_address_fields: ["address", "market_address", "pt_address"],
      lookup_resolution:
        "Lookup is case-insensitive and exact over asset_id, slug, symbol, display_name, aliases, token address, market address, PT address, and chain-prefixed forms like ethereum:0x....",
      examples: [
        {
          purpose: "Summary by symbol when the agent already knows the ticker",
          tool: "get_asset_summary",
          arguments: { symbol: "USDat" },
        },
        {
          purpose: "Research by symbol when source context is needed",
          tool: "get_asset_research",
          arguments: { symbol: "USDat" },
        },
        {
          purpose: "Summary by known raw token/market/PT address",
          tool: "get_asset_summary",
          arguments: { asset_id: "0x9afe7a057a09cf5da748d952078c9c99938b4329" },
        },
        {
          purpose: "Research by known chain-prefixed asset id/address",
          tool: "get_asset_research",
          arguments: { asset_id: "ethereum:0x23238f20b894f29041f48d88ee91131c395aaa71" },
        },
      ],
    },
    assets,
  };
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
