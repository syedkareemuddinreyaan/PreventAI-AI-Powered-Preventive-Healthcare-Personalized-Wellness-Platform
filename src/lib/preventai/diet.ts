import type { ObesityStatus, UserData, Goal } from "./types";

export function calculateBMI(weight: number, height: number): number {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 100) / 100;
}

export function bmiCategory(bmi: number): ObesityStatus {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateBMR(u: UserData): number {
  const base = 10 * u.weight + 6.25 * u.height - 5 * u.age;
  return Math.round(u.gender === "Male" ? base + 5 : base - 161);
}

export function calculateTDEE(bmr: number, activity: UserData["activity_level"]): number {
  const m = { Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725 }[activity];
  return Math.round(bmr * m);
}

export function calculateGoalCalories(tdee: number, goal: Goal): number {
  if (goal === "Weight Loss") return tdee - 500;
  if (goal === "Weight Gain") return tdee + 300;
  if (goal === "Muscle Gain") return tdee + 200;
  return tdee;
}

export function calculateProtein(weight: number, goal: Goal): number {
  const m = { "Weight Loss": 1.8, "Muscle Gain": 2.0, "Weight Gain": 1.6, "General Fitness": 1.5 }[goal];
  return Math.round(weight * m);
}

export function calculateFats(calories: number): number {
  return Math.round((calories * 0.25) / 9);
}

export function calculateCarbs(calories: number, protein: number, fats: number): number {
  const remaining = calories - protein * 4 - fats * 9;
  return Math.round(remaining / 4);
}

export const mealPlans: Record<Goal, Record<"Breakfast" | "Lunch" | "Dinner" | "Snack", string[]>> = {
  "Weight Loss": {
    Breakfast: ["Steel-cut oats with berries", "2 boiled eggs", "Green tea"],
    Lunch: ["Brown rice (1 cup)", "Grilled chicken breast (150g)", "Steamed vegetables"],
    Dinner: ["Grilled paneer or tofu", "Mixed greens salad", "Olive oil dressing"],
    Snack: ["Greek yogurt", "Almonds (small handful)"],
  },
  "Muscle Gain": {
    Breakfast: ["Oats with peanut butter", "Banana", "Whey protein shake"],
    Lunch: ["Basmati rice (1.5 cups)", "Chicken or chickpeas", "Sautéed vegetables"],
    Dinner: ["Paneer / fish", "Rice", "Side of dal"],
    Snack: ["Cottage cheese", "Mixed nuts"],
  },
  "Weight Gain": {
    Breakfast: ["3 eggs", "Whole milk", "Banana with peanut butter"],
    Lunch: ["Rice", "Chicken curry", "Potatoes"],
    Dinner: ["Paneer", "Chapati", "Lentil soup"],
    Snack: ["Trail mix", "Smoothie with oats"],
  },
  "General Fitness": {
    Breakfast: ["Oats", "Seasonal fruit", "Green tea"],
    Lunch: ["Rice", "Dal", "Sautéed vegetables"],
    Dinner: ["Garden salad", "Paneer or grilled fish"],
    Snack: ["Fruit", "Nuts"],
  },
};
