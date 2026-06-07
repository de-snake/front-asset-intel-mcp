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
    name: "get_asset_research",
    arguments: { symbol: "apxUSD" },
  },
});

const deadline = Date.now() + 5000;
while (Date.now() < deadline && responses.filter((response) => response.id !== undefined).length < 4) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 25));
}

child.kill("SIGTERM");

const byId = new Map(responses.filter((response) => response.id !== undefined).map((response) => [response.id, response]));
const initialize = byId.get(1);
const tools = byId.get(2);
const summary = byId.get(3);
const research = byId.get(4);

assert(initialize?.result, `initialize failed: ${JSON.stringify(initialize?.error)}`);
assert(tools?.result?.tools, `tools/list failed: ${JSON.stringify(tools?.error)}`);
const toolNames = tools.result.tools.map((tool) => tool.name).sort();
assert(toolNames.includes("get_asset_summary"), "get_asset_summary missing from tools/list");
assert(toolNames.includes("get_asset_research"), "get_asset_research missing from tools/list");

const summaryText = summary?.result?.content?.[0]?.text;
assert(summaryText, `get_asset_summary failed: ${JSON.stringify(summary?.error)}`);
const summaryJson = JSON.parse(summaryText);
assert(summaryJson.symbol === "PT-apxUSD-2026-11-05", "PT summary lookup returned wrong symbol");
assert(summaryJson.return_profile?.compound_gross_apy === 0.2168, "PT return_profile missing expected APY");

const researchText = research?.result?.content?.[0]?.text;
assert(researchText, `get_asset_research failed: ${JSON.stringify(research?.error)}`);
assert(researchText.includes("# apyx apxUSD"), "apxUSD research markdown missing expected heading");

console.log(
  JSON.stringify(
    {
      ok: true,
      tools: toolNames,
      pt_summary: {
        symbol: summaryJson.symbol,
        score: summaryJson.rubric.score,
        decision_class: summaryJson.rubric.decision_class,
        compound_gross_apy: summaryJson.return_profile.compound_gross_apy,
      },
      apx_research_chars: researchText.length,
      stderr: stderrBuffer,
    },
    null,
    2,
  ),
);
