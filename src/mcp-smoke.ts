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
send({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "get_asset_summary",
    arguments: { symbol: "PT-apxUSD" },
  },
});
send({
  jsonrpc: "2.0",
  id: 4,
  method: "tools/call",
  params: {
    name: "get_asset_summary",
    arguments: { symbol: "PT-apyUSD" },
  },
});
send({
  jsonrpc: "2.0",
  id: 5,
  method: "tools/call",
  params: {
    name: "get_asset_research",
    arguments: { symbol: "PT-apyUSD" },
  },
});

const deadline = Date.now() + 5000;
while (Date.now() < deadline && responses.filter((response) => response.id !== undefined).length < 5) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 25));
}

child.kill("SIGTERM");

const byId = new Map(responses.filter((response) => response.id !== undefined).map((response) => [response.id, response]));
const initialize = byId.get(1);
const tools = byId.get(2);
const ptApxSummary = byId.get(3);
const ptApySummary = byId.get(4);
const ptApyResearch = byId.get(5);

assert(initialize?.result, `initialize failed: ${JSON.stringify(initialize?.error)}`);
assert(tools?.result?.tools, `tools/list failed: ${JSON.stringify(tools?.error)}`);
const toolNames = tools.result.tools.map((tool) => tool.name).sort();
assert(toolNames.includes("get_asset_summary"), "get_asset_summary missing from tools/list");
assert(toolNames.includes("get_asset_research"), "get_asset_research missing from tools/list");

const ptApxSummaryText = ptApxSummary?.result?.content?.[0]?.text;
assert(ptApxSummaryText, `get_asset_summary PT-apxUSD failed: ${JSON.stringify(ptApxSummary?.error)}`);
const ptApxSummaryJson = JSON.parse(ptApxSummaryText);
assert(ptApxSummaryJson.symbol === "PT-apxUSD-2026-11-05", "PT-apxUSD summary lookup returned wrong symbol");
assert(ptApxSummaryJson.return_profile?.compound_gross_apy === 0.2168, "PT-apxUSD return_profile missing expected APY");
assert(
  ptApxSummaryJson.quantitative_risk_return_layer?.points_roi_required_to_clear_hurdle === 0.004671,
  "PT-apxUSD quantitative overlay missing points hurdle",
);

const ptApySummaryText = ptApySummary?.result?.content?.[0]?.text;
assert(ptApySummaryText, `get_asset_summary PT-apyUSD failed: ${JSON.stringify(ptApySummary?.error)}`);
const ptApySummaryJson = JSON.parse(ptApySummaryText);
assert(ptApySummaryJson.symbol === "PT-apyUSD-2026-08-27", "PT-apyUSD summary lookup returned wrong symbol");
assert(ptApySummaryJson.return_profile?.compound_gross_apy === 0.176, "PT-apyUSD return_profile missing expected APY");
assert(
  ptApySummaryJson.quantitative_risk_return_layer?.points_roi_required_to_clear_hurdle === 0.056168,
  "PT-apyUSD quantitative overlay missing points hurdle",
);

const ptApyResearchText = ptApyResearch?.result?.content?.[0]?.text;
assert(ptApyResearchText, `get_asset_research PT-apyUSD failed: ${JSON.stringify(ptApyResearch?.error)}`);
assert(ptApyResearchText.includes("5.6168%"), "PT-apyUSD research markdown missing points hurdle text");
assert(ptApyResearchText.includes("points / recovery trade"), "PT-apyUSD research markdown missing decision conclusion");

console.log(
  JSON.stringify(
    {
      ok: true,
      tools: toolNames,
      pt_apx_summary: {
        symbol: ptApxSummaryJson.symbol,
        score: ptApxSummaryJson.rubric.score,
        decision_class: ptApxSummaryJson.rubric.decision_class,
        compound_gross_apy: ptApxSummaryJson.return_profile.compound_gross_apy,
        points_roi_required_to_clear_hurdle:
          ptApxSummaryJson.quantitative_risk_return_layer.points_roi_required_to_clear_hurdle,
      },
      pt_apy_summary: {
        symbol: ptApySummaryJson.symbol,
        score: ptApySummaryJson.rubric.score,
        decision_class: ptApySummaryJson.rubric.decision_class,
        compound_gross_apy: ptApySummaryJson.return_profile.compound_gross_apy,
        points_roi_required_to_clear_hurdle:
          ptApySummaryJson.quantitative_risk_return_layer.points_roi_required_to_clear_hurdle,
        conclusion: ptApySummaryJson.quantitative_risk_return_layer.conclusion,
      },
      pt_apy_research_chars: ptApyResearchText.length,
      stderr: stderrBuffer,
    },
    null,
    2,
  ),
);
