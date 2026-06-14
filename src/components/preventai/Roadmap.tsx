import { useState } from "react";
import { CalendarDays, ChevronRight, Target, TrendingUp } from "lucide-react";
import { getRoadmap, recommendRoadmap, type RoadmapGoal } from "@/lib/preventai/roadmap";
import type { AssessmentReport } from "@/lib/preventai/types";

const GOAL_OPTIONS: RoadmapGoal[] = ["Weight Loss", "Weight Gain", "Muscle Gain", "Heart Health", "General Fitness"];

export function Roadmap({ report }: { report: AssessmentReport }) {
  const recommended = recommendRoadmap(report);
  const [goal, setGoal] = useState<RoadmapGoal>(recommended.goal);
  const weeks = getRoadmap(goal);

  return (
    <section className="mt-6 glass rounded-3xl p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[color:var(--brand)]" />
            <h3 className="font-display text-2xl font-semibold">30-Day Improvement Roadmap</h3>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            A week-by-week plan calibrated to your goal. Pick a track to switch focus.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[color:color-mix(in_oklab,var(--brand)_8%,transparent)] px-2.5 py-1 text-[11px] text-[color:var(--brand)]">
            <Target className="h-3 w-3" />
            Recommended: {recommended.goal}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                g === goal
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-primary-foreground"
                  : "border-border/70 bg-background/40 text-foreground hover:border-[color:color-mix(in_oklab,var(--brand)_50%,transparent)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {weeks.map((w) => (
          <div key={w.week} className="group relative rounded-2xl border border-border/70 bg-background/60 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-xs font-bold text-primary-foreground">
                  W{w.week}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{w.theme}</div>
              </div>
              <TrendingUp className="h-4 w-4 text-[color:var(--brand)] opacity-60 group-hover:opacity-100" />
            </div>
            <div className="mt-3 font-display text-base font-semibold">{w.focus}</div>
            <ul className="mt-3 space-y-2">
              {w.actions.map((a) => (
                <li key={a.title} className="flex gap-2 text-sm">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--brand)]" />
                  <span>
                    <span className="font-medium">{a.title}.</span>{" "}
                    <span className="text-muted-foreground">{a.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] px-3 py-2 text-xs text-[color:var(--success)]">
              <b>Target:</b> {w.metric}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
