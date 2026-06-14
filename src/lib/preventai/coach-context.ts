import type { AssessmentReport } from "./types";

/** Compact, human-readable assessment summary the coach can reference. */
export function buildCoachContext(report: AssessmentReport | null): string {
  if (!report) return "The user has not completed an assessment yet.";
  const { user: u, predictions: p, bmi, bmi_category, calories, protein, fats, carbs } = report;
  return [
    `Name: ${u.name || "unspecified"}, Age: ${u.age}, Gender: ${u.gender}`,
    `Body: ${u.weight}kg / ${u.height}cm — BMI ${bmi} (${bmi_category})`,
    `Lifestyle: ${u.activity_level} activity, ${u.sleep_hours}h sleep, stress ${u.stress_level}/10, resting HR ${u.resting_hr}, ${u.smoker ? "smoker" : "non-smoker"}`,
    `Family history: heart=${u.family_history_heart}, diabetes=${u.family_history_diabetes}`,
    `Goal: ${u.goal}`,
    `Risk predictions — Heart: ${p.heart_risk}, Diabetes: ${p.diabetes_risk}, Obesity: ${p.obesity_status}, Sleep: ${p.sleep_risk}, Mental: ${p.stress_risk}`,
    `Daily targets — ${calories} kcal | ${protein}g protein | ${carbs}g carbs | ${fats}g fats`,
  ].join("\n");
}
