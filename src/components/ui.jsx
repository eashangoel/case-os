import React from "react";

export const Icon = ({ name, size = 14, className = "", style = {} }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 16 16",
    fill: "none", stroke: "currentColor",
    strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round",
    className: "icon " + className, style,
  };
  switch (name) {
    case "library":
      return <svg {...props}><path d="M3 3h4v10H3zM9 3h4v10H9zM3 13h10" /></svg>;
    case "simulator":
      return <svg {...props}><path d="M2 4h12v8H2z" /><path d="M5 8h2M9 8h2M5 10h6" /></svg>;
    case "scorecard":
      return <svg {...props}><path d="M3 3h10v10H3z" /><path d="M6 8l1.5 1.5L11 6" /></svg>;
    case "progress":
      return <svg {...props}><path d="M2 12V4M2 12h12" /><path d="M4 10l3-3 2 2 4-5" /></svg>;
    case "search":
      return <svg {...props}><circle cx="7" cy="7" r="4" /><path d="M13 13l-3-3" /></svg>;
    case "sparkles":
      return <svg {...props}><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 6l2-2" /></svg>;
    case "play":
      return <svg {...props}><path d="M5 3l7 5-7 5z" fill="currentColor" stroke="none" /></svg>;
    case "arrow-right":
      return <svg {...props}><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
    case "arrow-up-right":
      return <svg {...props}><path d="M5 11l6-6M6 5h5v5" /></svg>;
    case "flame":
      return <svg {...props}><path d="M8 14c2.5 0 4-1.7 4-4 0-2-1.5-3-2-5-1.5 1-2 2-2 3 0-1.5-.5-2.5-1.5-3.5C5 6 4 8 4 10c0 2.3 1.5 4 4 4z" /></svg>;
    case "clock":
      return <svg {...props}><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>;
    case "user":
      return <svg {...props}><circle cx="8" cy="6" r="2.5" /><path d="M3 13c.8-2.5 2.8-4 5-4s4.2 1.5 5 4" /></svg>;
    case "send":
      return <svg {...props}><path d="M2 8l11-5-4 11-2-5-5-1z" /></svg>;
    case "chevron-right":
      return <svg {...props}><path d="M6 4l4 4-4 4" /></svg>;
    case "chevron-down":
      return <svg {...props}><path d="M4 6l4 4 4-4" /></svg>;
    case "plus":
      return <svg {...props}><path d="M8 3v10M3 8h10" /></svg>;
    case "x":
      return <svg {...props}><path d="M4 4l8 8M12 4l-8 8" /></svg>;
    case "drag":
      return <svg {...props}><circle cx="6" cy="4" r=".7" fill="currentColor" stroke="none" /><circle cx="10" cy="4" r=".7" fill="currentColor" stroke="none" /><circle cx="6" cy="8" r=".7" fill="currentColor" stroke="none" /><circle cx="10" cy="8" r=".7" fill="currentColor" stroke="none" /><circle cx="6" cy="12" r=".7" fill="currentColor" stroke="none" /><circle cx="10" cy="12" r=".7" fill="currentColor" stroke="none" /></svg>;
    case "book":
      return <svg {...props}><path d="M3 3v10c0-.6.4-1 1-1h9V2H4c-.6 0-1 .4-1 1z" /><path d="M3 13c0-.6.4-1 1-1h9" /></svg>;
    case "telescope":
      return <svg {...props}><circle cx="7" cy="7" r="4" /><path d="M10 10l2 2" /></svg>;
    case "lightbulb":
      return <svg {...props}><path d="M5.5 9.5C4.5 8.7 4 7.4 4 6a4 4 0 018 0c0 1.4-.5 2.7-1.5 3.5V12H5.5zM6.5 14h3" /></svg>;
    case "filter":
      return <svg {...props}><path d="M2 3h12l-4.5 6v4l-3 1V9z" /></svg>;
    case "settings":
      return <svg {...props}><circle cx="8" cy="8" r="2" /><path d="M8 1v2M8 13v2M14 8h1M1 8h1M12.2 3.8l-.7.7M4.5 11.5l-.7.7M12.2 12.2l-.7-.7M4.5 4.5l-.7-.7" /></svg>;
    case "check":
      return <svg {...props}><path d="M3 8l3 3 7-7" /></svg>;
    case "command":
      return <svg {...props}><path d="M5 3h6v10H5z" /><circle cx="3.5" cy="3.5" r="1.5" /><circle cx="12.5" cy="3.5" r="1.5" /><circle cx="3.5" cy="12.5" r="1.5" /><circle cx="12.5" cy="12.5" r="1.5" /></svg>;
    case "tree":
      return <svg {...props}><circle cx="3" cy="8" r="1.5" /><circle cx="13" cy="4" r="1.5" /><circle cx="13" cy="12" r="1.5" /><path d="M4.5 8l7-4M4.5 8l7 4" /></svg>;
    case "transcript":
      return <svg {...props}><path d="M2 3h12v10H2z" /><path d="M5 6h6M5 8h6M5 10h4" /></svg>;
    case "scale":
      return <svg {...props}><path d="M8 2v12M3 5h10M5 5l-2 4h4zM11 5l-2 4h4z" /></svg>;
    case "calc":
      return <svg {...props}><path d="M3 2h10v12H3z" /><path d="M5 5h6v2H5zM5 9h1M8 9h1M11 9h1M5 11h1M8 11h1M11 11h1M5 13h6" /></svg>;
    case "mic":
      return <svg {...props}><rect x="6" y="2" width="4" height="8" rx="2" /><path d="M4 8a4 4 0 008 0M8 12v2" /></svg>;
    case "paperclip":
      return <svg {...props}><path d="M11 5L6 10a2 2 0 102.8 2.8L13 8.6a3.5 3.5 0 00-5-5L4 8" /></svg>;
    default:
      return null;
  }
};

export const Difficulty = ({ value = 3, max = 5 }) => (
  <span className="diff" title={`Difficulty ${value}/${max}`}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={"d " + (i < value ? "on" : "")} />
    ))}
  </span>
);

export const Sparkline = ({ data = [], width = 80, height = 22, stroke = "currentColor" }) => {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.25" />
    </svg>
  );
};
