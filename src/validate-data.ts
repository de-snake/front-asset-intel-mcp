import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_ROOT, getAssetResearch, getAssetSummary, listAssetEntries } from "./registry.js";

type RubricOption = {
  id: string;
  condition: string;
  score_range: [number, number];
  score_band: string;
  default_status: string;
  default_evidence_state: string;
};
type RubricDimension = { id: string; question: string; max_score: number; options: RubricOption[] };
type Rubric = { version: string; max_score: number; dimensions: RubricDimension[] };
type EvidencePointer = string | { source: string; quote?: string };

type DimensionPossibleGrade = RubricOption & {
  is_selected: boolean;
  relation_to_selected: "lower_score" | "selected" | "higher_score";
};

type SummaryDimension = {
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
};
type PointsThesisKind = "fresh_quant_farming_thesis" | "no_confirmed_points_program";

type PointsFarmingThesis = {
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
};

type SimpleTokenReturnEstimate = {
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
};

type AgentDisplay = {
  recommended_table_fields: string[];
  score_display: string;
  score_sort: number;
  score_source: string;
  score_explanation: string;
  inherited_asset_quality_score?: number;
  recommended_table_decision: string;
  decision_label: string;
  underwriting_status: string;
  execution_automation_status: string;
  primary_blockers: string[];
  next_action: string;
  table_note: string;
  simple_token_return_display?: string;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
};

type ReturnContext = {
  kind: "direct_or_variable_token_return" | "fixed_maturity_pt_return";
  source_basis: "full_local_research_package";
  source_fields: string[];
  summary_mode?: string;
  display?: string;
  token_return_estimate?: SimpleTokenReturnEstimate;
  pt_return_profile?: Record<string, unknown>;
  quantitative_risk_return_layer?: Record<string, unknown>;
  social_research_layer?: Record<string, unknown>;
  notes: string[];
};

