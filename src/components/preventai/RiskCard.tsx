import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  level: string;
  description: string;
  tone: "low" | "med" | "high" | "ok" | "warn";
}

const toneCls: Record<Props["tone"], string> = {
  low: "text-[color:var(--success)] bg-[color:color-mix(in_oklab,var(--success)_15%,transparent)] border-[color:color-mix(in_oklab,var(--success)_30%,transparent)]",
  ok: "text-[color:var(--success)] bg-[color:color-mix(in_oklab,var(--success)_15%,transparent)] border-[color:color-mix(in_oklab,var(--success)_30%,transparent)]",
  med: "text-[color:var(--warning)] bg-[color:color-mix(in_oklab,var(--warning)_15%,transparent)] border-[color:color-mix(in_oklab,var(--warning)_30%,transparent)]",
  warn: "text-[color:var(--warning)] bg-[color:color-mix(in_oklab,var(--warning)_15%,transparent)] border-[color:color-mix(in_oklab,var(--warning)_30%,transparent)]",
  high: "text-[color:var(--danger)] bg-[color:color-mix(in_oklab,var(--danger)_15%,transparent)] border-[color:color-mix(in_oklab,var(--danger)_30%,transparent)]",
};

export function RiskCard({ icon: Icon, title, level, description, tone }: Props) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-foreground/80">
          <Icon className="h-5 w-5" />
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${toneCls[tone]}`}>
          {level}
        </span>
      </div>
      <div className="mt-4 font-display text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
