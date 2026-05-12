import React from "react";
import { Icon, Sparkline } from "../components/ui";
import { RadarChart } from "../components/charts";

export const ScorecardScreen = ({ scorecardData, activeCase, sessionMessages, onAnother, onDash }) => {
  const [open, setOpen] = React.useState({ structure: true });
  const [showTranscript, setShowTranscript] = React.useState(false);


  if (!scorecardData) {
    return (
      <div className="content">
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          No scorecard yet. Complete a case first.
          <br /><br />
          <button className="btn btn-primary" onClick={onAnother}>Start a Case</button>
        </div>
      </div>
    );
  }

  const SCORE_AXES = [
    { label: "STRUCTURE",     value: scorecardData.structure.score,     key: "structure" },
    { label: "HYPOTHESIS",    value: scorecardData.hypothesis.score,     key: "hypothesis" },
    { label: "QUANTITATIVE",  value: scorecardData.quantitative.score,   key: "quantitative" },
    { label: "COMMUNICATION", value: scorecardData.communication.score,  key: "communication" },
  ];

  const FEEDBACK = {
    structure:     { title: "Structure",          score: scorecardData.structure.score,     summary: scorecardData.structure.summary,     body: scorecardData.structure.feedback },
    hypothesis:    { title: "Hypothesis thinking", score: scorecardData.hypothesis.score,    summary: scorecardData.hypothesis.summary,    body: scorecardData.hypothesis.feedback },
    quantitative:  { title: "Quantitative",        score: scorecardData.quantitative.score,  summary: scorecardData.quantitative.summary,  body: scorecardData.quantitative.feedback },
    communication: { title: "Communication",       score: scorecardData.communication.score, summary: scorecardData.communication.summary, body: scorecardData.communication.feedback },
  };

  const total = SCORE_AXES.reduce((s, a) => s + a.value, 0);
  const overall = (total / SCORE_AXES.length).toFixed(1);

  const elapsedSec = scorecardData.elapsedSeconds || 0;
  const elapsedFmt = `${String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:${String(elapsedSec % 60).padStart(2, "0")}`;

  const transcript = sessionMessages
    ? sessionMessages.filter((m) => m.role !== "coach").map((m) => ({
        role: m.role, time: m.time, body: m.body,
      }))
    : [];

  return (
    <div className="content">
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 12 }}>
        <Icon name="check" size={11} style={{ color: "var(--good)" }} />
        <span>CASE COMPLETE · {elapsedFmt} ELAPSED</span>
        <span style={{ color: "var(--text-4)" }}>·</span>
        <span>{activeCase?.title?.toUpperCase() || "CASE"}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Scorecard</h1>
          <div className="page-tagline">// Reviewed by Claude · scored across 4 dimensions</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={() => setShowTranscript((t) => !t)}>
            <Icon name="transcript" /> {showTranscript ? "Hide" : "View"} Full Transcript
          </button>
          <button className="btn"><Icon name="arrow-up-right" /> Share</button>
        </div>
      </div>

      {/* Overview grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Radar */}
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="badge accent">SCORE PROFILE</span>
            <span style={{ color: "var(--text-3)", fontSize: 11, fontFamily: "var(--font-mono)" }}>4 dimensions · 1–5 scale</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
            <RadarChart axes={SCORE_AXES} size={320} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="legend">
              <span className="legend-item">
                <span className="legend-swatch" style={{ background: "var(--accent)" }} /> THIS CASE
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="stat-label">OVERALL</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4, marginBottom: 14 }}>
              <span style={{ fontSize: 56, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "var(--font-sans)" }}>{overall}</span>
              <span style={{ fontSize: 18, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>/ 5.0</span>
            </div>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.65, margin: 0, textWrap: "pretty" }}>
              {scorecardData.overall_summary}
            </p>
          </div>

          <div className="card insight">
            <div className="insight-label"><span className="dot" /> AI RECOMMENDATION</div>
            <div className="insight-body" style={{ fontSize: 13.5 }}>
              {scorecardData.ai_recommendation}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={onAnother}>
                Try Another <Icon name="arrow-right" size={11} />
              </button>
              <button className="btn btn-sm" onClick={onDash}>Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>

      {/* Per-dimension feedback */}
      <h2 className="section-title">
        <span>Per-dimension feedback</span>
        <span className="rule" />
        <span className="count">4 / 4</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {SCORE_AXES.map((a) => {
          const fb = FEEDBACK[a.key];
          const isOpen = !!open[a.key];
          return (
            <div key={a.key} className={"expand " + (isOpen ? "open" : "")}>
              <div className="expand-head" onClick={() => setOpen((o) => ({ ...o, [a.key]: !o[a.key] }))}>
                <span className={"score-pill s" + a.value}>{a.value}<span style={{ color: "var(--text-4)" }}>/5</span></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>{fb.title}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>{fb.summary}</div>
                </div>
                <Sparkline
                  data={[2, 3, 3, 2, 3, 3, a.value]}
                  stroke={a.value >= 4 ? "var(--good)" : a.value <= 2 ? "var(--danger)" : "var(--text-3)"}
                />
                <Icon name="chevron-right" className="chev" size={14} style={{ color: "var(--text-3)" }} />
              </div>
              {isOpen && (
                <div className="expand-body" style={{ textWrap: "pretty", whiteSpace: "pre-wrap" }}>
                  {fb.body}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showTranscript && (
        <>
          <h2 className="section-title">
            <span>Full transcript</span>
            <span className="rule" />
            <span className="count">{transcript.length} TURNS</span>
          </h2>
          <div className="card" style={{ padding: 20, marginBottom: 32, maxHeight: 320, overflowY: "auto" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.7 }}>
              {transcript.map((m, i) => (
                <p key={i} style={{ margin: "0 0 8px" }}>
                  <span style={{ color: m.role === "interviewer" ? "var(--accent)" : "var(--text-1)" }}>
                    [{m.time}] {m.role === "interviewer" ? "CLAUDE" : "YOU"}
                  </span>
                  {"  "}{m.body}
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 20, borderTop: "1px solid var(--line-1)" }}>
        <button className="btn" onClick={onDash}>Go to Dashboard</button>
        <button className="btn btn-primary" onClick={onAnother}>
          Try Another Case <Icon name="arrow-right" size={11} />
        </button>
      </div>
    </div>
  );
};
