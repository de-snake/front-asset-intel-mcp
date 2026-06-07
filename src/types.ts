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
  source_front_kb_paths?: string[];
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
}

export interface AssetResearchResult {
  manifest: AssetManifest;
  markdown: string;
  simple_token_return_display?: string;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
}

export interface AssetRegistryEntry {
  manifest: AssetManifest;
  directory: string;
}
