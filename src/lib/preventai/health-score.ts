import type { Predictions } from "./types";

const heart_scores = { Low: 100, Medium: 70, High: 40 } as const;
const diabetes_scores = { Low: 100, Medium: 70, High: 40 } as const;
const obesity_scores = { Underweight: 70, Healthy: 100, Overweight: 70, Obese: 40 } as const;
const sleep_scores = { Good: 100, Moderate: 70, Poor: 40 } as const;
const stress_scores = { Low: 100, Moderate: 70, High: 40 } as const;

export function calculateHealthScore(p: Predictions): number {
  const final =
    heart_scores[p.heart_risk] * 0.3 +
    diabetes_scores[p.diabetes_risk] * 0.2 +
    obesity_scores[p.obesity_status] * 0.2 +
    sleep_scores[p.sleep_risk] * 0.15 +
    stress_scores[p.stress_risk] * 0.15;
  return Math.round(final);
}

export function healthCategory(score: number): "Excellent" | "Good" | "Moderate" | "Poor" {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Poor";
}

export function subScores(p: Predictions) {
  return {
    Heart: heart_scores[p.heart_risk],
    Diabetes: diabetes_scores[p.diabetes_risk],
    Body: obesity_scores[p.obesity_status],
    Sleep: sleep_scores[p.sleep_risk],
    Stress: stress_scores[p.stress_risk],
  };
}
