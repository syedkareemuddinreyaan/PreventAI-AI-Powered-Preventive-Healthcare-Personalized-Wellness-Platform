import type { AssessmentReport, UserData } from "./types";
import { runPredictions } from "./predict";
import { calculateBMI, bmiCategory, calculateBMR, calculateTDEE, calculateGoalCalories, calculateProtein, calculateFats, calculateCarbs } from "./diet";
import { calculateHealthScore, healthCategory } from "./health-score";

const KEY = "preventai:report";

export function buildReport(user: UserData): AssessmentReport {
  const predictions = runPredictions(user);
  const bmi = calculateBMI(user.weight, user.height);
  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(bmr, user.activity_level);
  const calories = calculateGoalCalories(tdee, user.goal);
  const protein = calculateProtein(user.weight, user.goal);
  const fats = calculateFats(calories);
  const carbs = calculateCarbs(calories, protein, fats);
  const health_score = calculateHealthScore(predictions);
  return {
    user,
    predictions,
    bmi,
    bmi_category: bmiCategory(bmi),
    bmr,
    tdee,
    calories,
    protein,
    fats,
    carbs,
    health_score,
    health_category: healthCategory(health_score),
    createdAt: new Date().toISOString(),
  };
}

export function saveReport(r: AssessmentReport) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(r));
}

export function loadReport(): AssessmentReport | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AssessmentReport; } catch { return null; }
}

export function demoUser(): UserData {
  return {
    name: "Alex",
    age: 32,
    gender: "Male",
    weight: 86,
    height: 178,
    activity_level: "Sedentary",
    goal: "Weight Loss",
    sleep_hours: 6,
    stress_level: 7,
    smoker: false,
    family_history_heart: true,
    family_history_diabetes: false,
    resting_hr: 82,
  };
}
