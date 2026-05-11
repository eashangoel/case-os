import React from "react";

export const RadarChart = ({
  axes = [],
  max = 5,
  size = 280,
  rings = 5,
  series = null,
  showLabels = true,
  showGrid = true,
}) => {
  const cx = size / 2, cy = size / 2;
  const radius = (size / 2) - 38;
  const n = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i, v) => {
    const r = (v / max) * radius;
    return [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  };

  const plotted = series && series.length ? series : [{
    values: axes.map(a => a.value),
    color: "var(--accent)",
    fillOpacity: 0.18,
  }];

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {showGrid && (
        <g>
          {Array.from({ length: rings }).map((_, r) => {
            const rr = ((r + 1) / rings) * radius;
            const pts = axes.map((_, i) => {
              const x = cx + Math.cos(angle(i)) * rr;
              const y = cy + Math.sin(angle(i)) * rr;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(" ");
            return (
              <polygon
                key={r}
                points={pts}
                fill="none"
                stroke="var(--line-1)"
                strokeWidth="1"
                opacity={r === rings - 1 ? 1 : 0.55}
              />
            );
          })}
          {axes.map((_, i) => {
            const [x, y] = point(i, max);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line-1)" strokeWidth="1" />;
          })}
        </g>
      )}

      {plotted.map((s, si) => {
        const pts = axes.map((_, i) => point(i, s.values[i]));
        const path = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
        return (
          <g key={si}>
            <polygon
              points={path}
              fill={s.color}
              fillOpacity={s.fillOpacity ?? 0.15}
              stroke={s.color}
              strokeWidth="1.5"
              strokeDasharray={s.dashed ? "3 3" : ""}
            />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="var(--bg-0)" stroke={s.color} strokeWidth="1.5" />
            ))}
          </g>
        );
      })}

      {showLabels && axes.map((a, i) => {
        const labelR = radius + 22;
        const x = cx + Math.cos(angle(i)) * labelR;
        const y = cy + Math.sin(angle(i)) * labelR;
        const anchor = Math.abs(Math.cos(angle(i))) < 0.3 ? "middle" : (Math.cos(angle(i)) > 0 ? "start" : "end");
        return (
          <g key={i}>
            <text
              x={x} y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="var(--text-2)"
              fontSize="10.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.06em"
              style={{ textTransform: "uppercase" }}
            >
              {a.label}
            </text>
            {a.value != null && (
              <text
                x={x} y={y + 13}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--text-1)"
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {a.value}<tspan fill="var(--text-4)">/{max}</tspan>
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const LineChart = ({
  series = [],
  labels = [],
  width = 760,
  height = 260,
  yMin = 0,
  yMax = 5,
  padding = { top: 20, right: 24, bottom: 32, left: 36 },
}) => {
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const n = labels.length || (series[0]?.data.length ?? 0);

  const xAt = (i) => padding.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const yAt = (v) => padding.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 1) yTicks.push(v);

  return (
    <svg width={width} height={height} style={{ display: "block", maxWidth: "100%" }}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={padding.left} x2={padding.left + innerW} y1={yAt(v)} y2={yAt(v)} stroke="var(--line-1)" strokeWidth="1" strokeDasharray={v === yMin ? "" : "2 4"} />
          <text x={padding.left - 8} y={yAt(v)} textAnchor="end" dominantBaseline="middle" fill="var(--text-3)" fontSize="10" fontFamily="JetBrains Mono, monospace">{v}</text>
        </g>
      ))}

      {labels.map((lbl, i) => (
        <text key={i} x={xAt(i)} y={height - padding.bottom + 18} textAnchor="middle" fill="var(--text-3)" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="0.04em">{lbl}</text>
      ))}

      {series.map((s, si) => {
        const path = s.data.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
        return (
          <g key={si}>
            <path d={path} fill="none" stroke={s.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            {s.data.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2.5" fill="var(--bg-0)" stroke={s.color} strokeWidth="1.5" />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
