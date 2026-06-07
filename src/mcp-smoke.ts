import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface JsonRpcResponse {
  id?: number;
  result?: {
    tools?: Array<{ name: string }>;
    content?: Array<{ type: string; text: string }>;
  };
  error?: unknown;
}

type SummaryDimension = {
  id: string;
  score: number;
  max_score: number;
  score_band: string;
  status: string;
  evidence_state: string;
};

type Summary = {
  summary_schema_version: string;
  symbol: string;
  rubric: { score: number; score_label: string; score_status: string; decision_class: string };
  dimensions: SummaryDimension[];
  return_profile?: { gross_roi?: number; compound_gross_apy?: number };
  quantitative_risk_return_layer?: {
    points_roi_required_to_clear_hurdle?: number;
    conclusion?: string;
  };
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = resolve(projectRoot, "dist", "server.js");
const child = spawn(process.execPath, [serverPath], {
  cwd: projectRoot,
  stdio: ["pipe", "pipe", "pipe"],
});

let stdoutBuffer = "";
let stderrBuffer = "";
const responses: JsonRpcResponse[] = [];

child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk: string) => {
  stdoutBuffer += chunk;
  let newlineIndex = stdoutBuffer.indexOf("\n");
  while (newlineIndex !== -1) {
    const line = stdoutBuffer.slice(0, newlineIndex).trim();
    stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);
    if (line) responses.push(JSON.parse(line) as JsonRpcResponse);
    newlineIndex = stdoutBuffer.indexOf("\n");
  }
});
child.stderr.on("data", (chunk: string) => {
  stderrBuffer += chunk;
});

function send(message: unknown): void {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function responseById(id: number): JsonRpcResponse | undefined {
  return responses.find((response) => response.id === id);
}

function parseSummary(id: number, label: string): Summary {
  const response = responseById(id);
  const text = response?.result?.content?.[0]?.text;
  assert(text, `${label} get_asset_summary failed: ${JSON.stringify(response?.error)}`);
  return JSON.parse(text) as Summary;
}

function parseResearch(id: number, label: string): string {
  const response = responseById(id);
  const text = response?.result?.content?.[0]?.text;
  assert(text, `${label} get_asset_research failed: ${JSON.stringify(response?.error)}`);
  return text;
}

send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "front-asset-intel-mcp-smoke", version: "0.1.0" },
  },
});
send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });

const summaryLookups = [
  { id: 3, label: "apxUSD", symbol: "apxUSD", expectedSymbol: "apxUSD", expectedScore: 49 },
  { id: 4, label: "apyUSD", symbol: "apyUSD", expectedSymbol: "apyUSD", expectedScore: 35 },
  { id: 5, label: "PRIME", symbol: "PRIME", expectedSymbol: "PRIME", expectedScore: 41 },
  { id: 6, label: "deSPXA", symbol: "deSPXA", expectedSymbol: "deSPXA", expectedScore: 44 },
  { id: 7, label: "USDat", symbol: "USDat", expectedSymbol: "USDat", expectedScore: 52 },
  { id: 8, label: "sUSDat", symbol: "sUSDat", expectedSymbol: "sUSDat", expectedScore: 40 },
  {
    id: 9,
    label: "PT-apxUSD",
    symbol: "PT-apxUSD",
    expectedSymbol: "PT-apxUSD-2026-11-05",
    expectedScore: 49,
    expectedCompoundGrossApy: 0.2168,
    expectedPointsHurdle: 0.004671,
  },
  {
    id: 10,
    label: "PT-apyUSD",
    symbol: "PT-apyUSD",
    expectedSymbol: "PT-apyUSD-2026-08-27",
    expectedScore: 35,
    expectedCompoundGrossApy: 0.176,
    expectedPointsHurdle: 0.056168,
  },
  {
    id: 11,
    label: "PT-USDat",
    symbol: "PT-USDat",
    expectedSymbol: "PT-USDat-2026-08-27",
    expectedScore: 52,
    expectedCompoundGrossApy: 0.0898,
    expectedPointsHurdle: 0.014993,
  },
  {
    id: 12,
    label: "PT-sUSDat",
    symbol: "PT-sUSDat",
    expectedSymbol: "PT-sUSDat-2026-08-27",
    expectedScore: 40,
    expectedCompoundGrossApy: 0.3364,
    expectedPointsHurdle: 0.043075,
  },
];

for (const lookup of summaryLookups) {
  send({
    jsonrpc: "2.0",
    id: lookup.id,
    method: "tools/call",
    params: {
      name: "get_asset_summary",
      arguments: { symbol: lookup.symbol },
    },
  });
}

send({
  jsonrpc: "2.0",
  id: 13,
  method: "tools/call",
  params: {
    name: "get_asset_research",
    arguments: { symbol: "PT-apyUSD" },
  },
});
send({
  jsonrpc: "2.0",
  id: 14,
  method: "tools/call",
  params: {
    name: "get_asset_research",
    arguments: { symbol: "PT-USDat" },
  },
});
send({
  jsonrpc: "2.0",
  id: 15,
  method: "tools/call",
  params: {
    name: "get_asset_research",
    arguments: { symbol: "PT-sUSDat" },
  },
});

const expectedResponseCount = 15;
const deadline = Date.now() + 5000;
while (Date.now() < deadline && responses.filter((response) => response.id !== undefined).length < expectedResponseCount) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 25));
}