type Summary = {
  summary_schema_version: string;
  asset_id: string;
  symbol: string;
  asset_type: string;
  rubric: {
    version: string;
    score: number;
    max_score: number;
    score_label: string;
    score_meaning: string;
    score_status: string;
    decision_class: string;
  };
  agent_display: AgentDisplay;
  dimensions: SummaryDimension[];
  scoring_helper?: {
    purpose: string;
    use_as: string;
    rubric_version: string;
    rubric_max_score: number;
    note: string;
    possible_grades_location: "dimensions[].possible_grades";
  };
  return_profile?: unknown;
  return_context?: ReturnContext;
  simple_token_return_estimate?: SimpleTokenReturnEstimate;
  blocking_unknowns: string[];
  source_report: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

const forbiddenSummaryEvidenceFragments = [
  "RESULT.md",
  "dev/implementation/",
  "front-kb RESULT",
  "USDat analyst report §",
  "sUSDat analyst report §",
];

function assertNoStaleEvidencePointer(slug: string, location: string, value: unknown): void {
  if (typeof value === "string") {
    const forbidden = forbiddenSummaryEvidenceFragments.find((fragment) => value.includes(fragment));
    assert(!forbidden, `${slug}: stale/non-local evidence pointer at ${location}: ${value}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoStaleEvidencePointer(slug, `${location}[${index}]`, item));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      assertNoStaleEvidencePointer(slug, location ? `${location}.${key}` : key, child);
    }
  }
}

function evidencePointerHasContent(item: EvidencePointer): boolean {
  if (typeof item === "string") {
    return item.trim().length > 0;
  }
  return typeof item.source === "string" && item.source.trim().length > 0;
}

function expectedRelationToSelected(option: RubricOption, dimension: SummaryDimension): DimensionPossibleGrade["relation_to_selected"] {
  if (option.id === dimension.selected_option) return "selected";
  if (option.score_range[1] < dimension.score) return "lower_score";
  return "higher_score";
}

const rubricPath = path.join(DATA_ROOT, "rubrics", "asset_risk_v1.json");
const rubric = await readJsonFile<Rubric>(rubricPath);
const rubricMax = rubric.dimensions.reduce((sum, dim) => sum + dim.max_score, 0);
assert(rubricMax === rubric.max_score, `Rubric dimension max sum ${rubricMax} != max_score ${rubric.max_score}`);
const rubricDimensionMax = new Map(rubric.dimensions.map((dim) => [dim.id, dim.max_score]));
const rubricDimensionById = new Map(rubric.dimensions.map((dim) => [dim.id, dim]));
const validScoreBands = new Set(["strong", "partial", "weak"]);
const validStatuses = new Set(["usable_for_review", "review_required", "block_automation", "cannot_underwrite"]);
const validDecisionClasses = new Set(["usable_with_live_preview", "review_required", "blocked_or_cannot_underwrite"]);
const validRecommendedTableDecisions = new Set([
  "analysis_candidate_live_preview_possible",
  "block_preview_execute_until_inputs",
  "cannot_underwrite_current_snapshot",
  "fixed_return_below_hurdle_needs_live_improvement",
  "fixed_return_negative_after_expected_loss",
  "research_only_fresh_quant_needed",
]);
const validUnderwritingStatuses = new Set([
  "analysis_candidate",
  "conditional_fixed_return_review",
  "do_not_underwrite_current_snapshot",
  "manual_underwriting_only",
  "needs_fresh_quant_and_live_inputs",
]);
const validExecutionAutomationStatuses = new Set([
  "blocked_current_snapshot",
  "blocked_until_live_inputs_resolved",
  "requires_live_preview_before_execute",
]);
const validEvidenceStates = new Set(["verified", "partially_supported", "source_inconclusive", "missing_or_unknown", "negative_evidence"]);
const validSummarySchemaVersions = new Set(["asset_summary_v1.2", "asset_summary_v1.3"]);
const simpleTokenReturnEstimateSlugs = new Set([
  "base-despxa",
  "ethereum-apxusd",
  "ethereum-apyusd",
  "ethereum-prime",
  "ethereum-usdc",
  "ethereum-susdat",
  "ethereum-usdat",
]);
const simpleTokenReturnEstimateNumericFields: Array<keyof SimpleTokenReturnEstimate> = [
  "horizon_days",
  "organic_yield_apy_estimate",
  "organic_roi_over_horizon",
  "estimated_points_roi_over_horizon",
  "estimated_points_annualized_return",
  "expected_loss_prior",
  "exit_cost_assumption",
  "risk_adjusted_roi_before_points",
  "risk_adjusted_roi_after_base_points",
  "risk_adjusted_annualized_return_after_base_points",
  "underwriting_hurdle_net_annualized",
];
const forbiddenPtPointAssumptionPhrases = [
  "points",
  "needs points",
  "points roi",
  "before points",
  "points/recovery",
  "points / recovery",
  "points optionality",
  "wallet-specific",
  "pips",
  "gravity points",
  "credible saturn points",
];

function approxEqual(actual: number, expected: number, tolerance = 0.00001): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

function validateSimpleTokenReturnEstimate(slug: string, summary: Summary): void {
  assert(summary.simple_token_return_estimate, `${slug}: simple token missing return estimate`);
  assert(summary.agent_display.simple_token_return_estimate, `${slug}: agent_display missing simple token return estimate`);
  assert(
    JSON.stringify(summary.agent_display.simple_token_return_estimate) === JSON.stringify(summary.simple_token_return_estimate),
    `${slug}: agent_display simple_token_return_estimate must mirror top-level estimate`,
  );
  assert(
    summary.agent_display.recommended_table_fields.includes("agent_display.simple_token_return_display"),
    `${slug}: table field hint missing simple token return display`,
  );
  assert(
    summary.agent_display.simple_token_return_display && summary.agent_display.simple_token_return_display.includes("risk-adjusted ROI"),
    `${slug}: simple token return display missing risk-adjusted ROI`,
  );

  const estimate = summary.simple_token_return_estimate;
  assert(estimate.scope === "direct_token_hold_not_pendle_pt", `${slug}: invalid simple token estimate scope`);
  for (const field of simpleTokenReturnEstimateNumericFields) {
    const value = estimate[field];
    assert(typeof value === "number" && Number.isFinite(value), `${slug}: ${field} must be finite number`);
  }
  assert(estimate.horizon_days > 0, `${slug}: horizon_days must be positive`);
  assert(estimate.organic_yield_apy_range_estimate.length === 2, `${slug}: organic APY range must have two values`);
  assert(
    estimate.organic_yield_apy_range_estimate[0] <= estimate.organic_yield_apy_estimate &&
      estimate.organic_yield_apy_estimate <= estimate.organic_yield_apy_range_estimate[1],
    `${slug}: organic_yield_apy_estimate outside range`,
  );
  assert(
    estimate.points_roi_scenarios_over_horizon.low <= estimate.points_roi_scenarios_over_horizon.base &&
      estimate.points_roi_scenarios_over_horizon.base <= estimate.points_roi_scenarios_over_horizon.high,
    `${slug}: points ROI scenarios not ordered low <= base <= high`,
  );
  assert(
    approxEqual(estimate.estimated_points_roi_over_horizon, estimate.points_roi_scenarios_over_horizon.base),
    `${slug}: estimated_points_roi_over_horizon must equal base points scenario`,
  );
  assert(
    estimate.expected_loss_prior_scenarios.low <= estimate.expected_loss_prior_scenarios.base &&
      estimate.expected_loss_prior_scenarios.base <= estimate.expected_loss_prior_scenarios.high,
    `${slug}: expected-loss scenarios not ordered low <= base <= high`,
  );
  assert(
    approxEqual(estimate.expected_loss_prior, estimate.expected_loss_prior_scenarios.base),
    `${slug}: expected_loss_prior must equal base expected-loss scenario`,
  );
  const expectedRiskAdjusted =
    estimate.organic_roi_over_horizon +
    estimate.estimated_points_roi_over_horizon -
    estimate.expected_loss_prior -
    estimate.exit_cost_assumption;
  assert(
    approxEqual(estimate.risk_adjusted_roi_after_base_points, expectedRiskAdjusted),
    `${slug}: risk_adjusted_roi_after_base_points formula mismatch`,
  );
  assert(
    approxEqual(estimate.risk_adjusted_roi_scenarios_after_base_points.low_loss, estimate.organic_roi_over_horizon + estimate.estimated_points_roi_over_horizon - estimate.expected_loss_prior_scenarios.low - estimate.exit_cost_assumption) &&
      approxEqual(estimate.risk_adjusted_roi_scenarios_after_base_points.base, estimate.risk_adjusted_roi_after_base_points) &&
      approxEqual(estimate.risk_adjusted_roi_scenarios_after_base_points.high_loss, estimate.organic_roi_over_horizon + estimate.estimated_points_roi_over_horizon - estimate.expected_loss_prior_scenarios.high - estimate.exit_cost_assumption),
    `${slug}: risk-adjusted ROI expected-loss scenario formulas mismatch`,
  );
  assert(
    estimate.risk_adjusted_roi_scenarios_after_base_points.low_loss >= estimate.risk_adjusted_roi_scenarios_after_base_points.base &&
      estimate.risk_adjusted_roi_scenarios_after_base_points.base >= estimate.risk_adjusted_roi_scenarios_after_base_points.high_loss,
    `${slug}: risk-adjusted ROI scenarios not ordered low_loss >= base >= high_loss`,
  );
  assert(
    approxEqual(
      estimate.risk_adjusted_roi_before_points,
      estimate.organic_roi_over_horizon - estimate.expected_loss_prior - estimate.exit_cost_assumption,
    ),
    `${slug}: risk_adjusted_roi_before_points formula mismatch`,
  );
  assert(
    approxEqual(
      estimate.risk_adjusted_annualized_return_after_base_points,
      (estimate.risk_adjusted_roi_after_base_points * 365) / estimate.horizon_days,
    ),
    `${slug}: risk-adjusted annualized return formula mismatch`,
  );
  assert(estimate.method.includes("organic_roi_over_horizon"), `${slug}: method must name return formula`);
  assert(estimate.basis.length > 80, `${slug}: estimate basis too short`);
  assert(estimate.confidence.length > 0, `${slug}: estimate confidence missing`);
  assert(Array.isArray(estimate.evidence) && estimate.evidence.length > 0, `${slug}: estimate evidence missing`);
  assert(estimate.points_farming_thesis, `${slug}: missing points_farming_thesis`);
  assert(
    estimate.points_thesis_kind === estimate.points_farming_thesis.kind,
    `${slug}: points_thesis_kind must mirror points_farming_thesis.kind`,
  );
  assert(estimate.points_farming_thesis.as_of.length > 0, `${slug}: points_farming_thesis.as_of missing`);
  assert(estimate.points_farming_thesis.formula.includes("points_roi"), `${slug}: points_farming_thesis formula must name points_roi`);
  if (estimate.points_thesis_kind === "fresh_quant_farming_thesis") {
    assert(
      estimate.method.includes("fresh_points_farming_thesis"),
      `${slug}: fresh points estimate method must be explicit`,
    );
    assert(
      estimate.points_program.toLowerCase().includes("fresh") || estimate.points_program.toLowerCase().includes("conditional"),
      `${slug}: points_program must label the fresh/conditional farming thesis`,
    );
    assert(estimate.points_farming_thesis.route_multiplier && estimate.points_farming_thesis.route_multiplier > 0, `${slug}: fresh farming thesis missing route_multiplier`);
    assert(estimate.points_farming_thesis.program_allocation_pct_of_supply && estimate.points_farming_thesis.program_allocation_pct_of_supply > 0, `${slug}: fresh farming thesis missing allocation pct`);
    assert(estimate.points_farming_thesis.remaining_days === estimate.horizon_days, `${slug}: fresh farming thesis remaining_days must match horizon_days`);
    assert(estimate.points_farming_thesis.season_days && estimate.points_farming_thesis.season_days >= estimate.horizon_days, `${slug}: fresh farming thesis season_days invalid`);
    assert(estimate.points_farming_thesis.raw_tvl_proxy_usd && estimate.points_farming_thesis.raw_tvl_proxy_usd > 0, `${slug}: fresh farming thesis missing raw TVL proxy`);
    assert(estimate.points_farming_thesis.roi_scenarios_over_horizon, `${slug}: fresh farming thesis missing ROI scenarios`);
    assert(
      JSON.stringify(estimate.points_farming_thesis.roi_scenarios_over_horizon) === JSON.stringify(estimate.points_roi_scenarios_over_horizon),
      `${slug}: fresh farming thesis ROI scenarios must mirror points_roi_scenarios_over_horizon`,
    );
  } else {
    assert(
      estimate.estimated_points_roi_over_horizon === 0,
      `${slug}: no_confirmed_points_program estimates must keep points ROI at zero`,
    );
  }
}

for (const dimension of rubric.dimensions) {
  assert(dimension.options.length > 0, `Rubric dimension ${dimension.id} has no options`);
  for (const option of dimension.options) {
    assert(validScoreBands.has(option.score_band), `Rubric option ${option.id}: invalid score_band ${option.score_band}`);
    assert(validStatuses.has(option.default_status), `Rubric option ${option.id}: invalid default_status ${option.default_status}`);
    assert(
      validEvidenceStates.has(option.default_evidence_state),
      `Rubric option ${option.id}: invalid default_evidence_state ${option.default_evidence_state}`,
    );
    assert(option.score_range.length === 2, `Rubric option ${option.id}: score_range must have two values`);
    assert(option.score_range[0] <= option.score_range[1], `Rubric option ${option.id}: invalid score_range`);
    assert(option.score_range[0] >= 0, `Rubric option ${option.id}: score_range below zero`);
    assert(option.score_range[1] <= dimension.max_score, `Rubric option ${option.id}: score_range above dimension max`);
  }
}

const entries = await listAssetEntries();
assert(entries.length > 0, "No assets found");

for (const entry of entries) {
  const manifest = entry.manifest;
  assertNoStaleEvidencePointer(manifest.slug, "manifest", manifest);
  const summary = (await getAssetSummary({ asset_id: manifest.asset_id })) as Summary;
  const research = await getAssetResearch({ asset_id: manifest.asset_id });

  assert(validSummarySchemaVersions.has(summary.summary_schema_version), `${manifest.slug}: unexpected summary_schema_version`);
  assertNoStaleEvidencePointer(manifest.slug, "summary", summary);
  assert(summary.source_report === "research.md", `${manifest.slug}: source_report must point to local research.md evidence surface`);
  assert(summary.asset_id === manifest.asset_id, `${manifest.slug}: summary asset_id mismatch`);
  assert(summary.symbol === manifest.symbol, `${manifest.slug}: summary symbol mismatch`);
  assert(summary.rubric.version === manifest.rubric_version, `${manifest.slug}: rubric version mismatch`);
  assert(summary.scoring_helper, `${manifest.slug}: missing scoring_helper metadata`);
  assert(summary.scoring_helper.rubric_version === rubric.version, `${manifest.slug}: scoring_helper rubric version mismatch`);
  assert(summary.scoring_helper.rubric_max_score === rubric.max_score, `${manifest.slug}: scoring_helper rubric max mismatch`);
  assert(summary.scoring_helper.possible_grades_location === "dimensions[].possible_grades", `${manifest.slug}: scoring_helper possible_grades_location mismatch`);
  assert(summary.scoring_helper.purpose.includes("scoring helper"), `${manifest.slug}: scoring_helper purpose should name scoring helper use`);
  assert(summary.scoring_helper.use_as.includes("dimensions[].possible_grades"), `${manifest.slug}: scoring_helper use_as should point to possible_grades`);
  assert(summary.return_context, `${manifest.slug}: missing normalized return_context`);
  assert(summary.return_context.source_basis === "full_local_research_package", `${manifest.slug}: return_context source_basis mismatch`);
  assert(summary.return_context.source_fields.length > 0, `${manifest.slug}: return_context source_fields missing`);
  assert(summary.return_context.notes.length >= 2, `${manifest.slug}: return_context notes missing`);
  assert(summary.return_context.social_research_layer, `${manifest.slug}: return_context missing social/X research layer`);
  assert(summary.rubric.max_score === rubric.max_score, `${manifest.slug}: rubric max_score mismatch`);
  assert(summary.rubric.score_label === "asset_quality_evidence_score", `${manifest.slug}: rubric score_label mismatch`);
  assert(summary.rubric.score_status === "precomputed", `${manifest.slug}: rubric score_status mismatch`);
  assert(summary.rubric.score_meaning.length > 40, `${manifest.slug}: rubric score_meaning is missing`);
  assert(validDecisionClasses.has(summary.rubric.decision_class), `${manifest.slug}: invalid top-level decision_class`);
  assert(summary.agent_display, `${manifest.slug}: missing agent_display`);
  assert(
    validRecommendedTableDecisions.has(summary.agent_display.recommended_table_decision),
    `${manifest.slug}: invalid recommended_table_decision`,
  );
  assert(
    !validDecisionClasses.has(summary.agent_display.recommended_table_decision),
    `${manifest.slug}: recommended_table_decision must not reuse legacy rubric decision_class`,
  );
  assert(summary.agent_display.decision_label.length > 20, `${manifest.slug}: decision_label too short`);
  assert(
    validUnderwritingStatuses.has(summary.agent_display.underwriting_status),
    `${manifest.slug}: invalid underwriting_status`,
  );
  assert(
    validExecutionAutomationStatuses.has(summary.agent_display.execution_automation_status),
    `${manifest.slug}: invalid execution_automation_status`,
  );
  const isPrincipalToken = summary.asset_type === "pendle_pt";
  if (isPrincipalToken) {
    assert(summary.return_context.kind === "fixed_maturity_pt_return", `${manifest.slug}: PT return_context kind mismatch`);
    assert(summary.return_context.pt_return_profile, `${manifest.slug}: PT return_context missing return profile`);
    assert(
      JSON.stringify(summary.return_context.pt_return_profile) === JSON.stringify(summary.return_profile),
      `${manifest.slug}: PT return_context must mirror return_profile`,
    );
    assert(
      summary.summary_schema_version === "asset_summary_v1.3",
      `${manifest.slug}: PT summaries must use fixed-return schema v1.3`,
    );
    assert(
      summary.agent_display.score_source === "pt_fixed_return_trade_score",
      `${manifest.slug}: PT table score must come from fixed-return economics`,
    );
    assert(
      summary.agent_display.inherited_asset_quality_score === summary.rubric.score,
      `${manifest.slug}: PT inherited_asset_quality_score must preserve legacy rubric score`,
    );
    assert(
      summary.agent_display.score_sort >= 0 && summary.agent_display.score_sort <= summary.rubric.max_score,
      `${manifest.slug}: PT score_sort outside 0-${summary.rubric.max_score}`,
    );
    assert(
      summary.agent_display.score_display.includes(`${summary.agent_display.score_sort}/100`),
      `${manifest.slug}: PT score_display missing fixed-return table score`,
    );
    const ptText = JSON.stringify(summary).toLowerCase();
    const forbidden = forbiddenPtPointAssumptionPhrases.find((phrase) => ptText.includes(phrase));
    assert(!forbidden, `${manifest.slug}: PT summary still contains point-assumption phrase ${forbidden}`);
  } else {
    assert(summary.return_context.kind === "direct_or_variable_token_return", `${manifest.slug}: token return_context kind mismatch`);
    assert(summary.return_context.token_return_estimate, `${manifest.slug}: token return_context missing token estimate`);
    assert(
      JSON.stringify(summary.return_context.token_return_estimate) === JSON.stringify(summary.simple_token_return_estimate),
      `${manifest.slug}: token return_context must mirror simple_token_return_estimate`,
    );
    assert(summary.agent_display.score_sort === summary.rubric.score, `${manifest.slug}: score_sort must match rubric score`);
    assert(
      summary.agent_display.score_display.includes(`${summary.rubric.score}/100`),
      `${manifest.slug}: score_display missing score`,
    );
  }
  assert(summary.agent_display.score_explanation.length > 80, `${manifest.slug}: score_explanation too short`);
  assert(
    summary.agent_display.recommended_table_fields.includes("agent_display.decision_label"),
    `${manifest.slug}: table field hint missing decision_label`,
  );
  assert(summary.agent_display.primary_blockers.length > 0, `${manifest.slug}: expected primary_blockers for table display`);
  assert(summary.agent_display.next_action.length > 20, `${manifest.slug}: next_action too short`);
  assert(summary.agent_display.table_note.length > 20, `${manifest.slug}: table_note too short`);
  assert(
    summary.agent_display.execution_automation_status.startsWith("blocked"),
    `${manifest.slug}: seed assets should still block automation despite richer table decisions`,
  );
  assert(research.markdown.length > 500, `${manifest.slug}: research markdown is unexpectedly short`);

  const seen = new Set<string>();
  let score = 0;
  for (const dimension of summary.dimensions) {
    assert(!seen.has(dimension.id), `${manifest.slug}: duplicate dimension ${dimension.id}`);
    seen.add(dimension.id);
    const expectedMax = rubricDimensionMax.get(dimension.id);
    const rubricDimension = rubricDimensionById.get(dimension.id);
    assert(expectedMax !== undefined, `${manifest.slug}: unknown rubric dimension ${dimension.id}`);
    assert(rubricDimension !== undefined, `${manifest.slug}: unknown rubric dimension ${dimension.id}`);
    assert(dimension.max_score === expectedMax, `${manifest.slug}: dimension ${dimension.id} max_score mismatch`);
    assert(dimension.score >= 0, `${manifest.slug}: negative score for ${dimension.id}`);
    assert(dimension.score <= dimension.max_score, `${manifest.slug}: score exceeds max for ${dimension.id}`);

    const selectedOption = rubricDimension.options.find((option) => option.id === dimension.selected_option);
    assert(selectedOption, `${manifest.slug}: dimension ${dimension.id} selected unknown option ${dimension.selected_option}`);
    assert(
      Array.isArray(dimension.possible_grades),
      `${manifest.slug}: dimension ${dimension.id} missing possible_grades scoring-helper options`,
    );
    assert(
      dimension.possible_grades.length === rubricDimension.options.length,
      `${manifest.slug}: dimension ${dimension.id} possible_grades length mismatch`,
    );
    for (const option of rubricDimension.options) {
      const possibleGrade = dimension.possible_grades.find((grade) => grade.id === option.id);
      assert(possibleGrade, `${manifest.slug}: dimension ${dimension.id} possible_grades missing ${option.id}`);
      assert(possibleGrade.condition === option.condition, `${manifest.slug}: dimension ${dimension.id} ${option.id} condition mismatch`);
      assert(
        JSON.stringify(possibleGrade.score_range) === JSON.stringify(option.score_range),
        `${manifest.slug}: dimension ${dimension.id} ${option.id} score_range mismatch`,
      );
      assert(possibleGrade.score_band === option.score_band, `${manifest.slug}: dimension ${dimension.id} ${option.id} score_band mismatch`);
      assert(possibleGrade.default_status === option.default_status, `${manifest.slug}: dimension ${dimension.id} ${option.id} default_status mismatch`);
      assert(
        possibleGrade.default_evidence_state === option.default_evidence_state,
        `${manifest.slug}: dimension ${dimension.id} ${option.id} default_evidence_state mismatch`,
      );
      assert(
        possibleGrade.is_selected === (option.id === dimension.selected_option),
        `${manifest.slug}: dimension ${dimension.id} ${option.id} is_selected mismatch`,
      );
      assert(
        possibleGrade.relation_to_selected === expectedRelationToSelected(option, dimension),
        `${manifest.slug}: dimension ${dimension.id} ${option.id} relation_to_selected mismatch`,
      );
    }
    const [minScore, maxScore] = selectedOption.score_range;
    assert(
      dimension.score >= minScore && dimension.score <= maxScore,
      `${manifest.slug}: dimension ${dimension.id} score ${dimension.score} outside ${dimension.selected_option} range ${minScore}-${maxScore}`,
    );
    assert(
      dimension.score_band === selectedOption.score_band,
      `${manifest.slug}: dimension ${dimension.id} score_band ${dimension.score_band} != ${selectedOption.score_band}`,
    );
    assert(
      dimension.evidence_state === selectedOption.default_evidence_state,
      `${manifest.slug}: dimension ${dimension.id} evidence_state ${dimension.evidence_state} != ${selectedOption.default_evidence_state}`,
    );
    assert(validStatuses.has(dimension.status), `${manifest.slug}: dimension ${dimension.id} invalid status ${dimension.status}`);
    assert(dimension.status === dimension.missing_behavior, `${manifest.slug}: dimension ${dimension.id} status != missing_behavior`);
    assert(dimension.question.length > 10, `${manifest.slug}: dimension ${dimension.id} missing question`);
    assert(dimension.answer.length > 10, `${manifest.slug}: dimension ${dimension.id} missing answer`);
    assert(Array.isArray(dimension.evidence), `${manifest.slug}: dimension ${dimension.id} evidence must be an array`);
    assert(dimension.evidence.length > 0, `${manifest.slug}: dimension ${dimension.id} missing evidence`);
    assert(dimension.evidence.every(evidencePointerHasContent), `${manifest.slug}: dimension ${dimension.id} has empty evidence item`);
    assert(dimension.confidence.length > 0, `${manifest.slug}: dimension ${dimension.id} missing confidence`);
    score += dimension.score;
  }

  assert(seen.size === rubric.dimensions.length, `${manifest.slug}: expected ${rubric.dimensions.length} dimensions, got ${seen.size}`);
  assert(score === summary.rubric.score, `${manifest.slug}: dimension score sum ${score} != summary score ${summary.rubric.score}`);
  if (score < 40) {
    assert(
      summary.rubric.decision_class === "blocked_or_cannot_underwrite",
      `${manifest.slug}: score below 40 must be blocked_or_cannot_underwrite`,
    );
  }
  assert(Array.isArray(summary.blocking_unknowns), `${manifest.slug}: blocking_unknowns must be an array`);
  assert(summary.blocking_unknowns.length > 0, `${manifest.slug}: expected blocking unknowns for review-required seed assets`);

  if (manifest.asset_type === "pendle_pt") {
    assert(summary.return_profile, `${manifest.slug}: PT summary must include return_profile`);
    assert(!summary.simple_token_return_estimate, `${manifest.slug}: PT summary must not include simple token return estimate`);
    assert(!summary.agent_display.simple_token_return_estimate, `${manifest.slug}: PT agent_display must not include simple token return estimate`);
    assert(!research.simple_token_return_estimate, `${manifest.slug}: PT research result must not include simple token return estimate`);
    assert(!research.simple_token_return_display, `${manifest.slug}: PT research result must not include simple token return display`);
    assert(research.return_context?.kind === "fixed_maturity_pt_return", `${manifest.slug}: PT research must include fixed-maturity return_context`);
    assert(
      JSON.stringify(research.return_context) === JSON.stringify(summary.return_context),
      `${manifest.slug}: PT research return_context must mirror summary return_context`,
    );
    assert(
      summary.agent_display.score_source === "pt_fixed_return_trade_score",
      `${manifest.slug}: PT score_source must be pt_fixed_return_trade_score`,
    );
    assert(
      summary.agent_display.score_display.includes("fixed-return PT score"),
      `${manifest.slug}: PT score_display must mention fixed-return PT score`,
    );
  } else {
    assert(
      summary.agent_display.score_source === "direct_asset_quality_score",
      `${manifest.slug}: token score_source must be direct_asset_quality_score`,
    );
    assert(simpleTokenReturnEstimateSlugs.has(manifest.slug), `${manifest.slug}: unexpected token summary without simple estimate allowlist`);
    validateSimpleTokenReturnEstimate(manifest.slug, summary);
    assert(research.simple_token_return_display === summary.agent_display.simple_token_return_display, `${manifest.slug}: research result must mirror simple token display`);
    assert(
      JSON.stringify(research.simple_token_return_estimate) === JSON.stringify(summary.simple_token_return_estimate),
      `${manifest.slug}: research result must mirror simple token estimate`,
    );
    assert(research.return_context?.kind === "direct_or_variable_token_return", `${manifest.slug}: token research must include direct/variable return_context`);
    assert(
      JSON.stringify(research.return_context) === JSON.stringify(summary.return_context),
      `${manifest.slug}: token research return_context must mirror summary return_context`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      rubric: rubric.version,
      assets: entries.map((entry) => entry.manifest.slug),
    },
    null,
    2,
  ),
);
