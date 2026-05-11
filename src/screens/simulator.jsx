import React from "react";
import Anthropic from "@anthropic-ai/sdk";
import { Icon } from "../components/ui";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const PHASES = [
  { key: "clarify", label: "Clarify" },
  { key: "structure", label: "Structure" },
  { key: "analyze", label: "Analyze" },
  { key: "synthesize", label: "Synthesize" },
];

const buildSystemPrompt = (activeCase, phase, coachMode) => `
You are a senior McKinsey consultant conducting a live case interview.
You are rigorous, professional, and calm. You respect the candidate but hold a high bar.

CASE BRIEF — never reveal this directly. Use it to answer questions and evaluate the candidate:
${JSON.stringify(activeCase, null, 2)}

CURRENT PHASE: ${["CLARIFY", "STRUCTURE", "ANALYZE", "SYNTHESIZE"][phase]}
COACH MODE: ${coachMode.toUpperCase()}

PHASE BEHAVIOR:

CLARIFY: Answer the candidate's clarifying questions as the client would. Be realistic — give only what is directly asked. Do not volunteer extra information. If asked something not in the case brief, make a reasonable inference consistent with the scenario.

STRUCTURE: Listen to the candidate's framework.
- If SOCRATIC: respond only with probing questions that expose gaps without giving answers. Examples: "What else might be driving costs?", "Have you considered the competitive landscape?", "Which branch would you prioritize and why?"
- If INSTRUCTIONAL: directly evaluate their framework against the ideal_structure in the case brief. Tell them what they got right, what they missed, and why each missing piece matters.

ANALYZE: The candidate will drill into branches.
- Only share a data_packet when the candidate asks something that matches or closely relates to that packet's release_trigger.
- If SOCRATIC: if they ask for data without a clear hypothesis, respond: "What hypothesis are you testing with that data request?"
- If INSTRUCTIONAL: if they appear stuck, give a direct hint about what to ask for next.

SYNTHESIZE: The candidate will present their recommendation.
- If SOCRATIC: ask one pointed follow-up challenge question about their recommendation.
- If INSTRUCTIONAL: evaluate their recommendation against the hidden_answer_brief. Tell them how close they were and what the ideal answer would include.

STYLE RULES:
- Never break character. Never mention Claude or AI.
- Keep responses concise — 2-4 sentences unless explaining a framework evaluation.
- Never reveal hidden_answer_brief, ideal_structure, or data_packets proactively.
- Address the candidate directly. Use "you" not "the candidate".
`;

const INITIAL_NODES = [
  { id: "root", label: "Issue Tree", tag: "ROOT", x: 220, y: 28, kind: "root" },
  { id: "a", label: "Branch A", tag: "BRANCH A", x: 60, y: 110 },
  { id: "b", label: "Branch B", tag: "BRANCH B", x: 380, y: 110 },
  { id: "a1", label: "Sub-issue A1", tag: "Branch A", x: 20, y: 200 },
  { id: "a2", label: "Sub-issue A2", tag: "Branch A", x: 160, y: 200 },
  { id: "b1", label: "Sub-issue B1", tag: "Branch B", x: 320, y: 200 },
  { id: "b2", label: "Sub-issue B2", tag: "Branch B", x: 460, y: 200 },
];

const INITIAL_EDGES = [
  ["root", "a"], ["root", "b"],
  ["a", "a1"], ["a", "a2"],
  ["b", "b1"], ["b", "b2"],
];

