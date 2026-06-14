import type { AssessmentReport, Goal } from "./types";

export interface RoadmapAction {
  title: string;
  detail: string;
}
export interface RoadmapWeek {
  week: 1 | 2 | 3 | 4;
  theme: string;
  focus: string;
  actions: RoadmapAction[];
  metric: string;
}

const COMMON: Record<Goal | "Heart Health", RoadmapWeek[]> = {
  "Weight Loss": [
    { week: 1, theme: "Foundation", focus: "Establish a sustainable deficit",
      actions: [
        { title: "Daily 30-min walks", detail: "After lunch or dinner, brisk pace." },
        { title: "Swap 1 meal", detail: "Replace one refined-carb meal with protein + veg." },
        { title: "Log water", detail: "Hit 2.5L/day, finish 500ml before each meal." },
      ], metric: "Steps ≥ 7,000/day · −300 kcal vs TDEE" },
    { week: 2, theme: "Build", focus: "Add strength + structure",
      actions: [
        { title: "2× full-body strength", detail: "30 min, 6 compound moves." },
        { title: "Hit protein target", detail: "1.6–2 g/kg bodyweight daily." },
        { title: "No-snack window", detail: "12-hour overnight fast." },
      ], metric: "Weight −0.4 to −0.8 kg" },
    { week: 3, theme: "Accelerate", focus: "Increase intensity safely",
      actions: [
        { title: "Add 1 zone-2 cardio", detail: "30 min cycling or incline walk." },
        { title: "Meal-prep 2 lunches", detail: "Pre-portioned to control kcal." },
        { title: "Sleep 7+ h", detail: "Fixed bedtime, no screens 60m prior." },
      ], metric: "Resting HR trending down · waist −1 cm" },
    { week: 4, theme: "Lock in", focus: "Make it a system",
      actions: [
        { title: "Reassess targets", detail: "Recalculate BMR/TDEE at new weight." },
        { title: "Audit week", detail: "Note what worked vs. what failed." },
        { title: "Reward (non-food)", detail: "New gear, massage, hike." },
      ], metric: "Cumulative −1.5 to −3 kg, sustained habits" },
  ],
  "Weight Gain": [
    { week: 1, theme: "Surplus", focus: "Eat above maintenance",
      actions: [
        { title: "+300 kcal calorie surplus", detail: "Add nut butters, oats, olive oil." },
        { title: "4 meals/day", detail: "Breakfast, lunch, snack, dinner — no skipping." },
        { title: "Hydrate", detail: "2L water, milk with meals." },
      ], metric: "Daily intake +300 kcal · weight +0.2–0.4 kg" },
    { week: 2, theme: "Lift", focus: "Stimulate growth",
      actions: [
        { title: "3× compound lifts", detail: "Squat, press, row — progressive overload." },
        { title: "Pre-bed casein/yogurt", detail: "Slow protein for overnight synthesis." },
        { title: "Track lifts", detail: "Add 1 rep or 2.5 kg weekly." },
      ], metric: "Lifts +5% · weight +0.4 kg" },
    { week: 3, theme: "Density", focus: "Calorie-dense nutrition",
      actions: [
        { title: "Smoothie strategy", detail: "Oats + banana + peanut butter + whey." },
        { title: "Reduce excessive cardio", detail: "Cap cardio at 2×/week, 20 min." },
        { title: "Add snack between meals", detail: "Trail mix or boiled eggs." },
      ], metric: "Bodyweight +0.6 kg total" },
    { week: 4, theme: "Sustain", focus: "Maintain trajectory",
      actions: [
        { title: "Recalculate calories", detail: "Bump kcal as bodyweight rises." },
        { title: "Sleep & recovery", detail: "8h sleep, deload one workout." },
        { title: "Plan next 30 days", detail: "Decide: lean bulk or maintain." },
      ], metric: "+1.5 to +3 kg gained, mostly lean" },
  ],
  "Muscle Gain": [
    { week: 1, theme: "Prime", focus: "Dial in protein + sleep",
      actions: [
        { title: "Hit 2g/kg protein daily", detail: "Across 4 meals." },
        { title: "8h sleep window", detail: "Recovery is when muscle grows." },
        { title: "Baseline lift test", detail: "Record top sets for big lifts." },
      ], metric: "Protein ≥ 2g/kg, sleep ≥ 7.5h avg" },
    { week: 2, theme: "Volume", focus: "Hypertrophy blocks",
      actions: [
        { title: "Upper/Lower split 4×/week", detail: "8–12 reps, 3–4 sets." },
        { title: "Creatine 5g/day", detail: "Optional, evidence-backed." },
        { title: "Slight caloric surplus", detail: "+200 kcal above TDEE." },
      ], metric: "Lifts +5–10% vs. baseline" },
    { week: 3, theme: "Intensity", focus: "Push harder, recover smarter",
      actions: [
        { title: "Add drop sets to final set", detail: "Once per workout." },
        { title: "Mobility 10 min/day", detail: "Hips, shoulders, t-spine." },
        { title: "Carb-load training days", detail: "Rice/oats around lifts." },
      ], metric: "Visible pump retention · sleep latency < 20 min" },
    { week: 4, theme: "Deload + reset", focus: "Recover and reassess",
      actions: [
        { title: "Deload week — 60% volume", detail: "Same lifts, lighter." },
        { title: "Take body measurements", detail: "Arms, chest, thighs, waist." },
        { title: "Plan next mesocycle", detail: "Push/Pull/Legs or PHUL." },
      ], metric: "Body measurements +0.5–1 cm in target areas" },
  ],
  "Heart Health": [
    { week: 1, theme: "Baseline", focus: "Move daily, cut sodium",
      actions: [
        { title: "Walk 30 min daily", detail: "Zone-2 pace — can hold a conversation." },
        { title: "Cap sodium < 2g/day", detail: "Skip processed foods, sauces." },
        { title: "Track resting HR", detail: "Morning, same time each day." },
      ], metric: "RHR baseline · 5×30-min walks" },
    { week: 2, theme: "Cardio base", focus: "Build aerobic capacity",
      actions: [
        { title: "3× zone-2 cardio", detail: "40 min cycling, rowing or incline walk." },
        { title: "DASH-style meals", detail: "More greens, beans, whole grains, fish." },
        { title: "Caffeine cutoff", detail: "No caffeine after 2 PM." },
      ], metric: "Avg cardio HR in zone-2 · RHR −2 bpm" },
    { week: 3, theme: "Add strength", focus: "Resistance + recovery",
      actions: [
        { title: "2× full-body resistance", detail: "Bodyweight or light loads." },
        { title: "Omega-3 source 3×/week", detail: "Fatty fish or flax." },
        { title: "Box breathing daily", detail: "5 min 4-4-4-4 pattern." },
      ], metric: "BP trending down · stress score improved" },
    { week: 4, theme: "Consolidate", focus: "Lifelong habit",
      actions: [
        { title: "Lipid + BP check", detail: "Optional clinical re-check." },
        { title: "Cardio 150 min/week", detail: "WHO minimum, hit consistently." },
        { title: "Plan next quarter", detail: "Pick a 5k or hike target." },
      ], metric: "RHR −4 to −6 bpm, energy up" },
  ],
  "General Fitness": [
    { week: 1, theme: "Move", focus: "Establish daily activity",
      actions: [
        { title: "Daily 8k steps", detail: "Two 20-min walks + general activity." },
        { title: "Stretch 10 min/day", detail: "Hips, hamstrings, shoulders." },
        { title: "1 workout class or session", detail: "Anything you enjoy." },
      ], metric: "≥ 8k steps × 5 days" },
    { week: 2, theme: "Mix", focus: "Cardio + strength variety",
      actions: [
        { title: "2× strength training", detail: "Full-body, 30–45 min." },
        { title: "2× cardio", detail: "Run, swim, cycle — any modality." },
        { title: "Try a new movement", detail: "Yoga, pilates, climbing." },
      ], metric: "4 quality training sessions" },
    { week: 3, theme: "Nutrition", focus: "Eat for energy",
      actions: [
        { title: "Plate rule: ½ veg, ¼ protein, ¼ carbs", detail: "Every main meal." },
        { title: "Hydrate consistently", detail: "2.5L/day water." },
        { title: "Limit alcohol", detail: "Max 2 drinks across the week." },
      ], metric: "Energy + sleep quality both up" },
    { week: 4, theme: "Sustain", focus: "Make it your default",
      actions: [
        { title: "Audit habits", detail: "Which stuck? Which need a tweak?" },
        { title: "Schedule next month", detail: "Block workouts in calendar." },
        { title: "Set one performance goal", detail: "Pull-up, 5k time, plank duration." },
      ], metric: "Consistent training calendar locked in" },
  ],
};

export type RoadmapGoal = Goal | "Heart Health";

export function getRoadmap(goal: RoadmapGoal): RoadmapWeek[] {
  return COMMON[goal];
}

/** Choose the right roadmap given a report's goal and risks. */
export function recommendRoadmap(report: AssessmentReport): { goal: RoadmapGoal; weeks: RoadmapWeek[]; reason: string } {
  const { user, predictions } = report;
  if (predictions.heart_risk === "High") {
    return { goal: "Heart Health", weeks: COMMON["Heart Health"],
      reason: "Heart-risk flagged High — prioritising a cardio-protective roadmap." };
  }
  const goal = user.goal;
  return { goal, weeks: COMMON[goal], reason: `Aligned with your selected goal: ${goal}.` };
}
