import { readFile } from "node:fs/promises";
import path from "node:path";
import { DATA_ROOT, getAssetResearch, getAssetSummary, listAssetEntries } from "./registry.js";

type RubricOption = {
  id: string;
  score_range: [number, number];
  score_band: string;
  default_status: string;
  default_evidence_state: string;
};
type RubricDimension = { id: string; max_score: number; options: RubricOption[] };
type Rubric = { version: string; max_score: number; dimensions: RubricDimension[] };
type EvidencePointer = string | { source: string; quote?: string };

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
  return_profile?: unknown;
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

function evidencePointerHasContent(item: EvidencePointer): boolean {
  if (typeof item === "string") {
    return item.trim().length > 0;
  }
  return typeof item.source === "string" && item.source.trim().length > 0;
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
  const summary = (await getAssetSummary({ asset_id: manifest.asset_id })) as Summary;
  const research = await getAssetResearch({ asset_id: manifest.asset_id });

  assert(validSummarySchemaVersions.has(summary.summary_schema_version), `${manifest.slug}: unexpected summary_schema_version`);
  assert(summary.asset_id === manifest.asset_id, `${manifest.slug}: summary asset_id mismatch`);
  assert(summary.symbol === manifest.symbol, `${manifest.slug}: summary symbol mismatch`);
  assert(summary.rubric.version === manifest.rubric_version, `${manifest.slug}: rubric version mismatch`);
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
