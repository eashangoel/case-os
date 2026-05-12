import React from "react";

const W = 340;
const H = 160;
const ACCENT = "#6c5ce7";
const PALETTE = ["#6c5ce7", "#00b894", "#fdcb6e", "#e17055", "#74b9ff", "#a29bfe"];

const ExhibitBar = ({ data }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map((d) => Math.abs(d.value))) || 1;
  const barW = Math.max(8, Math.floor((W - 44) / data.length) - 6);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {data.map((d, i) => {
        const h = Math.round((Math.abs(d.value) / max) * (H - 44));
        const x = 40 + i * (barW + 6);
        const y = H - 26 - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={2} fill={ACCENT} opacity={0.85} />
            <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize={9} fill="#8b8b9f">{d.label}</text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#c9c9d9">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const ExhibitWaterfall = ({ data }) => {
  if (!data || !data.length) return null;
  let running = 0;
  const segs = data.map((d) => {
    const start = d.type === "total" ? 0 : running;
    const end = d.type === "total" ? d.value : running + d.value;
    if (d.type !== "total") running += d.value;
    return { ...d, start, end };
  });
  const allVals = segs.flatMap((s) => [s.start, s.end]);
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(0, ...allVals);
  const range = maxV - minV || 1;
  const toY = (v) => Math.round(((maxV - v) / range) * (H - 44)) + 10;
  const barW = Math.max(8, Math.floor((W - 44) / segs.length) - 6);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {segs.map((s, i) => {
        const x = 40 + i * (barW + 6);
        const y1 = toY(Math.max(s.start, s.end));
        const y2 = toY(Math.min(s.start, s.end));
        const h = Math.max(2, y2 - y1);
        const color = s.type === "total" ? ACCENT : s.end >= s.start ? "#00b894" : "#e17055";
        return (
          <g key={i}>
            <rect x={x} y={y1} width={barW} height={h} rx={2} fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="#8b8b9f">{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const ExhibitDonut = ({ data }) => {
  if (!data || !data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = W / 2;
  const cy = H / 2 - 6;
  const r = 54;
  const ir = r * 0.55;
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const a = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += a;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = a > Math.PI ? 1 : 0;
    const ix1 = cx + ir * Math.cos(angle - a);
    const iy1 = cy + ir * Math.sin(angle - a);
    const ix2 = cx + ir * Math.cos(angle);
    const iy2 = cy + ir * Math.sin(angle);
    return (
      <path
        key={i}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`}
        fill={PALETTE[i % PALETTE.length]}
        opacity={0.85}
      />
    );
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {slices}
      {data.map((d, i) => {
        const lx = 20 + i * 90;
        return (
          <g key={i}>
            <rect x={lx} y={H - 16} width={8} height={8} rx={2} fill={PALETTE[i % PALETTE.length]} />
            <text x={lx + 12} y={H - 9} fontSize={9} fill="#8b8b9f">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const ExhibitTable = ({ headers, rows }) => (
  <table className="exhibit-table">
    <thead>
      <tr>{(headers || []).map((h, i) => <th key={i}>{h}</th>)}</tr>
    </thead>
    <tbody>
      {(rows || []).map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td key={j} className={typeof cell === "number" ? "num" : ""}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const ExhibitCard = ({ exhibit }) => {
  if (!exhibit) return null;
  const { type, title, subtitle, data, headers, rows } = exhibit;

  let chart = null;
  if (type === "bar") chart = <ExhibitBar data={data} />;
  else if (type === "waterfall") chart = <ExhibitWaterfall data={data} />;
  else if (type === "donut") chart = <ExhibitDonut data={data} />;
  else if (type === "table") chart = <ExhibitTable headers={headers} rows={rows} />;

  return (
    <div className="exhibit-card">
      <div className="exhibit-header">
        <span>EXHIBIT</span>
        <span className="exhibit-title">{title}</span>
        {subtitle && <span style={{ marginLeft: "auto", opacity: 0.7 }}>{subtitle}</span>}
      </div>
      <div className="exhibit-body">{chart}</div>
    </div>
  );
};
