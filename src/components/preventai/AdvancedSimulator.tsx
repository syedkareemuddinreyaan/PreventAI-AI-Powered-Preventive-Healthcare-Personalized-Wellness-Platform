import { useMemo, useState } from "react";
import { Sliders, TrendingUp, Sparkles } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { AssessmentReport } from "@/lib/preventai/types";
import {
  snapshotCurrent, snapshotImproved, defaultImprovedKnobs, currentToKnobs,
  type LifestyleKnobs,
} from "@/lib/preventai/advanced-simulator";

const LEVEL_TONE: Record<string, string> = {
  Low: "var(--success)", Good: "var(--success)", Healthy: "var(--success)",
  Medium: "var(--warning)", Moderate: "var(--warning)", Overweight: "var(--warning)", Underweight: "var(--warning)",
  High: "var(--danger)", Poor: "var(--danger)", Obese: "var(--danger)",
};

export function AdvancedSimulator({ report }: { report: AssessmentReport }) {
  const current = useMemo(() => snapshotCurrent(report), [report]);
  const [knobs, setKnobs] = useState<LifestyleKnobs>(() => defaultImprovedKnobs(report.user, report.bmi));
  const improved = useMemo(() => snapshotImproved(report, knobs), [report, knobs]);

  const set = <K extends keyof LifestyleKnobs>(k: K, v: LifestyleKnobs[K]) =>
    setKnobs((p) => ({ ...p, [k]: v }));

  const reset = () => setKnobs(currentToKnobs(report.user));
  const optimize = () => setKnobs(defaultImprovedKnobs(report.user, report.bmi));

  const radarData = (Object.keys(current.riskScores) as (keyof typeof current.riskScores)[]).map((k) => ({
    metric: k,
    Current: current.riskScores[k],
    Improved: improved.riskScores[k],
  }));

  const delta = improved.composite - current.composite;

  return (
    <section className="mt-6 glass rounded-3xl p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[color:var(--brand)]" />
            <h3 className="font-display text-2xl font-semibold">Advanced Lifestyle Simulator</h3>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Move the sliders to model an improved lifestyle and see how each risk responds in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset}>Reset to current</Button>
          <Button size="sm" onClick={optimize} className="bg-gradient-to-r from-brand to-brand-2 text-primary-foreground hover:opacity-90">
            <Sparkles className="h-3.5 w-3.5" /> Optimize
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Sliders */}
        <div className="space-y-5 rounded-2xl border border-border/70 bg-background/40 p-5">
          <SliderRow label="Sleep" value={knobs.sleep_hours} min={4} max={10} step={0.5} unit="h"
            onChange={(v) => set("sleep_hours", v)} />
          <SliderRow label="Exercise days / week" value={knobs.exercise_days} min={0} max={7} step={1} unit=""
            onChange={(v) => set("exercise_days", v)} />
          <SliderRow label="Stress level" value={knobs.stress_level} min={1} max={10} step={1} unit="/10"
            onChange={(v) => set("stress_level", v)} invertColor />
          <SliderRow label="Weight change" value={knobs.weight_delta} min={-15} max={15} step={1} unit="kg"
            onChange={(v) => set("weight_delta", v)} signed />

          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Quit smoking</div>
              <div className="text-xs text-muted-foreground">Single biggest modifiable cardiac risk.</div>
            </div>
            <Switch checked={!knobs.smoker} onCheckedChange={(v) => set("smoker", !v)} />
          </div>
        </div>

        {/* Comparison */}
        <div className="rounded-2xl border border-border/70 bg-background/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Composite health</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold tabular-nums">{improved.composite}</span>
                <span className="text-sm text-muted-foreground">vs current {current.composite}</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${delta >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                  <TrendingUp className={`h-3.5 w-3.5 ${delta < 0 ? "rotate-180" : ""}`} />
                  {delta >= 0 ? "+" : ""}{delta}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="78%">
                <PolarGrid stroke="color-mix(in oklab, var(--foreground) 12%, transparent)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Current" dataKey="Current" stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={0.15} />
                <Radar name="Improved" dataKey="Improved" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.35} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {(["heart_risk","diabetes_risk","obesity_status","sleep_risk","stress_risk"] as const).map((k) => {
              const cur = String(current.predictions[k]);
              const imp = String(improved.predictions[k]);
              const changed = cur !== imp;
              return (
                <div key={k} className="rounded-lg border border-border/70 bg-card/50 px-2 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{labelOf(k)}</div>
                  <div className="mt-1 text-xs">
                    <span className="text-muted-foreground line-through">{cur}</span>
                    <span className="mx-1">→</span>
                    <span style={{ color: LEVEL_TONE[imp] || "var(--foreground)" }} className={`font-semibold ${changed ? "" : "opacity-70"}`}>{imp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({ label, value, min, max, step, unit, onChange, invertColor, signed }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; invertColor?: boolean; signed?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm tabular-nums text-[color:var(--brand)]">
          {signed && value > 0 ? "+" : ""}{value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min} max={max} step={step}
        onValueChange={(v) => onChange(v[0])}
        className={`mt-2 ${invertColor ? "" : ""}`}
      />
    </div>
  );
}

function labelOf(k: string) {
  return ({ heart_risk: "Heart", diabetes_risk: "Diabetes", obesity_status: "Body", sleep_risk: "Sleep", stress_risk: "Mental" } as Record<string, string>)[k];
}
