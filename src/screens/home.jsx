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

const HEADER_GRADIENTS = {
  curated:
    "radial-gradient(circle at 80% 30%, rgba(79,142,247,0.15), transparent 50%), " +
    "linear-gradient(180deg, var(--bg-2), var(--bg-1))",
  ai:
    "radial-gradient(circle at 80% 30%, rgba(124,92,255,0.18), transparent 50%), " +
    "linear-gradient(180deg, rgba(124,92,255,0.06), var(--bg-1))",
  custom:
    "radial-gradient(circle at 80% 30%, rgba(245,166,35,0.15), transparent 50%), " +
    "linear-gradient(180deg, rgba(245,166,35,0.04), var(--bg-1))",
};

const HEADER_STROKE = { curated: "var(--accent)", ai: "#7C5CFF", custom: "#F5A623" };

const SOURCE_BADGE = {
  ai: { label: "AI GENERATED", color: "#7C5CFF" },
  custom: { label: "CUSTOM", color: "#F5A623" },
};

const CaseCard = ({ caseData, source, dateAdded, onStart, onDelete }) => {
  const badge = SOURCE_BADGE[source];
  return (
    <article className="card" style={{ padding: 0, overflow: "hidden", flexShrink: 0 }}>
      <div style={{
        height: 120,
        borderBottom: "1px solid var(--line-1)",
        background: HEADER_GRADIENTS[source],
        position: "relative",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge accent">{caseData.type}</span>
          <span className="badge">{caseData.industry}</span>
          <span className="badge">{caseData.format || "McKinsey-style"}</span>
          {badge && (
            <span className="badge" style={{
              marginLeft: "auto",
              background: `${badge.color}22`,
              color: badge.color,
              border: `1px solid ${badge.color}55`,
            }}>
              {badge.label}
            </span>
          )}
        </div>
        <svg viewBox="0 0 400 60" style={{ position: "absolute", right: 12, bottom: 8, width: 260, opacity: 0.3, pointerEvents: "none" }}>
          <path d="M0 40 L40 35 L80 42 L120 30 L160 25 L200 38 L240 45 L280 52 L320 48 L360 50 L400 55"
            fill="none" stroke={HEADER_STROKE[source]} strokeWidth="1.25" />
          <path d="M0 30 L40 28 L80 32 L120 20 L160 18 L200 22 L240 30 L280 36 L320 30 L360 32 L400 36"
            fill="none" stroke="var(--text-3)" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 4 }}>
          {caseData.title}
        </div>
        <div style={{ color: "var(--text-3)", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 14 }}>
          {caseData.client}
        </div>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px", textWrap: "pretty" }}>
          {caseData.prompt}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: 18 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--text-4)" }}>DIFFICULTY</span>
            <Difficulty value={caseData.difficulty} />
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="clock" size={12} style={{ color: "var(--text-3)" }} />
            <span>{caseData.estimated_minutes} MIN</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="user" size={12} />
            <span>{caseData.region}</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {(caseData.tags || []).map((tag) => (
              <span key={tag} className="badge" style={{ textTransform: "none", letterSpacing: 0 }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {onDelete && (
              <button className="btn btn-ghost btn-sm" onClick={onDelete} title="Remove case">
                <Icon name="x" size={11} />
              </button>
            )}
            <button className="btn btn-primary" onClick={() => onStart(caseData)}>
              <Icon name="play" size={11} /> Start Case
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line-1)", background: "var(--bg-0)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
        <span>
          {source === "curated" ? "Curated case · real India F&B scenario"
            : source === "ai" ? "AI-generated case"
            : "Custom case"}
        </span>
        {dateAdded ? (
          <span>{dateAdded}</span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--good)" }} />
            FRESH
          </span>
        )}
      </div>
    </article>
  );
};

const AddCaseModal = ({ onClose, onAdd }) => {
  const [tab, setTab] = React.useState("paste");
  const [pasteText, setPasteText] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [fileText, setFileText] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState(null);
  const [processedCase, setProcessedCase] = React.useState(null);
  const [genTick, setGenTick] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (!processing) return;
    const id = setInterval(() => setGenTick((t) => (t + 1) % 4), 350);
    return () => clearInterval(id);
  }, [processing]);

  const handleFileChange = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setFileText(e.target.result);
    reader.readAsText(f);
  };

  const handleProcess = async () => {
    const rawText = tab === "paste" ? pasteText : fileText;
    if (!rawText.trim()) return;
    setProcessing(true);
    setProcessError(null);
    setProcessedCase(null);
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        messages: [{
          role: "user",
          content: `Extract a consulting case interview from the text below and return ONLY a JSON object — no markdown fences, no explanation, no text before or after the JSON.

If the text already describes a structured case, extract it faithfully. If it is just a raw case description or problem statement, structure it into a full case.

Schema (keep each data_packet content under 60 words, hidden_answer_brief under 80 words):
{"id":"custom_${Date.now()}","title":"Company — Problem","client":"one sentence","type":"case type e.g. Profitability","industry":"industry","region":"region","difficulty":3,"estimated_minutes":30,"format":"McKinsey-style","prompt":"2-3 sentence prompt for interviewee","context":"1-2 sentence interviewer background","tags":["tag1","tag2"],"data_packets":{"packet_1":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks X"},"packet_2":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks Y"},"packet_3":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks Z"}},"ideal_structure":{"bucket_1":{"label":"label","sub_buckets":["sub1","sub2"]},"bucket_2":{"label":"label","sub_buckets":["sub1","sub2"]},"bucket_3":{"label":"label","sub_buckets":["sub1","sub2"]}},"hidden_answer_brief":"root cause and recommendation under 80 words","key_insights":["insight1","insight2"],"common_mistakes":["mistake1","mistake2"]}

Text to process:
${rawText.slice(0, 8000)}`,
        }],
      });
      const text = response.content[0].text;
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Could not extract case JSON from response.");
      const parsed = JSON.parse(text.slice(start, end + 1));
      setProcessedCase(parsed);
    } catch (err) {
      setProcessError(err.message || "Processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdd = () => {
    if (!processedCase) return;
    const entry = {
      name: processedCase.title,
      type: processedCase.type,
      time: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      timestamp: Date.now(),
      caseObj: processedCase,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("customCases") || "[]");
      localStorage.setItem("customCases", JSON.stringify([entry, ...existing]));
    } catch {}
    onAdd(entry);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Add Custom Case</div>
            <div style={{ color: "var(--text-3)", fontSize: 11.5, fontFamily: "var(--font-mono)", marginTop: 2 }}>
              Claude will extract and structure the case for you
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line-1)" }}>
          {[{ key: "paste", label: "Paste text" }, { key: "upload", label: "Upload file" }].map((t) => (
            <button key={t.key} className={"modal-tab" + (tab === t.key ? " active" : "")} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {tab === "paste" ? (
            <textarea
              className="input"
              style={{ width: "100%", height: 180, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, boxSizing: "border-box" }}
              placeholder="Paste any case description, article, or case text here…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
          ) : (
            <div
              className={"file-drop" + (dragging ? " dragging" : "")}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileChange(e.dataTransfer.files[0]); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.text"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              {file ? (
                <>
                  <Icon name="book" size={20} style={{ color: "var(--accent)" }} />
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    {fileText.length.toLocaleString()} characters · ~{Math.round(fileText.length / 5)} words
                  </div>
                </>
              ) : (
                <>
                  <Icon name="paperclip" size={20} style={{ color: "var(--text-3)" }} />
                  <div style={{ color: "var(--text-2)" }}>Drop a file here or click to browse</div>
                  <div style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>
                    Supports .txt · .md · plain text
                  </div>
                </>
              )}
            </div>
          )}

          {(processing || processError || processedCase) && (
            <div style={{ marginTop: 14, border: "1px solid var(--line-1)", borderRadius: "var(--r-md)", padding: 12, background: "var(--bg-0)", fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.7, color: "var(--text-2)" }}>
              {processing ? (
                <span style={{ color: "var(--text-3)" }}>
                  Extracting case{".".repeat(genTick + 1)}<span className="pulse">▍</span>
                </span>
              ) : processError ? (
                <span style={{ color: "var(--danger)" }}>Error: {processError}</span>
              ) : processedCase ? (
                <>
                  <span style={{ color: "var(--good)" }}>✓ Case extracted</span><br />
                  <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{processedCase.title}</span><br />
                  <span>{processedCase.prompt?.slice(0, 110)}{processedCase.prompt?.length > 110 ? "…" : ""}</span>
                </>
              ) : null}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {processedCase ? (
              <>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleAdd}>
                  <Icon name="check" size={12} /> Add to Library
                </button>
                <button className="btn" onClick={() => { setProcessedCase(null); setProcessError(null); }}>
                  Re-process
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleProcess}
                disabled={processing || (tab === "paste" ? !pasteText.trim() : !fileText.trim())}
              >
                <Icon name="sparkles" size={12} />
                {processing ? "Processing…" : "Extract Case"}
              </button>
            )}
            <button className="btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
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

  const [recentGenerations, setRecentGenerations] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("generatedCases") || "[]"); } catch { return []; }
  });
  const [customCases, setCustomCases] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("customCases") || "[]"); } catch { return []; }
  });
  const [showAddModal, setShowAddModal] = React.useState(false);

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
        max_tokens: 8000,
        messages: [{
          role: "user",
          content: `Generate a consulting case interview. Return ONLY a JSON object — no markdown fences, no explanation, no text before or after the JSON.

Parameters: type=${type}, industry=${industry}, region=${region}, difficulty=${diffNum}/5, constraints=${constraints || "none"}

Schema (fill every field — keep each data_packet content under 60 words, keep hidden_answer_brief under 80 words):
{"id":"ai_${Date.now()}","title":"Company — Problem","client":"one sentence","type":"${type}","industry":"${industry}","region":"${region}","difficulty":${diffNum},"estimated_minutes":30,"format":"McKinsey-style","prompt":"2-3 sentence prompt for interviewee","context":"1-2 sentence interviewer background","tags":["tag1","tag2","tag3"],"data_packets":{"packet_1":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks X"},"packet_2":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks Y"},"packet_3":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks Z"}},"ideal_structure":{"bucket_1":{"label":"label","sub_buckets":["sub1","sub2"]},"bucket_2":{"label":"label","sub_buckets":["sub1","sub2"]},"bucket_3":{"label":"label","sub_buckets":["sub1","sub2"]}},"hidden_answer_brief":"root cause and recommendation under 80 words","key_insights":["insight1","insight2","insight3"],"common_mistakes":["mistake1","mistake2"]}`,
        }],
      });
      const text = response.content[0].text;
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON object found in response.");
      const parsed = JSON.parse(text.slice(start, end + 1));
      setGeneratedCase(parsed);
      setRecentGenerations((prev) => {
        const updated = [
          { name: parsed.title, type: parsed.type, time: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }), timestamp: Date.now(), caseObj: parsed },
          ...prev.slice(0, 9),
        ];
        try { localStorage.setItem("generatedCases", JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch (err) {
      setGenError(err.message || "Generation failed. Check your API key.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCustom = (timestamp) => {
    setCustomCases((prev) => {
      const updated = prev.filter((c) => c.timestamp !== timestamp);
      try { localStorage.setItem("customCases", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleAddCase = (entry) => {
    setCustomCases((prev) => [entry, ...prev]);
  };

  const userCases = React.useMemo(() => {
    const aiItems = recentGenerations.map((c) => ({ ...c, source: "ai" }));
    const customItems = customCases.map((c) => ({ ...c, source: "custom" }));
    return [...aiItems, ...customItems].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [recentGenerations, customCases]);

  const seededCase = caseBank[0];
  const totalCases = 1 + userCases.length;

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
        {/* LEFT: Scrollable case list */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
              <span>Case Library</span>
              <span className="rule" />
              <span className="count">{totalCases} {totalCases === 1 ? "CASE" : "CASES"}</span>
            </h2>
            <button className="btn btn-sm" style={{ marginLeft: 12 }} onClick={() => setShowAddModal(true)}>
              <Icon name="plus" size={11} /> Add Case
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 880, overflowY: "auto", paddingRight: 2 }}>
            <CaseCard caseData={seededCase} source="curated" onStart={onStart} />

            {userCases.length === 0 && (
              <div style={{ padding: "14px 16px", border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-3)", fontSize: 12.5, display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="sparkles" size={14} />
                <span>Generate a case on the right, or add your own to build your personal library.</span>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", flexShrink: 0 }} onClick={() => setShowAddModal(true)}>
                  Add Case <Icon name="arrow-right" size={11} />
                </button>
              </div>
            )}

            {userCases.map((c, i) => (
              <CaseCard
                key={c.timestamp || i}
                caseData={c.caseObj}
                source={c.source}
                dateAdded={c.time}
                onStart={onStart}
                onDelete={c.source === "custom" ? () => handleDeleteCustom(c.timestamp) : undefined}
              />
            ))}
          </div>
        </section>

        {/* RIGHT: Generator */}
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
        </section>
      </div>

      {showAddModal && (
        <AddCaseModal onClose={() => setShowAddModal(false)} onAdd={handleAddCase} />
      )}
    </div>
  );
};
