import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AssetLookupArgs, AssetManifest, AssetRegistryEntry, AssetResearchResult } from "./types.js";

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

export async function getAssetSummary(args: AssetLookupArgs): Promise<unknown> {
  const entry = await resolveAsset(args);
  return readJsonFile(path.join(entry.directory, entry.manifest.summary_path));
}

export async function getAssetResearch(args: AssetLookupArgs): Promise<AssetResearchResult> {
  const entry = await resolveAsset(args);
  const markdown = await readFile(path.join(entry.directory, entry.manifest.research_path), "utf8");
  return { manifest: entry.manifest, markdown };
}
