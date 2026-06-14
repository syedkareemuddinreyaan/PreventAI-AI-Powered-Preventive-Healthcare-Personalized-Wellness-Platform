import { jsPDF } from "jspdf";
import type { AssessmentReport } from "./types";
import { recommendWorkout } from "./workout";
import { mealPlans } from "./diet";
import { explainHealthScore } from "./explain";
import { recommendRoadmap } from "./roadmap";

const BRAND = "#0EA5E9";
const TEAL = "#14B8A6";
const GREEN = "#10B981";
const TEXT = "#0F172A";
const MUTED = "#475569";
const BORDER = "#E2E8F0";

export function downloadHealthReport(report: AssessmentReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const page = { w: 595, h: 842, m: 40 };
  let y = page.m;

  const setText = (size: number, color = TEXT, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
  };

  const ensure = (need: number) => {
    if (y + need > page.h - 50) { doc.addPage(); y = page.m; }
  };

  const sectionTitle = (title: string) => {
    ensure(40);
    setText(14, BRAND, true);
    doc.text(title.toUpperCase(), page.m, y);
    doc.setDrawColor(BRAND);
    doc.setLineWidth(0.8);
    doc.line(page.m, y + 4, page.m + 60, y + 4);
    y += 22;
  };

  const para = (text: string, opts: { size?: number; color?: string; bold?: boolean } = {}) => {
    setText(opts.size ?? 10, opts.color ?? TEXT, opts.bold ?? false);
    const lines = doc.splitTextToSize(text, page.w - page.m * 2);
    ensure(lines.length * 14);
    doc.text(lines, page.m, y);
    y += lines.length * 13 + 4;
  };

  const bullet = (text: string) => {
    setText(10, TEXT);
    const lines = doc.splitTextToSize(text, page.w - page.m * 2 - 14);
    ensure(lines.length * 13 + 4);
    setText(10, BRAND, true);
    doc.text("•", page.m, y);
    setText(10, TEXT);
    doc.text(lines, page.m + 12, y);
    y += lines.length * 13 + 3;
  };

  // ===== Cover header =====
  doc.setFillColor(BRAND);
  doc.rect(0, 0, page.w, 90, "F");
  setText(22, "#FFFFFF", true);
  doc.text("PreventAI", page.m, 45);
  setText(11, "#E0F2FE");
  doc.text("Personalized Preventive Health Report", page.m, 65);
  setText(9, "#E0F2FE");
  doc.text(new Date(report.createdAt).toLocaleString(), page.w - page.m, 65, { align: "right" });
  y = 120;

  // ===== Profile =====
  sectionTitle("01 · User Profile");
  const u = report.user;
  const profile = [
    [`Name`, u.name || "—"],
    [`Age / Gender`, `${u.age} · ${u.gender}`],
    [`Height / Weight`, `${u.height} cm · ${u.weight} kg`],
    [`Activity`, u.activity_level],
    [`Sleep`, `${u.sleep_hours} h / night`],
    [`Stress`, `${u.stress_level} / 10`],
    [`Resting HR`, `${u.resting_hr} bpm`],
    [`Smoker`, u.smoker ? "Yes" : "No"],
    [`Family history`, `Heart: ${u.family_history_heart ? "Yes" : "No"} · Diabetes: ${u.family_history_diabetes ? "Yes" : "No"}`],
    [`Goal`, u.goal],
  ];
  const colW = (page.w - page.m * 2) / 2;
  profile.forEach(([k, v], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const rx = page.m + col * colW;
    const ry = y + row * 22;
    setText(8, MUTED);
    doc.text(k.toUpperCase(), rx, ry);
    setText(11, TEXT, true);
    doc.text(String(v), rx, ry + 13);
  });
  y += Math.ceil(profile.length / 2) * 22 + 10;

  // ===== Risk analysis =====
  sectionTitle("02 · Risk Analysis");
  const p = report.predictions;
  const risks: Array<[string, string, string]> = [
    ["Heart Disease", p.heart_risk, riskColor(p.heart_risk)],
    ["Diabetes", p.diabetes_risk, riskColor(p.diabetes_risk)],
    ["Body Composition", p.obesity_status, bodyColor(p.obesity_status)],
    ["Sleep Disorder", p.sleep_risk, sleepColor(p.sleep_risk)],
    ["Mental Health", p.stress_risk, riskColor(p.stress_risk)],
  ];
  risks.forEach(([title, level, color]) => {
    ensure(40);
    doc.setDrawColor(BORDER);
    doc.setFillColor("#F8FAFC");
    doc.roundedRect(page.m, y, page.w - page.m * 2, 32, 6, 6, "FD");
    setText(11, TEXT, true);
    doc.text(title, page.m + 12, y + 20);
    doc.setFillColor(color);
    doc.roundedRect(page.w - page.m - 90, y + 8, 78, 16, 6, 6, "F");
    setText(9, "#FFFFFF", true);
    doc.text(level.toUpperCase(), page.w - page.m - 51, y + 19, { align: "center" });
    y += 38;
  });

  // ===== Explanation (top drivers) =====
  sectionTitle("03 · Why You Got These Predictions");
  const exp = explainHealthScore(report);
  para(exp.summary, { color: MUTED });
  exp.factors.forEach((f) => {
    ensure(50);
    setText(11, TEXT, true);
    doc.text(`${f.label} — ${f.level}`, page.m, y);
    setText(9, MUTED);
    doc.text(`contributes ${f.weighted.toFixed(1)} / ${f.maxWeighted.toFixed(1)} pts`, page.w - page.m, y, { align: "right" });
    y += 6;
    // bar
    const barW = page.w - page.m * 2;
    doc.setFillColor("#E2E8F0");
    doc.roundedRect(page.m, y + 4, barW, 6, 3, 3, "F");
    const fillW = Math.max(2, (f.weighted / f.maxWeighted) * barW);
    doc.setFillColor(f.impact === "boost" ? GREEN : f.impact === "neutral" ? BRAND : "#EF4444");
    doc.roundedRect(page.m, y + 4, fillW, 6, 3, 3, "F");
    y += 18;
    f.drivers.slice(0, 3).forEach((d) => bullet(d));
    para(`Next step: ${f.advice}`, { size: 9, color: TEAL, bold: true });
  });

  // ===== Diet =====
  doc.addPage(); y = page.m;
  sectionTitle("04 · Personalized Diet Plan");
  para(`Daily target: ${report.calories} kcal · ${report.protein}g protein · ${report.carbs}g carbs · ${report.fats}g fats`, { bold: true });
  const meals = mealPlans[u.goal];
  (Object.keys(meals) as (keyof typeof meals)[]).forEach((slot) => {
    ensure(40);
    setText(11, BRAND, true);
    doc.text(slot, page.m, y);
    y += 14;
    meals[slot].forEach(bullet);
    y += 4;
  });

  // ===== Workout =====
  sectionTitle("05 · Adaptive Workout Plan");
  const w = recommendWorkout(p, u);
  para(`Training style: ${w.training_type}`, { bold: true });
  w.weekly_plan.forEach(bullet);
  if (w.avoid.length) {
    y += 4;
    setText(10, "#B91C1C", true);
    doc.text("Avoid:", page.m, y); y += 14;
    w.avoid.forEach(bullet);
  }

  // ===== Roadmap =====
  doc.addPage(); y = page.m;
  sectionTitle("06 · 30-Day Improvement Roadmap");
  const rm = recommendRoadmap(report);
  para(`Track: ${rm.goal} · ${rm.reason}`, { color: MUTED });
  rm.weeks.forEach((wk) => {
    ensure(70);
    setText(11, BRAND, true);
    doc.text(`Week ${wk.week} — ${wk.theme}`, page.m, y);
    setText(9, MUTED);
    doc.text(wk.metric, page.w - page.m, y, { align: "right" });
    y += 14;
    setText(10, TEXT);
    doc.text(`Focus: ${wk.focus}`, page.m, y);
    y += 14;
    wk.actions.forEach((a) => bullet(`${a.title} — ${a.detail}`));
    y += 6;
  });

  // ===== Footer disclaimer =====
  ensure(60);
  setText(8, MUTED);
  doc.text(
    doc.splitTextToSize(
      "Disclaimer: PreventAI provides AI-generated lifestyle insights based on the data you supplied. It is not a medical device and does not provide diagnosis, treatment or prescription. Consult a qualified clinician for medical concerns.",
      page.w - page.m * 2,
    ),
    page.m, y,
  );

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setText(8, MUTED);
    doc.text(`PreventAI · ${u.name || "Personal Report"}`, page.m, page.h - 20);
    doc.text(`Page ${i} of ${total}`, page.w - page.m, page.h - 20, { align: "right" });
  }

  doc.save(`PreventAI_Report_${(u.name || "user").replace(/\s+/g, "_")}.pdf`);
}

function riskColor(l: string) { return l === "Low" ? GREEN : l === "Medium" ? "#F59E0B" : "#EF4444"; }
function sleepColor(l: string) { return l === "Good" ? GREEN : l === "Moderate" ? "#F59E0B" : "#EF4444"; }
function bodyColor(l: string) { return l === "Healthy" ? GREEN : l === "Obese" ? "#EF4444" : "#F59E0B"; }
