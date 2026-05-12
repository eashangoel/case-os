import React from "react";
import Anthropic from "@anthropic-ai/sdk";
import { Icon, Difficulty } from "../components/ui";
import caseBank from "../data/caseBank.json";

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

export const HomeScreen = ({ onStart }) => {
  const [type, setType] = React.useState("Profitability");
  const [industry, setIndustry] = React.useState("Tech / SaaS");
  const [region, setRegion] = React.useState("North America");
  const [difficulty, setDifficulty] = React.useState("Hard (4/5)");
  const [constraints, setConstraints] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genTick, setGenTick] = React.useState(0);
  const [genError, setGenError] = React.useState(null);
  const [generatedCase, setGeneratedCase] = React.useState(null);
  const [recentGenerations, setRecentGenerations] = React.useState([]);

  const history = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("caseHistory") || "[]"); } catch { return []; }
  }, []);

  const casesCompleted = history.length;
  const avgScore = history.length
    ? (history.reduce((s, h) => s + h.overall, 0) / history.length).toFixed(1)
    : "—";
  const streak = computeStreak(history);

  const weakestDim = React.useMemo(() => {
    if (!history.length) return null;
    const dims = ["structure", "hypothesis", "quantitative", "communication"];
    const avgs = dims.map((d) => ({
      label: d.charAt(0).toUpperCase() + d.slice(1),
      avg: history.reduce((s, h) => s + h.scores[d], 0) / history.length,
    }));
    return avgs.sort((a, b) => a.avg - b.avg)[0];
  }, [history]);

  React.useEffect(() => {
    if (!generating) return;
    const id = setInterval(() => setGenTick((t) => (t + 1) % 4), 350);
    return () => clearInterval(id);
  }, [generating]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setGeneratedCase(null);
    const diffNum = { "Easy (2/5)": 2, "Medium (3/5)": 3, "Hard (4/5)": 4, "Partner (5/5)": 5 }[difficulty] || 4;
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `Generate a consulting case interview in JSON format.

Parameters:
- Type: ${type}
- Industry: ${industry}
- Region: ${region}
- Difficulty: ${diffNum}
- Constraints: ${constraints || "none"}

Return ONLY a valid JSON object matching this schema exactly, no markdown, no explanation:
{
  "id": "ai_generated_${Date.now()}",
  "title": "Company Name — Problem Statement",
  "client": "Company description (industry, geography)",
  "type": "${type}",
  "industry": "${industry}",
  "region": "${region}",
  "difficulty": ${diffNum},
  "estimated_minutes": 30,
  "format": "McKinsey-style",
  "prompt": "2-3 sentence case prompt given to the interviewee",
  "context": "1-2 sentences of background the interviewer knows",
  "tags": ["tag1", "tag2", "tag3"],
  "data_packets": {
    "packet_1": { "label": "...", "content": "...", "release_trigger": "..." },
    "packet_2": { "label": "...", "content": "...", "release_trigger": "..." },
    "packet_3": { "label": "...", "content": "...", "release_trigger": "..." }
  },
  "ideal_structure": {
    "bucket_1": { "label": "...", "sub_buckets": ["...", "..."] },
    "bucket_2": { "label": "...", "sub_buckets": ["...", "..."] }
  },
  "hidden_answer_brief": "3-5 sentence root cause and recommendation",
  "key_insights": ["...", "...", "..."],
  "common_mistakes": ["...", "..."]
}`,
        }],
      });
      const raw = response.content[0].text.trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");
      const parsed = JSON.parse(raw);
      setGeneratedCase(parsed);
      setRecentGenerations((prev) => [
        { name: parsed.title, type: parsed.type, time: "Just now", caseObj: parsed },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setGenError(err.message || "Generation failed. Check your API key.");
    } finally {
      setGenerating(false);
    }
  };

  const seededCase = caseBank[0];

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Case Library</h1>
          <div className="page-tagline">// Train like a consultant. Twelve weeks to McKinsey-ready.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn"><Icon name="filter" /> Filter</button>
          <button className="btn"><Icon name="search" /> Search cases <span className="kbd-inline" style={{ marginLeft: 4 }}>⌘K</span></button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="stat">
            <div className="stat-label">Cases completed</div>
            <div className="stat-value">{casesCompleted || 0}</div>
            <div className="stat-delta up">{casesCompleted > 0 ? `${casesCompleted} total` : "Start your first case"}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="stat">
            <div className="stat-label">Avg score</div>
            <div className="stat-value">{avgScore}<span style={{ color: "var(--text-4)", fontSize: 14, marginLeft: 2 }}>{avgScore !== "—" ? "/5" : ""}</span></div>
            <div className="stat-delta up">{history.length >= 2 ? `last ${Math.min(history.length, 5)} cases` : "no data yet"}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="stat">
            <div className="stat-label">Streak</div>
            <div className="stat-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {streak}<Icon name="flame" size={16} style={{ color: "var(--warn)" }} />
            </div>
            <div className="stat-delta">{streak > 0 ? `day${streak !== 1 ? "s" : ""} active` : "start today"}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="stat">
            <div className="stat-label">Weakest dimension</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{weakestDim ? weakestDim.label : "—"}</div>
            <div className="stat-delta down">{weakestDim ? `${weakestDim.avg.toFixed(1)} avg · focus area` : "complete a case first"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 28 }}>
        {/* Curated cases */}
        <section>
          <h2 className="section-title">
            <span>Curated · This Week</span>
            <span className="rule" />
            <span className="count">01 / 01</span>
          </h2>

          <article className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              height: 120,
              borderBottom: "1px solid var(--line-1)",
              background:
                "radial-gradient(circle at 80% 30%, rgba(79,142,247,0.15), transparent 50%), " +
                "linear-gradient(180deg, var(--bg-2), var(--bg-1))",
              position: "relative",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="badge accent">{seededCase.type}</span>
                <span className="badge">{seededCase.industry}</span>
                <span className="badge">{seededCase.format}</span>
              </div>
              <svg viewBox="0 0 400 60" style={{ position: "absolute", right: 12, bottom: 8, width: 260, opacity: 0.35 }}>
                <path d="M0 40 L40 35 L80 42 L120 30 L160 25 L200 38 L240 45 L280 52 L320 48 L360 50 L400 55" fill="none" stroke="var(--accent)" strokeWidth="1.25" />
                <path d="M0 30 L40 28 L80 32 L120 20 L160 18 L200 22 L240 30 L280 36 L320 30 L360 32 L400 36" fill="none" stroke="var(--text-3)" strokeWidth="1" strokeDasharray="2 3" />
              </svg>
            </div>

            <div style={{ padding: "18px 20px 20px" }}>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 4 }}>
                {seededCase.title}
              </div>
              <div style={{ color: "var(--text-3)", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 14 }}>
                {seededCase.client}
              </div>
              <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px", textWrap: "pretty" }}>
                {seededCase.prompt}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 18 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--text-4)" }}>DIFFICULTY</span>
                  <Difficulty value={seededCase.difficulty} />
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="clock" size={12} style={{ color: "var(--text-3)" }} />
                  <span>{seededCase.estimated_minutes} MIN</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="user" size={12} />
                  <span>{seededCase.region}</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {seededCase.tags.map((tag) => (
                    <span key={tag} className="badge" style={{ textTransform: "none", letterSpacing: 0 }}>{tag}</span>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => onStart(seededCase)}>
                  <Icon name="play" size={11} /> Start Case
                </button>
              </div>
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line-1)", background: "var(--bg-0)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              <span>Curated case · real India F&B scenario</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--good)" }} />
                FRESH
              </span>
            </div>
          </article>

          <div style={{ marginTop: 18, padding: "14px 16px", border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-3)", fontSize: 12.5, display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="book" size={14} />
            <span>More curated cases unlock as you progress through the foundations track.</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>Roadmap <Icon name="arrow-right" size={11} /></button>
          </div>
        </section>

        {/* Generation panel */}
        <section>
          <h2 className="section-title">
            <span>Generate · AI Case</span>
            <span className="rule" />
            <span className="count">CLAUDE</span>
          </h2>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--accent-soft)",
                color: "var(--accent)",
                display: "grid", placeItems: "center",
                border: "1px solid var(--accent-line)",
              }}>
                <Icon name="sparkles" size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>Bespoke case generator</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
                  Tunable along five dimensions · ~6s
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div className="field">
                <label className="field-label">Type</label>
                <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option>Profitability</option>
                  <option>Market Entry</option>
                  <option>M&A</option>
                  <option>Growth Strategy</option>
                  <option>Operations</option>
                  <option>Pricing</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Industry</label>
                <select className="select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option>Tech / SaaS</option>
                  <option>Consumer / F&B</option>
                  <option>Healthcare</option>
                  <option>Financial Services</option>
                  <option>Industrials</option>
                  <option>Energy &amp; Utilities</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Region</label>
                <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>North America</option>
                  <option>EMEA</option>
                  <option>APAC</option>
                  <option>LATAM</option>
                  <option>India</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Difficulty</label>
                <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>Easy (2/5)</option>
                  <option>Medium (3/5)</option>
                  <option>Hard (4/5)</option>
                  <option>Partner (5/5)</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">Optional constraints</label>
              <input
                className="input"
                placeholder="e.g. focus on unit economics, exclude pricing levers…"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
              />
            </div>

            {/* Preview block */}
            <div style={{
              border: "1px solid var(--line-1)",
              borderRadius: "var(--r-md)",
              padding: 12,
              background: "var(--bg-0)",
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--text-3)",
              lineHeight: 1.7,
              marginBottom: 16,
              minHeight: 78,
            }}>
              {generating ? (
                <>
                  <span style={{ color: "var(--text-4)" }}>// generating…</span><br />
                  <span style={{ color: "var(--accent)" }}>
                    drafting{".".repeat(genTick + 1)}<span className="pulse">▍</span>
                  </span>
                </>
              ) : generatedCase ? (
                <>
                  <span style={{ color: "var(--good)" }}>// generated ✓</span><br />
                  <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{generatedCase.title}</span><br />
                  <span style={{ color: "var(--text-2)" }}>{generatedCase.prompt?.slice(0, 120)}{generatedCase.prompt?.length > 120 ? "…" : ""}</span>
                </>
              ) : genError ? (
                <>
                  <span style={{ color: "var(--danger)" }}>// error</span><br />
                  <span style={{ color: "var(--danger)", opacity: 0.8 }}>{genError}</span>
                </>
              ) : (
                <>
                  <span style={{ color: "var(--text-4)" }}>// preview brief</span><br />
                  <span style={{ color: "var(--text-2)" }}>{type}</span> case · <span style={{ color: "var(--text-2)" }}>{industry}</span> · <span style={{ color: "var(--text-2)" }}>{region}</span><br />
                  <span>ready · est. <span style={{ color: "var(--text-1)" }}>32 min</span> · prompt-style: open</span>
                </>
              )}
            </div>

            {generatedCase ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", padding: "11px 14px", fontSize: 13 }}
                  onClick={() => onStart(generatedCase)}
                >
                  <Icon name="play" size={13} /> Start This Case
                </button>
                <button
                  className="btn"
                  style={{ padding: "11px 14px", fontSize: 13 }}
                  onClick={() => { setGeneratedCase(null); setGenError(null); }}
                >
                  New
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "11px 14px", fontSize: 13 }}
                onClick={handleGenerate}
                disabled={generating}
              >
                <Icon name="sparkles" size={13} />
                {generating ? "Generating…" : "Generate Case"}
              </button>
            )}

            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>
              <span>Powered by Claude Sonnet</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="command" size={10} /> Press <span className="kbd-inline">⌘↵</span>
              </span>
            </div>
          </div>

          {/* Recent AI Generations */}
          <div style={{ marginTop: 16 }}>
            <h2 className="section-title" style={{ marginBottom: 10 }}>
              <span>Recent · AI Generations</span>
              <span className="rule" />
            </h2>
            {recentGenerations.length === 0 ? (
              <div style={{ padding: "14px 12px", color: "var(--text-4)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                No generations yet — create your first above.
              </div>
            ) : recentGenerations.map((c, i) => (
              <div key={i} className="row-hover" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: "var(--r-md)",
                fontSize: 13,
                cursor: "pointer",
              }} onClick={() => onStart(c.caseObj)}>
                <Icon name="sparkles" size={12} style={{ color: "var(--accent)" }} />
                <span style={{ flex: 1 }}>{c.name}</span>
                <span className="badge">{c.type}</span>
                <span style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{c.time}</span>
                <Icon name="chevron-right" size={12} style={{ color: "var(--text-3)" }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
