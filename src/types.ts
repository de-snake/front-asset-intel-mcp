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

export interface AssetResearchResult {
  manifest: AssetManifest;
  markdown: string;
}

export interface AssetRegistryEntry {
  manifest: AssetManifest;
  directory: string;
}
