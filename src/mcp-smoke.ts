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

type DimensionPossibleGrade = {
  id: string;
  condition: string;
  score_range: [number, number];
  score_band: string;
  default_status: string;
  default_evidence_state: string;
  is_selected: boolean;
  relation_to_selected: "lower_score" | "selected" | "higher_score";
};

type SummaryDimension = {
  id: string;
  score: number;
  max_score: number;
  score_band: string;
  status: string;
  evidence_state: string;
  possible_grades: DimensionPossibleGrade[];
};

type SimpleTokenReturnEstimate = {
  organic_roi_over_horizon: number;
  estimated_points_roi_over_horizon: number;
  risk_adjusted_roi_after_base_points: number;
  risk_adjusted_annualized_return_after_base_points: number;
};

type ReturnContext = {
  kind: "direct_or_variable_token_return" | "fixed_maturity_pt_return";
  source_basis: "full_local_research_package";
  token_return_estimate?: SimpleTokenReturnEstimate;
  pt_return_profile?: {
    gross_roi?: number;
    compound_gross_apy?: number;
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
  };
  social_research_layer?: Record<string, unknown>;
  quantitative_risk_return_layer?: Record<string, unknown>;
};

type AgentDisplay = {
  score_display: string;
  score_sort: number;
  score_source: string;
  inherited_asset_quality_score?: number;
  recommended_table_decision: string;
  decision_label: string;
  underwriting_status: string;
  execution_automation_status: string;
  primary_blockers: string[];
  fixed_return_metrics?: {
    gross_roi?: number;
    compound_gross_apy?: number;
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
    underwriting_hurdle_net_annualized?: number;
  };
  simple_token_return_display?: string;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
};

type Summary = {
  summary_schema_version: string;
  symbol: string;
  rubric: { score: number; score_label: string; score_status: string; decision_class: string };
  agent_display: AgentDisplay;
  dimensions: SummaryDimension[];
  scoring_helper?: {
    purpose: string;
    use_as: string;
    rubric_version: string;
    rubric_max_score: number;
    possible_grades_location: "dimensions[].possible_grades";
  };
  return_profile?: {
    gross_roi?: number;
    compound_gross_apy?: number;
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
  };
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
  return_context?: ReturnContext;
  quantitative_risk_return_layer?: {
    risk_adjusted_roi_after_expected_loss_and_exit?: number;
    risk_adjusted_annualized_return_after_expected_loss_and_exit?: number;
    conclusion?: string;
  };
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = resolve(projectRoot, "dist", "server.js");
const child = spawn(process.execPath, [serverPath], {
  cwd: projectRoot,
  stdio: ["pipe", "pipe", "pipe"],
});
child.stdin.setMaxListeners(50);

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

function parseReturnContextFromResearch(text: string, label: string): ReturnContext {
  const match = /## Normalized return context[\s\S]*?```json\n([\s\S]*?)\n```/.exec(text);
  assert(match?.[1], `${label} research missing normalized return_context JSON block`);
  return JSON.parse(match[1]) as ReturnContext;
}

async function waitForResponseCount(expectedResponseCount: number, label: string): Promise<void> {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline && responses.filter((response) => response.id !== undefined).length < expectedResponseCount) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 25));
  }
  assert(
    responses.filter((response) => response.id !== undefined).length >= expectedResponseCount,
    `${label}: expected ${expectedResponseCount} JSON-RPC responses, got ${responses.filter((response) => response.id !== undefined).length}; stderr=${stderrBuffer}`,
  );
}

