import type { AssessmentReport, UserData, Predictions } from "./types";
import { calculateBMI, bmiCategory } from "./diet";

export interface LifestyleKnobs {
  sleep_hours: number;     // 4–10
  exercise_days: number;   // 0–7
  stress_level: number;    // 1–10
  smoker: boolean;
  weight_delta: number;    // kg vs current (negative = lose)
}

export interface SimulatedSnapshot {
  predictions: Predictions;
  bmi: number;
  bmi_category: string;
  riskScores: { Heart: number; Diabetes: number; Obesity: number; Sleep: number; Mental: number };
  composite: number;       // 0-100, higher = healthier
}

const LEVEL_TO_NUM = { Low: 1, Medium: 2, High: 3 } as const;
const SLEEP_TO_NUM = { Good: 1, Moderate: 2, Poor: 3 } as const;
const BODY_TO_NUM = { Healthy: 1, Overweight: 2, Underweight: 2, Obese: 3 } as const;

function knobsFromReport(u: UserData): LifestyleKnobs {
  return {
    sleep_hours: u.sleep_hours,
    exercise_days: u.activity_level === "Sedentary" ? 0 : u.activity_level === "Light" ? 2 : u.activity_level === "Moderate" ? 4 : 6,
    stress_level: u.stress_level,
    smoker: u.smoker,
    weight_delta: 0,
  };
}

function simulateFromKnobs(report: AssessmentReport, k: LifestyleKnobs): SimulatedSnapshot {
  const u = report.user;
  const newWeight = Math.max(35, u.weight + k.weight_delta);
  const bmi = calculateBMI(newWeight, u.height);
  const obesity = bmiCategory(bmi);

  // Score-based heuristic risk model (continuous), then bucketed.
  const baseHeart = (u.age >= 55 ? 30 : u.age >= 40 ? 15 : 5)
    + (bmi >= 30 ? 25 : bmi >= 25 ? 12 : 0)
    + (k.smoker ? 25 : 0)
    + (u.family_history_heart ? 15 : 0)
    + (k.exercise_days >= 4 ? -15 : k.exercise_days >= 2 ? -8 : 5)
    + (k.stress_level >= 7 ? 10 : k.stress_level >= 4 ? 3 : -5)
    + (u.resting_hr >= 90 ? 10 : u.resting_hr >= 80 ? 5 : 0);
  const baseDiabetes = (u.age >= 45 ? 20 : 5)
    + (bmi >= 30 ? 30 : bmi >= 25 ? 15 : 0)
    + (u.family_history_diabetes ? 18 : 0)
    + (k.exercise_days >= 3 ? -15 : 5)
    + (k.sleep_hours < 6 ? 10 : 0);
  const baseSleep = (k.sleep_hours < 6 ? 35 : k.sleep_hours < 7 ? 20 : k.sleep_hours > 9 ? 15 : -10)
    + (k.stress_level >= 7 ? 15 : 0);
  const baseMental = (k.stress_level - 5) * 10
    + (k.sleep_hours < 6 ? 10 : 0)
    + (k.exercise_days >= 3 ? -10 : 0);

  const toLevel = (s: number): "Low" | "Medium" | "High" =>
    s < 20 ? "Low" : s < 45 ? "Medium" : "High";
  const toSleep = (s: number): "Good" | "Moderate" | "Poor" =>
    s < 10 ? "Good" : s < 25 ? "Moderate" : "Poor";
  const toStress = (s: number): "Low" | "Moderate" | "High" =>
    s < 20 ? "Low" : s < 45 ? "Moderate" : "High";

  const predictions: Predictions = {
    heart_risk: toLevel(baseHeart),
    diabetes_risk: toLevel(baseDiabetes),
    obesity_status: obesity,
    sleep_risk: toSleep(baseSleep),
    stress_risk: toStress(baseMental + 25),
  };

  // Per-risk "healthiness score" 0-100 (100 = ideal)
  const healthMap = { Low: 95, Medium: 65, High: 35 } as const;
  const sleepMap = { Good: 95, Moderate: 65, Poor: 35 } as const;
  const stressMap = { Low: 95, Moderate: 65, High: 35 } as const;
  const bodyMap = { Healthy: 95, Overweight: 65, Underweight: 70, Obese: 35 } as const;
  const riskScores = {
    Heart: healthMap[predictions.heart_risk],
    Diabetes: healthMap[predictions.diabetes_risk],
    Obesity: bodyMap[predictions.obesity_status],
    Sleep: sleepMap[predictions.sleep_risk],
    Mental: stressMap[predictions.stress_risk],
  };
  const composite = Math.round(
    riskScores.Heart * 0.3 + riskScores.Diabetes * 0.2 + riskScores.Obesity * 0.2 +
    riskScores.Sleep * 0.15 + riskScores.Mental * 0.15,
  );

  return { predictions, bmi, bmi_category: obesity, riskScores, composite };
}

export function snapshotCurrent(report: AssessmentReport): SimulatedSnapshot {
  return simulateFromKnobs(report, knobsFromReport(report.user));
}

export function snapshotImproved(report: AssessmentReport, knobs: LifestyleKnobs): SimulatedSnapshot {
  return simulateFromKnobs(report, knobs);
}

export function defaultImprovedKnobs(u: UserData, bmi: number): LifestyleKnobs {
  const targetWeight = bmi > 25 ? -Math.min(6, u.weight - (24.9 * (u.height / 100) ** 2)) : bmi < 18.5 ? 3 : 0;
  return {
    sleep_hours: 8,
    exercise_days: Math.max(4, u.activity_level === "Active" ? 5 : 4),
    stress_level: Math.max(3, u.stress_level - 3),
    smoker: false,
    weight_delta: Math.round(targetWeight),
  };
}

export function currentToKnobs(u: UserData): LifestyleKnobs {
  return knobsFromReport(u);
}

// Re-export to satisfy unused-warnings if any
export const _internal = { LEVEL_TO_NUM, SLEEP_TO_NUM, BODY_TO_NUM };
