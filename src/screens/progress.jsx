import React from "react";
import Anthropic from "@anthropic-ai/sdk";
import { Icon, Sparkline } from "../components/ui";
import { RadarChart, LineChart } from "../components/charts";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const computeStreak = (history) => {
  if (!history.length) return 0;
  const dates = [...new Set(history.map((s) => s.date))];
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
    if (diff <= 1) streak++;
    else break;
  }
  return streak;
};

const DIM_COLORS = {
  structure: "#4F8EF7",
  hypothesis: "#F5A623",
  quantitative: "#E26A6A",
  communication: "#58C97A",
};

const DIM_LABELS = {
  structure: "Structure",
  hypothesis: "Hypothesis",
  quantitative: "Quantitative",
  communication: "Communication",
};

export const ProgressScreen = ({ onReview, onStartCase }) => {
  const [aiInsight, setAiInsight] = React.useState(null);
  const [insightLoading, setInsightLoading] = React.useState(false);
  const [insightError, setInsightError] = React.useState(null);

  const history = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("caseHistory") || "[]"); } catch { return []; }
  }, []);

  // AI insight on mount
  React.useEffect(() => {
    if (history.length === 0) return;
    const last5 = history.slice(0, 5);
    const fetchInsight = async () => {
      setInsightLoading(true);
      setInsightError(null);
      try {
        const res = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `You are a consulting interview coach. Analyze this candidate's recent performance and give specific advice.

Recent case scores (most recent first):
${JSON.stringify(last5, null, 2)}

Write a coaching insight in 3-4 sentences. Identify the single biggest pattern or weakness. Be specific — reference actual scores and dimensions. End with one concrete drill or action for this week. Be direct, not generic.`,
          }],
        });
        setAiInsight(res.content[0].text);
      } catch (err) {
        setInsightError(err.message || "Failed to load AI insight.");
      } finally {
        setInsightLoading(false);
      }
    };
    fetchInsight();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (history.length === 0) {
    return (
      <div className="content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Progress</h1>
            <div className="page-tagline">// Your performance dashboard</div>
          </div>
        </div>
        <div style={{
          padding: "80px 0", textAlign: "center",
          color: "var(--text-3)", fontFamily: "var(--font-mono)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 14 }}>Complete your first case to unlock your progress dashboard.</div>
          <button className="btn btn-primary" onClick={onStartCase}>
            <Icon name="play" size={11} /> Start First Case
          </button>
        </div>
      </div>
    );
  }

  // Compute stats
  const casesCompleted = history.length;
  const avgScore = parseFloat((history.reduce((s, h) => s + h.overall, 0) / history.length).toFixed(1));
  const streak = computeStreak(history);
  const avgDuration = history.filter((h) => h.durationSeconds > 0).length > 0
    ? Math.round(history.filter((h) => h.durationSeconds > 0).reduce((s, h) => s + h.durationSeconds, 0) / history.filter((h) => h.durationSeconds > 0).length / 60)
    : null;

  // Trend series (oldest → newest)
  const chronological = [...history].reverse();
  const trendLabels = chronological.map((_, i) => `C${i + 1}`);
  const trendSeries = Object.entries(DIM_COLORS).map(([key, color]) => ({
    label: DIM_LABELS[key],
    color,
    data: chronological.map((h) => h.scores[key]),
  }));

  // Cumulative radar
  const cumulativeAxes = Object.entries(DIM_LABELS).map(([key, label]) => ({
    label: label.toUpperCase(),
    value: parseFloat((history.reduce((s, h) => s + h.scores[key], 0) / history.length).toFixed(1)),
  }));

  const recentCases = history.slice(0, 6);

  // Sparkline data for stat cards
  const overallSpark = chronological.map((h) => h.overall);

  return (
    <div className="content content-wide">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 6, letterSpacing: "0.06em" }}>
            CASE PRACTICE DASHBOARD
          </div>
          <h1 className="page-title">Your Progress</h1>
          <div className="page-tagline">// {casesCompleted} case{casesCompleted !== 1 ? "s" : ""} completed · last active today</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {streak > 0 && <span className="streak"><span className="dot" /> {streak}-DAY STREAK</span>}
          <button className="btn btn-primary" onClick={onStartCase}>
            <Icon name="play" size={11} /> Next case
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          {
            label: "Cases completed",
            value: String(casesCompleted),
            sub: "total sessions",
            spark: chronological.map((_, i) => i + 1),
          },
          {
            label: "Avg score",
            value: String(avgScore),
            suffix: "/5",
            sub: history.length >= 2 ? (avgScore >= (history.slice(1, 6).reduce((s, h) => s + h.overall, 0) / Math.min(history.length - 1, 5)) ? "↑ trending up" : "↓ trending down") : "first session",
            spark: overallSpark,
          },
          {
            label: "Avg time",
            value: avgDuration ? `${avgDuration}m` : "—",
            sub: avgDuration ? "per case" : "no timer data",
            spark: chronological.filter((h) => h.durationSeconds > 0).map((h) => Math.round(h.durationSeconds / 60)),
          },
          {
            label: "Streak",
            value: String(streak),
            suffix: streak > 0 ? " days" : "",
            sub: streak > 0 ? "keep going!" : "start today",
            spark: Array.from({ length: Math.min(streak, 12) }, (_, i) => i + 1),
          },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div className="stat">
              <div className="stat-label">{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="stat-value">{s.value}</span>
                {s.suffix && <span style={{ color: "var(--text-4)", fontSize: 13, fontFamily: "var(--font-mono)" }}>{s.suffix}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="stat-delta">{s.sub}</span>
                {s.spark && s.spark.length >= 2 && (
                  <Sparkline data={s.spark} stroke="var(--accent)" width={64} height={18} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, marginBottom: 28 }}>
        {/* Trend chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>
                <span>Score trends</span>
                <span style={{ color: "var(--text-4)" }}> · all sessions</span>
              </h2>
            </div>
            <div className="legend">
              {trendSeries.map((s) => (
                <span key={s.label} className="legend-item">
                  <span className="legend-swatch" style={{ background: s.color }} /> {s.label.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
          {chronological.length >= 2 ? (
            <LineChart series={trendSeries} labels={trendLabels} width={680} height={260} />
          ) : (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              Complete 2+ cases to see trend lines.
            </div>
          )}
        </div>

        {/* Cumulative radar */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            <span>Skill profile</span>
            <span style={{ color: "var(--text-4)" }}> · cumulative</span>
          </h2>
          <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", flex: 1 }}>
            <RadarChart
              axes={cumulativeAxes}
              size={300}
              series={[
                { values: cumulativeAxes.map((a) => a.value), color: "var(--accent)", fillOpacity: 0.18 },
                { values: [3.5, 3.5, 3.5, 3.5], color: "var(--text-3)", fillOpacity: 0, dashed: true },
              ]}
            />
          </div>
          <div className="legend" style={{ justifyContent: "center" }}>
            <span className="legend-item">
              <span className="legend-swatch" style={{ background: "var(--accent)" }} /> YOU
            </span>
            <span className="legend-item">
              <span className="legend-swatch" style={{ background: "var(--text-3)" }} /> PASS THRESHOLD
            </span>
          </div>
        </div>
      </div>

      {/* Recent cases */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-title">
          <span>Recent cases</span>
          <span className="rule" />
          <span className="count">SHOWING {recentCases.length} OF {casesCompleted}</span>
        </h2>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18 }}>Case</th>
                <th>Date</th>
                <th>Type</th>
                <th style={{ width: 160 }}>S · H · Q · C</th>
                <th style={{ width: 90 }}>Overall</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((c, i) => {
                const d = c.scores;
                return (
                  <tr key={i}>
                    <td style={{ paddingLeft: 18, fontWeight: 500 }}>{c.caseTitle}</td>
                    <td className="mute num">{c.date}</td>
                    <td><span className="badge">{c.caseType}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
                        {[d.structure, d.hypothesis, d.quantitative, d.communication].map((v, idx) => (
                          <span key={idx} style={{
                            display: "inline-block", width: 22, height: 22,
                            border: "1px solid var(--line-1)",
                            borderRadius: 3,
                            textAlign: "center", lineHeight: "20px",
                            color: v >= 4 ? "var(--good)" : v <= 2 ? "var(--warn)" : "var(--text-1)",
                            background: v >= 4 ? "rgba(88,201,122,0.05)" : v <= 2 ? "rgba(245,166,35,0.04)" : "transparent",
                          }}>{v}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={"score-pill s" + Math.round(c.overall)}>{c.overall.toFixed(1)}</span>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: 18 }}>
                      <button className="btn btn-ghost btn-sm" onClick={onReview}>
                        Review <Icon name="arrow-right" size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI insight */}
      <div className="card insight">
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div className="insight-label"><span className="dot" /> CLAUDE'S WEEKLY ANALYSIS</div>
            <div className="insight-body" style={{ fontSize: 14, lineHeight: 1.6, textWrap: "pretty" }}>
              {insightLoading ? (
                <span style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>Analyzing your performance<span className="pulse">…</span></span>
              ) : insightError ? (
                <span style={{ color: "var(--danger)", fontSize: 12.5 }}>{insightError}</span>
              ) : aiInsight ? (
                aiInsight
              ) : null}
            </div>
            {!insightLoading && (
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="btn btn-primary btn-sm" onClick={onStartCase}>
                  Start next case <Icon name="arrow-right" size={11} />
                </button>
                <button className="btn btn-sm">See evidence</button>
              </div>
            )}
          </div>
          <div style={{
            width: 200,
            display: "flex", flexDirection: "column", gap: 10,
            paddingLeft: 22,
            borderLeft: "1px solid var(--line-1)",
          }}>
            <div className="stat-label">SESSIONS ANALYZED</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--accent)", fontWeight: 600 }}>
              {Math.min(history.length, 5)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              last <span style={{ color: "var(--text-1)" }}>{Math.min(history.length, 5)} cases</span> of evidence
            </div>
            <div style={{ height: 1, background: "var(--line-1)", margin: "6px 0" }} />
            <div className="stat-label">AVG SCORE</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600 }}>
              {avgScore}<span style={{ fontSize: 12, color: "var(--text-3)" }}>/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