const IssueTree = () => {
  const canvasRef = React.useRef(null);
  const [nodes, setNodes] = React.useState(INITIAL_NODES);
  const [drag, setDrag] = React.useState(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const measure = () => {
      const el = canvasRef.current;
      if (el) setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = (e, id) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === id);
    setDrag({ id, offsetX: e.clientX - rect.left - node.x, offsetY: e.clientY - rect.top - node.y });
  };

  const onPointerMove = (e) => {
    if (!drag) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - drag.offsetX;
    let y = e.clientY - rect.top - drag.offsetY;
    x = Math.max(8, Math.min(x, rect.width - 130));
    y = Math.max(8, Math.min(y, rect.height - 50));
    setNodes((ns) => ns.map((n) => n.id === drag.id ? { ...n, x, y } : n));
  };

  const onPointerUp = () => setDrag(null);

  const edges = INITIAL_EDGES.map(([a, b]) => {
    const A = nodes.find((n) => n.id === a);
    const B = nodes.find((n) => n.id === b);
    if (!A || !B) return null;
    const ax = A.x + 60, ay = A.y + 32;
    const bx = B.x + 60, by = B.y;
    const mx = (ax + bx) / 2;
    return (
      <path
        key={`${a}-${b}`}
        d={`M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`}
        stroke="var(--line-3)"
        strokeWidth="1.25"
        fill="none"
      />
    );
  });

  return (
    <div
      ref={canvasRef}
      className="tree-canvas"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div style={{
        position: "absolute", top: 10, left: 12, right: 12,
        display: "flex", alignItems: "center", gap: 8, zIndex: 4,
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <span className="badge accent" style={{ background: "var(--bg-1)" }}>
            <Icon name="tree" size={10} /> Issue Tree
          </span>
          <span style={{ color: "var(--text-3)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {nodes.length} nodes · drag to rearrange
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, pointerEvents: "auto" }}>
          <button className="btn btn-sm" style={{ background: "var(--bg-1)" }}>
            <Icon name="plus" size={11} /> Add node
          </button>
          <button className="btn btn-sm" style={{ background: "var(--bg-1)" }} title="Auto-layout">
            <Icon name="settings" size={11} />
          </button>
        </div>
      </div>

      <svg width={size.w} height={size.h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {edges}
      </svg>

      {nodes.map((n) => (
        <div
          key={n.id}
          className={["tree-node", n.kind === "root" ? "root" : "", n.placeholder ? "placeholder" : "", drag && drag.id === n.id ? "dragging" : ""].join(" ")}
          style={{ left: n.x, top: n.y, width: 120 }}
          onPointerDown={(e) => onPointerDown(e, n.id)}
        >
          <span className="node-tag">{n.tag}</span>
          {n.label}
        </div>
      ))}

      <div style={{
        position: "absolute", bottom: 10, left: 12,
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg-1)", border: "1px solid var(--line-1)",
        padding: "5px 9px", borderRadius: "var(--r-md)",
        fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--font-mono)",
      }}>
        <Icon name="drag" size={10} /> Drag to rearrange · <span className="kbd-inline" style={{ background: "var(--bg-2)" }}>N</span> new
      </div>

      <div style={{
        position: "absolute", bottom: 10, right: 12,
        fontSize: 10.5, color: "var(--text-4)", fontFamily: "var(--font-mono)",
      }}>
        scratchpad · autosaved
      </div>
    </div>
  );
};

export const scoreCase = async (activeCase, sessionMessages) => {
  const transcript = sessionMessages
    .filter((m) => m.role !== "coach")
    .map((m) => `[${m.role.toUpperCase()}]: ${m.body}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `You are a consulting interview evaluator. Score this candidate on a 1–5 scale across 4 dimensions.

CASE BRIEF:
${JSON.stringify(activeCase)}

FULL TRANSCRIPT:
${transcript}

Return ONLY this JSON, no markdown, no explanation:
{
  "structure":     { "score": 3, "summary": "one sentence", "feedback": "2-3 sentences of specific actionable feedback" },
  "hypothesis":    { "score": 3, "summary": "one sentence", "feedback": "2-3 sentences" },
  "quantitative":  { "score": 3, "summary": "one sentence", "feedback": "2-3 sentences" },
  "communication": { "score": 3, "summary": "one sentence", "feedback": "2-3 sentences" },
  "overall_summary": "2-3 sentence overall performance summary, direct and honest",
  "ai_recommendation": "1-2 sentence specific next action for improvement"
}

Scoring rubric:
- STRUCTURE: Was the framework MECE? Relevant to case type? Appropriately deep?
- HYPOTHESIS: Did candidate form and state hypotheses before requesting data? Did they update when data came in?
- QUANTITATIVE: Did they ask for the right data? Was math correct and cleanly communicated?
- COMMUNICATION: Was the final synthesis crisp? Did they lead with the answer? Clear signposting?`,
    }],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
};

export const SimulatorScreen = ({
  activeCase,
  sessionMessages,
  setSessionMessages,
  sessionPhase,
  setSessionPhase,
  coachMode,
  setCoachMode,
  setScorecardData,
  onSubmit,
}) => {
  const [seconds, setSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(true);
  const [composer, setComposer] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [scoring, setScoring] = React.useState(false);
  const [error, setError] = React.useState(null);
  const chatRef = React.useRef(null);
  const composerRef = React.useRef(null);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Timer
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Auto-scroll chat
  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [sessionMessages, loading]);

  // Opening message on mount
  React.useEffect(() => {
    if (!activeCase || sessionMessages.length > 0) return;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: buildSystemPrompt(activeCase, 0, coachMode),
          messages: [{
            role: "user",
            content: "[SESSION START] Begin the interview. Introduce the case naturally, as an interviewer would.",
          }],
        });
        setSessionMessages([{
          role: "interviewer",
          body: res.content[0].text,
          time: "00:00",
        }]);
      } catch (err) {
        setError(err.message || "Failed to start session. Check your API key.");
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCase?.id]);

  const handleSend = async () => {
    const body = composer.trim();
    if (!body || loading) return;

    const candidateMsg = { role: "candidate", body, time: fmt(seconds) };
    const newMessages = [...sessionMessages, candidateMsg];
    setSessionMessages(newMessages);
    setComposer("");
    setLoading(true);
    setError(null);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role !== "coach")
        .map((m) => ({
          role: m.role === "interviewer" ? "assistant" : "user",
          content: m.body,
        }));

      const res = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: buildSystemPrompt(activeCase, sessionPhase, coachMode),
        messages: apiMessages,
      });

      const interviewerMsg = {
        role: "interviewer",
        body: res.content[0].text,
        time: fmt(seconds),
      };
      const withInterviewer = [...newMessages, interviewerMsg];
      setSessionMessages(withInterviewer);

      if (coachMode === "instructional") {
        const coachRes = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `You are a case interview coach reviewing this exchange.

Interviewer said: "${interviewerMsg.body}"
Candidate said: "${body}"
Current phase: ${["Clarify", "Structure", "Analyze", "Synthesize"][sessionPhase]}

Write ONE short coaching observation (1-2 sentences max) that helps the candidate improve. Be specific and actionable. Start with what they did right or wrong, then say what a stronger move would be. Do not repeat what the interviewer already said.`,
          }],
        });
        setSessionMessages([...withInterviewer, {
          role: "coach",
          body: coachRes.content[0].text,
          time: fmt(seconds),
        }]);
      }
    } catch (err) {
      setError(err.message || "Message failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubmitAndScore = async () => {
    setScoring(true);
    setError(null);
    try {
      const result = await scoreCase(activeCase, sessionMessages);
      setScorecardData({ ...result, elapsedSeconds: seconds });
      onSubmit(seconds);
    } catch (err) {
      setError(err.message || "Scoring failed. Try again.");
      setScoring(false);
    }
  };

  const submittable = sessionPhase === 3;
  const caseLabel = activeCase
    ? `${activeCase.title.toUpperCase()} · ${activeCase.type.toUpperCase()} · ${activeCase.format.toUpperCase()}`
    : "CASE INTERVIEW";
  const turnCount = sessionMessages.filter((m) => m.role !== "coach").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
      {/* Sub-header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 22px",
        borderBottom: "1px solid var(--line-1)",
        background: "var(--bg-0)",
      }}>
        <div className="phase-bar">
          {PHASES.map((p, i) => (
            <React.Fragment key={p.key}>
              <button
                className={"phase-step " + (i < sessionPhase ? "done" : i === sessionPhase ? "active" : "")}
                onClick={() => setSessionPhase(i)}
              >
                <span className="pn">0{i + 1}</span>
                {i < sessionPhase ? <Icon name="check" size={10} /> : null}
                {p.label}
              </button>
              {i < PHASES.length - 1 && <span className="phase-arrow">›</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="coach-toggle" title="Coach mode">
          <button className={coachMode === "socratic" ? "on" : ""} onClick={() => setCoachMode("socratic")}>
            <Icon name="telescope" size={11} /> Socratic
          </button>
          <button className={coachMode === "instructional" ? "on" : ""} onClick={() => setCoachMode("instructional")}>
            <Icon name="book" size={11} /> Instructional
          </button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="timer">
            <Icon name="clock" size={11} style={{ color: "var(--text-3)" }} />
            <span className="lbl">ELAPSED</span>
            {fmt(seconds)}
          </span>
          <button className="btn btn-sm" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </button>
          {submittable && (
            <button className="btn btn-primary btn-sm" onClick={handleSubmitAndScore} disabled={scoring}>
              {scoring ? "Scoring…" : <><span>Submit &amp; Score</span> <Icon name="arrow-right" size={11} /></>}
            </button>
          )}
        </div>
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "60fr 40fr", minHeight: 0 }}>
        {/* Chat */}
        <div style={{ borderRight: "1px solid var(--line-1)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{
            padding: "14px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--line-1)",
            fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)",
          }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{caseLabel}</span>
            <span style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "var(--warn)" : "var(--good)" }} />
                {loading ? "THINKING" : "LIVE"}
              </span>
              <span>{turnCount} turns</span>
            </span>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "8px 22px 4px" }}>
            {sessionMessages.map((m, i) => {
              if (m.role === "coach") {
                return (
                  <div key={i} className="chat-message" style={{ paddingLeft: 42 }}>
                    <div className="chat-body">
                      <div className="coach-card">
                        <span className="label">Coach note</span>
                        {m.body}
                      </div>
                    </div>
                  </div>
                );
              }
              const initial = m.role === "interviewer" ? "MK" : "YOU";
              return (
                <div key={i} className="chat-message">
                  <div className={"chat-author " + m.role}>{initial}</div>
                  <div className="chat-body">
                    <div className="chat-meta">
                      <span className="name">{m.role === "interviewer" ? "Claude · Interviewer" : "You"}</span>
                      <span>{m.time}</span>
                      {m.role === "interviewer" && <span style={{ color: "var(--text-4)" }}>· asking</span>}
                    </div>
                    <div className="chat-text" style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-message">
                <div className="chat-author interviewer">MK</div>
                <div className="chat-body">
                  <div className="chat-meta">
                    <span className="name">Claude · Interviewer</span>
                    <span>typing…</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, padding: "6px 0" }}>
                    {[0, 1, 2].map((j) => (
                      <span key={j} className="pulse" style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "var(--text-3)",
                        animationDelay: `${j * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                margin: "8px 0",
                padding: "10px 14px",
                borderRadius: "var(--r-md)",
                background: "rgba(226,106,106,0.08)",
                border: "1px solid rgba(226,106,106,0.25)",
                color: "var(--danger)",
                fontSize: 12.5,
                fontFamily: "var(--font-mono)",
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="composer">
            <div className="composer-wrap">
              <textarea
                ref={composerRef}
                className="composer-input"
                placeholder="Walk through your structure, or ask a clarifying question…"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
              />
              <div className="composer-actions">
                <button className="btn btn-ghost btn-sm" title="Attach"><Icon name="paperclip" size={12} /></button>
                <button className="btn btn-ghost btn-sm" title="Voice"><Icon name="mic" size={12} /></button>
                <span className="composer-hint" style={{ marginLeft: 4 }}>Press <span className="kbd-inline">↵</span> to send · <span className="kbd-inline">⇧↵</span> newline</span>
                <div className="composer-spacer" />
                <span className="composer-hint">{composer.length} chars</span>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!composer.trim() || loading}
                  onClick={handleSend}
                >
                  Send <Icon name="send" size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Issue tree */}
        <div style={{ position: "relative", minHeight: 0 }}>
          <IssueTree />
        </div>
      </div>
    </div>
  );
};