async function waitForResponseId(id: number, label: string): Promise<void> {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline && !responseById(id)) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 25));
  }
  assert(responseById(id), `${label}: expected JSON-RPC response id ${id}; stderr=${stderrBuffer}`);
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
  { id: 3, label: "apxUSD", symbol: "apxUSD", expectedSymbol: "apxUSD", expectedScore: 49, expectedOrganicRoi: 0, expectedPointsRoi: 0.033921, expectedRiskAdjustedRoi: -0.001079 },
  { id: 4, label: "apyUSD", symbol: "apyUSD", expectedSymbol: "apyUSD", expectedScore: 35, expectedOrganicRoi: 0.045233, expectedPointsRoi: 0.016961, expectedRiskAdjustedRoi: 0.012194 },
  { id: 5, label: "PRIME", symbol: "PRIME", expectedSymbol: "PRIME", expectedScore: 41, expectedOrganicRoi: 0.01979, expectedPointsRoi: 0, expectedRiskAdjustedRoi: -0.04021 },
  { id: 6, label: "deSPXA", symbol: "deSPXA", expectedSymbol: "deSPXA", expectedScore: 44, expectedOrganicRoi: 0.017655, expectedPointsRoi: 0, expectedRiskAdjustedRoi: -0.037345 },
  { id: 7, label: "USDat", symbol: "USDat", expectedSymbol: "USDat", expectedScore: 52, expectedOrganicRoi: 0, expectedPointsRoi: 0.056663, expectedRiskAdjustedRoi: 0.047663 },
  { id: 8, label: "sUSDat", symbol: "sUSDat", expectedSymbol: "sUSDat", expectedScore: 40, expectedOrganicRoi: 0.021575, expectedPointsRoi: 0.008095, expectedRiskAdjustedRoi: -0.03283 },
  {
    id: 9,
    label: "PT-apxUSD",
    symbol: "PT-apxUSD",
    expectedSymbol: "PT-apxUSD-2026-11-05",
    expectedScore: 49,
    expectedTableScore: 62,
    expectedCompoundGrossApy: 0.2168,
    expectedRiskAdjustedApy: 0.0889,
  },
  {
    id: 10,
    label: "PT-apyUSD",
    symbol: "PT-apyUSD",
    expectedSymbol: "PT-apyUSD-2026-08-27",
    expectedScore: 35,
    expectedTableScore: 11,
    expectedCompoundGrossApy: 0.176,
    expectedRiskAdjustedApy: -0.147,
  },
  {
    id: 11,
    label: "PT-USDat",
    symbol: "PT-USDat",
    expectedSymbol: "PT-USDat-2026-08-27",
    expectedScore: 52,
    expectedTableScore: 27,
    expectedCompoundGrossApy: 0.0898,
    expectedRiskAdjustedApy: 0.0341,
  },
  {
    id: 12,
    label: "PT-sUSDat",
    symbol: "PT-sUSDat",
    expectedSymbol: "PT-sUSDat-2026-08-27",
    expectedScore: 40,
    expectedTableScore: 31,
    expectedCompoundGrossApy: 0.3364,
    expectedRiskAdjustedApy: -0.0894,
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

const simpleResearchLookups = [
  { id: 16, label: "apxUSD", symbol: "apxUSD", expectedOrganicRoi: 0, expectedPointsRoi: 0.033921, expectedRiskAdjustedRoi: -0.001079 },
  { id: 17, label: "apyUSD", symbol: "apyUSD", expectedOrganicRoi: 0.045233, expectedPointsRoi: 0.016961, expectedRiskAdjustedRoi: 0.012194 },
  { id: 18, label: "PRIME", symbol: "PRIME", expectedOrganicRoi: 0.01979, expectedPointsRoi: 0, expectedRiskAdjustedRoi: -0.04021 },
  { id: 19, label: "deSPXA", symbol: "deSPXA", expectedOrganicRoi: 0.017655, expectedPointsRoi: 0, expectedRiskAdjustedRoi: -0.037345 },
  { id: 20, label: "USDat", symbol: "USDat", expectedOrganicRoi: 0, expectedPointsRoi: 0.056663, expectedRiskAdjustedRoi: 0.047663 },
  { id: 21, label: "sUSDat", symbol: "sUSDat", expectedOrganicRoi: 0.021575, expectedPointsRoi: 0.008095, expectedRiskAdjustedRoi: -0.03283 },
];

await waitForResponseCount(15, "initial summary/PT research calls");

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
  const expectedSchemaVersion = lookup.expectedTableScore !== undefined ? "asset_summary_v1.3" : "asset_summary_v1.2";
  assert(summary.summary_schema_version === expectedSchemaVersion, `${lookup.label} summary schema version mismatch`);
  assert(summary.rubric.score === lookup.expectedScore, `${lookup.label} summary score changed`);
  assert(summary.rubric.score_label === "asset_quality_evidence_score", `${lookup.label} score label missing`);
  assert(summary.rubric.score_status === "precomputed", `${lookup.label} score status missing`);
  assert(summary.agent_display.score_display.includes(`${lookup.expectedScore}/100`), `${lookup.label} score display missing`);
  assert(summary.agent_display.recommended_table_decision, `${lookup.label} recommended table decision missing`);
  assert(
    summary.agent_display.recommended_table_decision !== summary.rubric.decision_class,
    `${lookup.label} table decision should not be the legacy rubric decision_class`,
  );
  assert(summary.agent_display.decision_label.length > 20, `${lookup.label} decision label missing`);
  assert(summary.agent_display.execution_automation_status.startsWith("blocked"), `${lookup.label} automation status should block`);
  assert(summary.agent_display.primary_blockers.length > 0, `${lookup.label} primary blockers missing`);
  assert(summary.dimensions.length === 7, `${lookup.label} expected seven rubric dimensions`);
  assert(summary.scoring_helper, `${lookup.label} scoring_helper metadata missing`);
  assert(summary.scoring_helper.possible_grades_location === "dimensions[].possible_grades", `${lookup.label} scoring helper location mismatch`);
  assert(summary.scoring_helper.use_as.includes("dimensions[].possible_grades"), `${lookup.label} scoring helper use_as should point to possible_grades`);
  assert(summary.return_context, `${lookup.label} normalized return_context missing`);
  assert(summary.return_context.source_basis === "full_local_research_package", `${lookup.label} return_context source_basis mismatch`);
  assert(summary.return_context.social_research_layer, `${lookup.label} return_context missing social/X layer`);
  for (const dimension of summary.dimensions) {
    assert(typeof dimension.score === "number", `${lookup.label} dimension ${dimension.id} missing score`);
    assert(typeof dimension.max_score === "number", `${lookup.label} dimension ${dimension.id} missing max_score`);
    assert(dimension.score_band, `${lookup.label} dimension ${dimension.id} missing score_band`);
    assert(dimension.status, `${lookup.label} dimension ${dimension.id} missing status`);
    assert(dimension.evidence_state, `${lookup.label} dimension ${dimension.id} missing evidence_state`);
    assert(dimension.possible_grades.length === 3, `${lookup.label} dimension ${dimension.id} should include three comparable grade buckets`);
    assert(
      dimension.possible_grades.filter((grade) => grade.is_selected).length === 1,
      `${lookup.label} dimension ${dimension.id} should mark exactly one selected grade`,
    );
    assert(
      dimension.possible_grades.some((grade) => grade.relation_to_selected === "selected"),
      `${lookup.label} dimension ${dimension.id} possible_grades missing selected relation`,
    );
    if (dimension.id === "backing_nav_evidence") {
      const conditions = dimension.possible_grades.map((grade) => grade.condition).join("\n");
      assert(conditions.includes("Realtime or daily backing portfolio/reserve reporting"), `${lookup.label} backing grades missing top anchor`);
      assert(conditions.includes("Daily/weekly attestations or issuer dashboards"), `${lookup.label} backing grades missing middle attestation anchor`);
      assert(conditions.includes("Monthly/stale/high-level attestations"), `${lookup.label} backing grades missing low anchor`);
    }
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
  if (lookup.expectedOrganicRoi !== undefined) {
    assert(summary.return_context.kind === "direct_or_variable_token_return", `${lookup.label} return_context should be direct/variable token kind`);
    assert(summary.return_context.token_return_estimate, `${lookup.label} return_context missing token estimate`);
    assert(summary.simple_token_return_estimate, `${lookup.label} simple token return estimate missing`);
    assert(summary.agent_display.simple_token_return_estimate, `${lookup.label} table simple token return estimate missing`);
    assert(
      summary.agent_display.simple_token_return_display?.includes("Organic ROI") &&
        summary.agent_display.simple_token_return_display.includes("points ROI") &&
        summary.agent_display.simple_token_return_display.includes("risk-adjusted ROI"),
      `${lookup.label} simple token return display missing ROI components`,
    );
    assert(summary.simple_token_return_estimate.organic_roi_over_horizon === lookup.expectedOrganicRoi, `${lookup.label} organic ROI estimate changed`);
    assert(
      summary.simple_token_return_estimate.estimated_points_roi_over_horizon === lookup.expectedPointsRoi,
      `${lookup.label} points ROI estimate changed`,
    );
    assert(
      summary.simple_token_return_estimate.risk_adjusted_roi_after_base_points === lookup.expectedRiskAdjustedRoi,
      `${lookup.label} risk-adjusted ROI estimate changed`,
    );
  }
  if (lookup.expectedCompoundGrossApy !== undefined) {
    assert(summary.return_context.kind === "fixed_maturity_pt_return", `${lookup.label} return_context should be fixed-maturity PT kind`);
    assert(summary.return_context.pt_return_profile, `${lookup.label} return_context missing PT return profile`);
    assert(
      summary.return_profile?.compound_gross_apy === lookup.expectedCompoundGrossApy,
      `${lookup.label} return_profile missing expected APY`,
    );
  }
  if (lookup.expectedTableScore !== undefined) {
    assert(summary.agent_display.score_sort === lookup.expectedTableScore, `${lookup.label} table score mismatch`);
    assert(summary.agent_display.score_source === "pt_fixed_return_trade_score", `${lookup.label} table score should be fixed-return PT score`);
    assert(
      summary.agent_display.inherited_asset_quality_score === lookup.expectedScore,
      `${lookup.label} inherited asset-quality score mismatch`,
    );
    assert(
      summary.agent_display.score_display.includes(`${lookup.expectedTableScore}/100 fixed-return PT score`),
      `${lookup.label} score_display missing fixed-return table score`,
    );
  }
  if (lookup.expectedRiskAdjustedApy !== undefined) {
    assert(
      summary.quantitative_risk_return_layer?.risk_adjusted_annualized_return_after_expected_loss_and_exit ===
        lookup.expectedRiskAdjustedApy,
      `${lookup.label} quantitative overlay missing risk-adjusted fixed-return APY`,
    );
    assert(
      !JSON.stringify(summary).toLowerCase().includes("points roi"),
      `${lookup.label} summary should not contain points ROI assumptions`,
    );
  }
}

for (const lookup of simpleResearchLookups) {
  send({
    jsonrpc: "2.0",
    id: lookup.id,
    method: "tools/call",
    params: {
      name: "get_asset_research",
      arguments: { symbol: lookup.symbol },
    },
  });
  await waitForResponseId(lookup.id, `${lookup.label} simple-token research call`);
}

for (const lookup of simpleResearchLookups) {
  const researchText = parseResearch(lookup.id, lookup.label);
  assert(researchText.includes("return_context: included"), `${lookup.label} research should declare included return_context`);
  assert(researchText.includes("return_context_kind: direct_or_variable_token_return"), `${lookup.label} research should declare direct/variable return_context kind`);
  assert(researchText.includes("## Normalized return context"), `${lookup.label} research missing normalized return context section`);
  assert(researchText.includes("### Direct / variable-token ROI"), `${lookup.label} research missing direct/variable ROI section`);
  assert(researchText.includes("Organic / variable ROI over"), `${lookup.label} research missing organic/variable ROI line`);
  assert(researchText.includes("Fresh farming points ROI over"), `${lookup.label} research missing fresh farming points ROI line`);
  assert(researchText.includes("Risk-adjusted ROI after base points"), `${lookup.label} research missing risk-adjusted ROI line`);
  assert(researchText.includes("Social/X"), `${lookup.label} research missing social/X overlay context`);
  assert(researchText.includes("## Source research report"), `${lookup.label} research missing source report separator`);
  const context = parseReturnContextFromResearch(researchText, lookup.label);
  assert(context.kind === "direct_or_variable_token_return", `${lookup.label} research return_context kind changed`);
  assert(context.source_basis === "full_local_research_package", `${lookup.label} research return_context source basis changed`);
  const estimate = context.token_return_estimate;
  assert(estimate, `${lookup.label} research return_context missing token estimate`);
  assert(estimate.organic_roi_over_horizon === lookup.expectedOrganicRoi, `${lookup.label} research organic ROI estimate changed`);
  assert(estimate.estimated_points_roi_over_horizon === lookup.expectedPointsRoi, `${lookup.label} research points ROI estimate changed`);
  assert(estimate.risk_adjusted_roi_after_base_points === lookup.expectedRiskAdjustedRoi, `${lookup.label} research risk-adjusted ROI estimate changed`);
}

const ptApyResearchText = parseResearch(13, "PT-apyUSD");
assert(ptApyResearchText.includes("return_context_kind: fixed_maturity_pt_return"), "PT-apyUSD research should declare fixed-maturity return context");
assert(ptApyResearchText.includes("### PT fixed-maturity ROI"), "PT-apyUSD research missing PT ROI context section");
assert(ptApyResearchText.includes("Risk-adjusted annualized return after expected loss and exit"), "PT-apyUSD research missing risk-adjusted APY line");
const ptApyContext = parseReturnContextFromResearch(ptApyResearchText, "PT-apyUSD");
assert(ptApyContext.kind === "fixed_maturity_pt_return", "PT-apyUSD research return_context kind changed");
assert(ptApyContext.pt_return_profile?.compound_gross_apy === 0.176, "PT-apyUSD research return_context APY changed");
assert(
  ptApyResearchText.includes("risk-adjusted base case was negative after expected loss and exit cost"),
  "PT-apyUSD research markdown missing fixed-return risk-adjusted conclusion",
);
assert(
  !ptApyResearchText.toLowerCase().includes("points roi"),
  "PT-apyUSD research markdown should not contain points ROI hurdle text",
);

const ptUsdatResearchText = parseResearch(14, "PT-USDat");
const ptUsdatContext = parseReturnContextFromResearch(ptUsdatResearchText, "PT-USDat");
assert(ptUsdatContext.kind === "fixed_maturity_pt_return", "PT-USDat research return_context kind changed");
assert(ptUsdatContext.pt_return_profile?.compound_gross_apy === 0.0898, "PT-USDat research return_context APY changed");
assert(ptUsdatResearchText.includes("fixed-return base case is positive but below"), "PT-USDat research markdown missing fixed-return hurdle conclusion");
assert(!ptUsdatResearchText.toLowerCase().includes("points roi"), "PT-USDat research markdown should not contain points ROI hurdle text");

const ptSusdatResearchText = parseResearch(15, "PT-sUSDat");
const ptSusdatContext = parseReturnContextFromResearch(ptSusdatResearchText, "PT-sUSDat");
assert(ptSusdatContext.kind === "fixed_maturity_pt_return", "PT-sUSDat research return_context kind changed");
assert(ptSusdatContext.pt_return_profile?.compound_gross_apy === 0.3364, "PT-sUSDat research return_context APY changed");
assert(ptSusdatResearchText.includes("fixed-return base case is negative after expected loss and exit cost"), "PT-sUSDat research markdown missing fixed-return loss conclusion");
assert(ptSusdatResearchText.includes("STRC/NAV/queue expected loss"), "PT-sUSDat research markdown missing expected-loss conclusion");

child.kill("SIGTERM");

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
            legacy_score: summary.rubric.score,
            legacy_decision_class: summary.rubric.decision_class,
            score_display: summary.agent_display.score_display,
            recommended_table_decision: summary.agent_display.recommended_table_decision,
            decision_label: summary.agent_display.decision_label,
            underwriting_status: summary.agent_display.underwriting_status,
            execution_automation_status: summary.agent_display.execution_automation_status,
            primary_blockers: summary.agent_display.primary_blockers.slice(0, 2),
            dimensions_with_status: summary.dimensions.length,
            scoring_helper_possible_grades: summary.scoring_helper?.possible_grades_location,
            return_context_kind: summary.return_context?.kind,
            return_context_source_basis: summary.return_context?.source_basis,
            return_context_has_social_x: Boolean(summary.return_context?.social_research_layer),
            return_context_has_quant: Boolean(summary.return_context?.quantitative_risk_return_layer),
            possible_grade_buckets_per_dimension: summary.dimensions[0]?.possible_grades.length,
            blocking_dimensions: summary.dimensions
              .filter((dimension) => dimension.status === "block_automation" || dimension.status === "cannot_underwrite")
              .map((dimension) => `${dimension.id}:${dimension.score}/${dimension.max_score}:${dimension.status}`),
            compound_gross_apy: summary.return_profile?.compound_gross_apy,
            table_score: summary.agent_display.score_sort,
            score_source: summary.agent_display.score_source,
            inherited_asset_quality_score: summary.agent_display.inherited_asset_quality_score,
            organic_roi_over_horizon: summary.simple_token_return_estimate?.organic_roi_over_horizon,
            estimated_points_roi_over_horizon: summary.simple_token_return_estimate?.estimated_points_roi_over_horizon,
            risk_adjusted_roi_after_base_points: summary.simple_token_return_estimate?.risk_adjusted_roi_after_base_points,
            risk_adjusted_annualized_return_after_base_points:
              summary.simple_token_return_estimate?.risk_adjusted_annualized_return_after_base_points,
            risk_adjusted_annualized_return_after_expected_loss_and_exit:
              summary.quantitative_risk_return_layer?.risk_adjusted_annualized_return_after_expected_loss_and_exit,
          },
        ]),
      ),
      research_chars: {
        apxUSD: parseResearch(16, "apxUSD").length,
        apyUSD: parseResearch(17, "apyUSD").length,
        PRIME: parseResearch(18, "PRIME").length,
        deSPXA: parseResearch(19, "deSPXA").length,
        USDat: parseResearch(20, "USDat").length,
        sUSDat: parseResearch(21, "sUSDat").length,
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
