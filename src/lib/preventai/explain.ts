import type { AssessmentReport, Predictions, UserData } from "./types";

// Explainable AI module — surfaces the per-factor contributions to the
// composite Health Score so users can see *why* they got their number.
// Mirrors the SHAP-style "feature contribution" pattern used with the
// underlying sklearn models, computed analytically from the same weighted
// scoring formula used in health-score.ts.

export interface FactorContribution {
  key: "Heart" | "Diabetes" | "Body" | "Sleep" | "Stress";
  label: string;
  weight: number;        // 0-1, share of final score
  subScore: number;      // 0-100
  weighted: number;      // weight * subScore (points contributed to final)
  maxWeighted: number;   // weight * 100
  lost: number;          // maxWeighted - weighted
  level: string;         // textual risk level
  impact: "boost" | "neutral" | "drag";
  drivers: string[];     // human-readable reasons from inputs
  advice: string;        // single actionable next-step
}

export interface Explanation {
  baseline: number;          // 100 if everything were optimal
  finalScore: number;        // matches report.health_score
  totalLost: number;         // baseline - finalScore
  factors: FactorContribution[];
  topPositives: FactorContribution[];
  topNegatives: FactorContribution[];
  summary: string;
}

const WEIGHTS = { Heart: 0.3, Diabetes: 0.2, Body: 0.2, Sleep: 0.15, Stress: 0.15 } as const;

const SUB_MAP = {
  Heart: { Low: 100, Medium: 70, High: 40 } as Record<string, number>,
  Diabetes: { Low: 100, Medium: 70, High: 40 } as Record<string, number>,
  Body: { Underweight: 70, Healthy: 100, Overweight: 70, Obese: 40 } as Record<string, number>,
  Sleep: { Good: 100, Moderate: 70, Poor: 40 } as Record<string, number>,
  Stress: { Low: 100, Moderate: 70, High: 40 } as Record<string, number>,
};

function impactOf(sub: number): FactorContribution["impact"] {
  if (sub >= 90) return "boost";
  if (sub >= 70) return "neutral";
  return "drag";
}

function heartDrivers(u: UserData, bmi: number): string[] {
  const d: string[] = [];
  if (u.age >= 55) d.push(`Age ${u.age} (≥55) raises cardiovascular baseline`);
  else if (u.age >= 40) d.push(`Age ${u.age} adds moderate cardiac risk`);
  if (bmi >= 30) d.push(`BMI ${bmi} (obese) strains the heart`);
  else if (bmi >= 25) d.push(`BMI ${bmi} above healthy range`);
  if (u.smoker) d.push("Smoking — strongest modifiable cardiac risk");
  if (u.family_history_heart) d.push("Family history of heart disease");
  if (u.resting_hr >= 90) d.push(`Resting HR ${u.resting_hr} bpm is elevated`);
  else if (u.resting_hr >= 80) d.push(`Resting HR ${u.resting_hr} bpm slightly high`);
  if (u.activity_level === "Sedentary") d.push("Sedentary activity weakens cardio fitness");
  if (u.stress_level >= 7) d.push(`Stress level ${u.stress_level}/10 raises BP load`);
  if (d.length === 0) d.push("All key cardiac inputs are in healthy ranges");
  return d;
}

function diabetesDrivers(u: UserData, bmi: number): string[] {
  const d: string[] = [];
  if (u.age >= 50) d.push(`Age ${u.age} (≥50) increases insulin-resistance risk`);
  else if (u.age >= 35) d.push(`Age ${u.age} adds mild metabolic risk`);
  if (bmi >= 30) d.push(`BMI ${bmi} strongly drives diabetes risk`);
  else if (bmi >= 25) d.push(`BMI ${bmi} above optimal for glucose control`);
  if (u.family_history_diabetes) d.push("Family history of diabetes");
  if (u.activity_level === "Sedentary") d.push("Low activity reduces insulin sensitivity");
  if (u.sleep_hours < 6) d.push(`${u.sleep_hours}h sleep impairs glucose regulation`);
  if (d.length === 0) d.push("Metabolic markers look favorable");
  return d;
}

function bodyDrivers(bmi: number, status: string): string[] {
  const d = [`BMI ${bmi} → ${status}`];
  if (status === "Obese") d.push("Body fat above clinical threshold");
  else if (status === "Overweight") d.push("Slight surplus over healthy BMI window (18.5–25)");
  else if (status === "Underweight") d.push("Below healthy BMI — nutrient density matters");
  else d.push("Within the healthy BMI range");
  return d;
}

function sleepDrivers(u: UserData, level: string): string[] {
  const d: string[] = [`Sleeping ${u.sleep_hours}h/night`];
  if (u.sleep_hours < 6) d.push("Below the 7–9h restorative window");
  else if (u.sleep_hours > 9) d.push("Oversleeping can signal poor recovery");
  if (u.stress_level >= 7) d.push("High stress disrupts deep-sleep cycles");
  if (level === "Good") d.push("Duration + stress profile supports recovery");
  return d;
}

