/** Lightweight brand-coloured SVG charts (no external chart dependency). */

export interface Slice {
  label: string;
  value: number;
  color?: string;
}

const PALETTE = [
  "var(--color-primary)",
  "var(--color-muted-foreground)",
  "var(--color-success)",
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-foreground)",
];

export function BarChart({
  data,
  unit,
  height = 200,
}: {
  data: Slice[];
  unit?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <ChartEmpty />;
  return (
    <div className="space-y-2" style={{ minHeight: height }}>
      {data.map((d, i) => (
        <div key={d.label} className="grid grid-cols-[10rem_1fr_auto] items-center gap-3">
          <span className="truncate text-xs text-muted-foreground" title={d.label}>
            {d.label}
          </span>
          <span className="h-3 w-full rounded-sm bg-neutral-soft">
            <span
              className="block h-3 rounded-sm"
              style={{
                width: `${Math.max(2, (d.value / max) * 100)}%`,
                backgroundColor: d.color ?? PALETTE[i % PALETTE.length],
              }}
            />
          </span>
          <span className="font-mono text-xs tabular-nums">
            {d.value.toLocaleString()}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data, size = 168 }: { data: Slice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <ChartEmpty />;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color ?? PALETTE[i % PALETTE.length]}
                strokeWidth={16}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          className="fill-foreground font-mono text-lg font-semibold"
        >
          {total.toLocaleString()}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          className="fill-muted-foreground text-[0.6rem] uppercase tracking-wider"
        >
          Total
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: d.color ?? PALETTE[i % PALETTE.length] }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-mono tabular-nums">{d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
      No data available for the current filters.
    </div>
  );
}
