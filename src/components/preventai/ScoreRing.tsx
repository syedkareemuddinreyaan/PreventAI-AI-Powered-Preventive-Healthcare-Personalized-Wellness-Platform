interface Props {
  value: number; // 0-100
  label?: string;
  size?: number;
}

export function ScoreRing({ value, label, size = 220 }: Props) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  const color =
    pct >= 85 ? "var(--success)" : pct >= 70 ? "var(--brand)" : pct >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={pct >= 70 ? "url(#ring-grad)" : color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl font-semibold tabular-nums">{Math.round(pct)}</div>
        {label && <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}