child.kill("SIGTERM");

const initialize = responseById(1);
const tools = responseById(2);

assert(initialize?.result, `initialize failed: ${JSON.stringify(initialize?.error)}`);
assert(tools?.result?.tools, `tools/list failed: ${JSON.stringify(tools?.error)}`);
const toolNames = tools.result.tools.map((tool) => tool.name).sort();
assert(toolNames.includes("get_asset_summary"), "get_asset_summary missing from tools/list");
assert(toolNames.includes("get_asset_research"), "get_asset_research missing from tools/list");

const parsedSummaries: Record<string, Summary> = {};
for (const lookup of summaryLookups) {
  const summary = parseSummary(lookup.id, lookup.label);
  parsedSummaries[lookup.label] = summary;
  assert(summary.symbol === lookup.expectedSymbol, `${lookup.label} summary lookup returned wrong symbol`);
  assert(summary.summary_schema_version === "asset_summary_v1.1", `${lookup.label} summary schema version missing`);
  assert(summary.rubric.score === lookup.expectedScore, `${lookup.label} summary score changed`);
  assert(summary.rubric.score_label === "asset_quality_evidence_score", `${lookup.label} score label missing`);
  assert(summary.rubric.score_status === "precomputed", `${lookup.label} score status missing`);
  assert(summary.dimensions.length === 7, `${lookup.label} expected seven rubric dimensions`);
  for (const dimension of summary.dimensions) {
    assert(typeof dimension.score === "number", `${lookup.label} dimension ${dimension.id} missing score`);
    assert(typeof dimension.max_score === "number", `${lookup.label} dimension ${dimension.id} missing max_score`);
    assert(dimension.score_band, `${lookup.label} dimension ${dimension.id} missing score_band`);
    assert(dimension.status, `${lookup.label} dimension ${dimension.id} missing status`);
    assert(dimension.evidence_state, `${lookup.label} dimension ${dimension.id} missing evidence_state`);
  }
  if (lookup.label === "USDat") {
    const byId = Object.fromEntries(summary.dimensions.map((dimension) => [dimension.id, dimension]));
    assert(byId.redemption_holder_eligibility?.status === "block_automation", "USDat redemption status should block automation");
    assert(byId.oracle_accounting_alignment?.score_band === "strong", "USDat oracle score band should be strong");
  }
  if (lookup.label === "apyUSD") {
    const byId = Object.fromEntries(summary.dimensions.map((dimension) => [dimension.id, dimension]));
    assert(byId.oracle_accounting_alignment?.status === "cannot_underwrite", "apyUSD oracle status should block underwriting");
    assert(byId.incidents_social_stress?.evidence_state === "negative_evidence", "apyUSD incident evidence state should flag negative evidence");
  }
  if (lookup.expectedCompoundGrossApy !== undefined) {
    assert(
      summary.return_profile?.compound_gross_apy === lookup.expectedCompoundGrossApy,
      `${lookup.label} return_profile missing expected APY`,
    );
  }
  if (lookup.expectedPointsHurdle !== undefined) {
    assert(
      summary.quantitative_risk_return_layer?.points_roi_required_to_clear_hurdle === lookup.expectedPointsHurdle,
      `${lookup.label} quantitative overlay missing points hurdle`,
    );
  }
}

const ptApyResearchText = parseResearch(13, "PT-apyUSD");
assert(ptApyResearchText.includes("5.6168%"), "PT-apyUSD research markdown missing points hurdle text");
assert(ptApyResearchText.includes("points / recovery trade"), "PT-apyUSD research markdown missing decision conclusion");

const ptUsdatResearchText = parseResearch(14, "PT-USDat");
assert(ptUsdatResearchText.includes("1.4993%"), "PT-USDat research markdown missing points hurdle text");
assert(ptUsdatResearchText.includes("stable-price / low-return candidate"), "PT-USDat research markdown missing decision conclusion");

const ptSusdatResearchText = parseResearch(15, "PT-sUSDat");
assert(ptSusdatResearchText.includes("4.3075%"), "PT-sUSDat research markdown missing points hurdle text");
assert(ptSusdatResearchText.includes("STRC/NAV/queue expected loss"), "PT-sUSDat research markdown missing decision conclusion");

console.log(
  JSON.stringify(
    {
      ok: true,
      tools: toolNames,
      summaries: Object.fromEntries(
        Object.entries(parsedSummaries).map(([label, summary]) => [
          label,
          {
            symbol: summary.symbol,
            score: summary.rubric.score,
            score_label: summary.rubric.score_label,
            decision_class: summary.rubric.decision_class,
            dimensions_with_status: summary.dimensions.length,
            blocking_dimensions: summary.dimensions
              .filter((dimension) => dimension.status === "block_automation" || dimension.status === "cannot_underwrite")
              .map((dimension) => `${dimension.id}:${dimension.score}/${dimension.max_score}:${dimension.status}`),
            compound_gross_apy: summary.return_profile?.compound_gross_apy,
            points_roi_required_to_clear_hurdle:
              summary.quantitative_risk_return_layer?.points_roi_required_to_clear_hurdle,
          },
        ]),
      ),
      research_chars: {
        pt_apyUSD: ptApyResearchText.length,
        pt_USDat: ptUsdatResearchText.length,
        pt_sUSDat: ptSusdatResearchText.length,
      },
      stderr: stderrBuffer,
    },
    null,
    2,
  ),
);
