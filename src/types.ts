export type AssetType = "token" | "pendle_pt";

export interface AssetManifest {
  asset_id: string;
  slug: string;
  asset_type: AssetType;
  symbol: string;
  display_name: string;
  chain: string;
  chain_id: number;
  aliases?: string[];
  rubric_version: string;
  summary_path: string;
  research_path: string;
  address?: string;
  market_address?: string;
  pt_address?: string;
  sy_address?: string;
  yt_address?: string;
  underlying_asset_id?: string;
}

export interface AssetLookupArgs {
  asset_id?: string;
  symbol?: string;
}

export type PublicAssetToolName = "get_asset_summary" | "get_asset_research";

export interface AssetMethodCallExample {
  purpose: string;
  tool: PublicAssetToolName;
  arguments: AssetLookupArgs;
}

export interface AssetMethodUsageGuide {
  purpose: string;
  no_runtime_discovery: string;
  summary_tool: string;
  research_tool: string;
  if_agent_knows_symbol: string;
  if_agent_knows_address: string;
  accepted_address_fields: string[];
  lookup_resolution: string;
  examples: AssetMethodCallExample[];
}

export interface AssetListItem {
  asset_id: string;
  slug: string;
  asset_type: AssetType;
  symbol: string;
  display_name: string;
  chain: string;
  chain_id: number;
  underlying_asset_id?: string;
  addresses: {
    token_address?: string;
    market_address?: string;
    pt_address?: string;
    sy_address?: string;
    yt_address?: string;
  };
  aliases: string[];
  accepted_lookup_values: string[];
  recommended_calls: AssetMethodCallExample[];
}

export interface AvailableAssetsResult {
  endpoint: "list_available_assets";
  available_asset_count: number;
  usage: AssetMethodUsageGuide;
  assets: AssetListItem[];
}

export type EvidencePointer = string | { source: string; quote?: string };

export interface RubricScoringOption {
  id: string;
  condition: string;
  score_range: [number, number];
  score_band: string;
  default_status: string;
  default_evidence_state: string;
}

export interface RubricDimensionDefinition {
  id: string;
  question: string;
  max_score: number;
  options: RubricScoringOption[];
}

export interface RubricDefinition {
  version: string;
  max_score: number;
  dimensions: RubricDimensionDefinition[];
}

export interface DimensionPossibleGrade extends RubricScoringOption {
  is_selected: boolean;
  relation_to_selected: "lower_score" | "selected" | "higher_score";
}

export interface AssetSummaryDimension {
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
  possible_grades?: DimensionPossibleGrade[];
}

export interface AssetSummaryScoringHelper {
  purpose: string;
  use_as: string;
  rubric_version: string;
  rubric_max_score: number;
  note: string;
  possible_grades_location: "dimensions[].possible_grades";
}

export type AssetReturnContextKind = "direct_or_variable_token_return" | "fixed_maturity_pt_return";

export type QuantitativeRiskReturnLayer = Record<string, unknown>;
export type SocialResearchLayer = Record<string, unknown>;
export type PtReturnProfile = Record<string, unknown>;

export interface AssetReturnContext {
  kind: AssetReturnContextKind;
  source_basis: "full_local_research_package";
  source_fields: string[];
  summary_mode?: string;
  display?: string;
  token_return_estimate?: SimpleTokenReturnEstimate;
  pt_return_profile?: PtReturnProfile;
  quantitative_risk_return_layer?: QuantitativeRiskReturnLayer;
  social_research_layer?: SocialResearchLayer;
  notes: string[];
}

export interface AssetSummary extends Record<string, unknown> {
  summary_schema_version: string;
  asset_id: string;
  asset_type: AssetType;
  symbol: string;
  rubric: {
    version: string;
    score: number;
    max_score: number;
    decision_class: string;
    [key: string]: unknown;
  };
  dimensions: AssetSummaryDimension[];
  scoring_helper?: AssetSummaryScoringHelper;
  return_context?: AssetReturnContext;
}

export type PointsThesisKind = "fresh_quant_farming_thesis" | "no_confirmed_points_program";

export interface PointsFarmingThesis {
  kind: PointsThesisKind;
  as_of: string;
  program: string;
  route: string;
  formula: string;
  freshness_status: string;
  confidence: string;
  route_multiplier?: number;
  program_allocation_pct_of_supply?: number;
  program_allocation_tokens?: string;
  program_allocation_status?: string;
  season_start?: string;
  season_end?: string;
  season_days?: number;
  remaining_days?: number;
  remaining_season_fraction?: number;
  fdv_scenarios_usd?: { low: number; base: number; high: number };
  raw_tvl_proxy_usd?: number;
  raw_tvl_proxy_source?: string;
  weighted_denominator_scenario_method?: string;
  weighted_denominator_multipliers?: { low: number; base: number; high: number };
  weighted_denominator_scenarios_usd?: { low: number; base: number; high: number };
  roi_scenarios_over_horizon?: { low: number; base: number; high: number };
}

export interface SimpleTokenReturnEstimate {
  scope: string;
  horizon_days: number;
  organic_yield_apy_estimate: number;
  organic_yield_apy_range_estimate: [number, number];
  organic_roi_over_horizon: number;
  estimated_points_roi_over_horizon: number;
  estimated_points_annualized_return: number;
  points_program: string;
  points_roi_scenarios_over_horizon: { low: number; base: number; high: number };
  expected_loss_prior: number;
  expected_loss_prior_scenarios: { low: number; base: number; high: number };
  exit_cost_assumption: number;
  risk_adjusted_roi_before_points: number;
  risk_adjusted_roi_after_base_points: number;
  risk_adjusted_roi_scenarios_after_base_points: { low_loss: number; base: number; high_loss: number };
  risk_adjusted_annualized_return_after_base_points: number;
  underwriting_hurdle_net_annualized: number;
  method: string;
  basis: string;
  confidence: string;
  evidence: string[];
  points_thesis_kind: PointsThesisKind;
  points_farming_thesis: PointsFarmingThesis;
}

export interface AssetResearchResult {
  manifest: AssetManifest;
  markdown: string;
  return_context?: AssetReturnContext;
  simple_token_return_display?: string;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
}

export interface AssetRegistryEntry {
  manifest: AssetManifest;
  directory: string;
}