function stressDrivers(u: UserData, level: string): string[] {
  const d: string[] = [`Reported stress ${u.stress_level}/10`];
  if (level === "High") d.push("Chronic stress elevates cortisol and HR");
  else if (level === "Moderate") d.push("Manageable, but compounding over time");
  else d.push("Stress is well-regulated");
  return d;
}

const ADVICE: Record<string, Record<string, string>> = {
  Heart: {
    Low: "Maintain 150 min/week cardio to keep this strong.",
    Medium: "Add zone-2 cardio 3×/week and reduce sodium.",
    High: "Schedule a cardiology check-up and start low-impact cardio.",
  },
  Diabetes: {
    Low: "Keep carbs balanced and stay active.",
    Medium: "Cut refined sugar, add 8k steps/day, recheck HbA1c yearly.",
    High: "Request a fasting glucose / HbA1c test soon.",
  },
  Body: {
    Healthy: "Maintain current weight with balanced macros.",
    Overweight: "Aim for a 0.5 kg/week deficit via diet + walking.",
    Obese: "Structured deficit + resistance training; consider clinical support.",
    Underweight: "Add 300–500 nutrient-dense kcal/day.",
  },
  Sleep: {
    Good: "Protect your current 7–9h window.",
    Moderate: "Fix a consistent bedtime; cut screens 60 min before sleep.",
    Poor: "Prioritize 7+ hours and a wind-down routine this week.",
  },
  Stress: {
    Low: "Keep your recovery habits in place.",
    Moderate: "Add 10 min/day breathwork or a daily walk.",
    High: "Combine therapy, breathwork and sleep recovery.",
  },
};

export function explainHealthScore(report: AssessmentReport): Explanation {
  const { user, predictions: p, bmi, health_score } = report;

  const rows: Omit<FactorContribution, "weighted" | "maxWeighted" | "lost" | "impact">[] = [
    { key: "Heart", label: "Cardiovascular", weight: WEIGHTS.Heart, subScore: SUB_MAP.Heart[p.heart_risk], level: p.heart_risk,
      drivers: heartDrivers(user, bmi), advice: ADVICE.Heart[p.heart_risk] },
    { key: "Diabetes", label: "Metabolic / Diabetes", weight: WEIGHTS.Diabetes, subScore: SUB_MAP.Diabetes[p.diabetes_risk], level: p.diabetes_risk,
      drivers: diabetesDrivers(user, bmi), advice: ADVICE.Diabetes[p.diabetes_risk] },
    { key: "Body", label: "Body Composition", weight: WEIGHTS.Body, subScore: SUB_MAP.Body[p.obesity_status], level: p.obesity_status,
      drivers: bodyDrivers(bmi, p.obesity_status), advice: ADVICE.Body[p.obesity_status] },
    { key: "Sleep", label: "Sleep Quality", weight: WEIGHTS.Sleep, subScore: SUB_MAP.Sleep[p.sleep_risk], level: p.sleep_risk,
      drivers: sleepDrivers(user, p.sleep_risk), advice: ADVICE.Sleep[p.sleep_risk] },
    { key: "Stress", label: "Mental / Stress", weight: WEIGHTS.Stress, subScore: SUB_MAP.Stress[p.stress_risk], level: p.stress_risk,
      drivers: stressDrivers(user, p.stress_risk), advice: ADVICE.Stress[p.stress_risk] },
  ];

  const factors: FactorContribution[] = rows.map((r) => {
    const weighted = +(r.weight * r.subScore).toFixed(1);
    const maxWeighted = +(r.weight * 100).toFixed(1);
    return {
      ...r,
      weighted,
      maxWeighted,
      lost: +(maxWeighted - weighted).toFixed(1),
      impact: impactOf(r.subScore),
    };
  });

  const sortedByLoss = [...factors].sort((a, b) => b.lost - a.lost);
  const topNegatives = sortedByLoss.filter((f) => f.lost > 0).slice(0, 3);
  const topPositives = [...factors].filter((f) => f.subScore >= 90).sort((a, b) => b.weighted - a.weighted);

  const main = topNegatives[0];
  const summary = main
    ? `Your score of ${health_score}/100 is mostly driven by ${main.label.toLowerCase()} (−${main.lost.toFixed(1)} pts). ${main.advice}`
    : `Your score of ${health_score}/100 is excellent — every category is in a healthy range.`;

  return {
    baseline: 100,
    finalScore: health_score,
    totalLost: +(100 - health_score).toFixed(1),
    factors,
    topPositives,
    topNegatives,
    summary,
  };
}

export function factorColor(impact: FactorContribution["impact"]): string {
  if (impact === "boost") return "var(--success)";
  if (impact === "neutral") return "var(--brand)";
  return "var(--danger)";
}
