import type { Predictions, UserData, RiskLevel, ObesityStatus, SleepRisk, StressRisk } from "./types";
import { calculateBMI, bmiCategory } from "./diet";

// Heuristic risk predictors that mirror the structure of the trained models
// (heart, diabetes, obesity, sleep, mental) using the same input features.
// In production these would call the .pkl scikit-learn models via an inference API.

function level(score: number): RiskLevel {
  if (score >= 6) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

export function predictHeart(u: UserData, bmi: number): RiskLevel {
  let s = 0;
  if (u.age >= 55) s += 2; else if (u.age >= 40) s += 1;
  if (bmi >= 30) s += 2; else if (bmi >= 25) s += 1;
  if (u.smoker) s += 2;
  if (u.family_history_heart) s += 2;
  if (u.resting_hr >= 90) s += 2; else if (u.resting_hr >= 80) s += 1;
  if (u.activity_level === "Sedentary") s += 1;
  if (u.stress_level >= 7) s += 1;
  return level(s);
}

export function predictDiabetes(u: UserData, bmi: number): RiskLevel {
  let s = 0;
  if (u.age >= 50) s += 2; else if (u.age >= 35) s += 1;
  if (bmi >= 30) s += 3; else if (bmi >= 25) s += 1;
  if (u.family_history_diabetes) s += 2;
  if (u.activity_level === "Sedentary") s += 1;
  if (u.sleep_hours < 6) s += 1;
  return level(s);
}

export function predictObesity(bmi: number): ObesityStatus {
  return bmiCategory(bmi);
}

export function predictSleep(u: UserData): SleepRisk {
  if (u.sleep_hours >= 7 && u.sleep_hours <= 9 && u.stress_level <= 5) return "Good";
  if (u.sleep_hours >= 6 && u.sleep_hours <= 10 && u.stress_level <= 7) return "Moderate";
  return "Poor";
}

export function predictStress(u: UserData): StressRisk {
  if (u.stress_level <= 3) return "Low";
  if (u.stress_level <= 7) return "Moderate";
  return "High";
}

export function runPredictions(u: UserData): Predictions {
  const bmi = calculateBMI(u.weight, u.height);
  return {
    heart_risk: predictHeart(u, bmi),
    diabetes_risk: predictDiabetes(u, bmi),
    obesity_status: predictObesity(bmi),
    sleep_risk: predictSleep(u),
    stress_risk: predictStress(u),
  };
}
