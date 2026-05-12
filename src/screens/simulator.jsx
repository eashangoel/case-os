import React from "react";
import Anthropic from "@anthropic-ai/sdk";
import { Icon } from "../components/ui";
import { MathPad } from "../components/MathPad";
import { ExhibitCard } from "../components/ExhibitCard";

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

const PHASE_TRANSITIONS = [
  null,
  'The candidate has finished clarifying. Transition to STRUCTURE phase now. Say something like: "Great — I think you have enough context. How would you structure this problem?"',
  'The candidate has finished structuring. Transition to ANALYZE phase now. Say something like: "Good framework. Let\'s drill in — which branch would you prioritize first, and why?"',
  'The candidate has done sufficient analysis. Transition to SYNTHESIZE phase now. Say something like: "You\'ve done solid analysis. I\'d like you to synthesize — what is your recommendation to the client?"',
];

const buildSystemPrompt = (activeCase, phase, coachMode) => `
You are a senior McKinsey consultant conducting a live case interview.
You are rigorous, professional, and calm. You hold a very high bar.

CASE BRIEF — never reveal this directly. Use it to answer questions and evaluate the candidate:
${JSON.stringify(activeCase, null, 2)}

CURRENT PHASE: ${["CLARIFY", "STRUCTURE", "ANALYZE", "SYNTHESIZE"][phase]}
COACH MODE: ${coachMode === "interview" ? "INTERVIEW (socratic — no direct answers)" : "COACH (instructional — give direct feedback)"}

STRICT PHASE RULES — enforce these without exception:
- Only discuss topics appropriate to the current phase.
- Do NOT advance the phase yourself — the user controls phase transitions via the UI.
- If the candidate tries to jump ahead (e.g. giving a recommendation before analysis), redirect them: "Let's make sure we've fully worked through the ${["clarifying questions", "framework", "analysis", "synthesis"][phase]} before moving on."
- Require at least 2 substantive candidate turns before signalling readiness to advance.

PHASE BEHAVIOR:

CLARIFY: Answer the candidate's clarifying questions exactly as the client would. Give only what is directly asked. Never volunteer extra information. If asked something outside the brief, make a reasonable inference consistent with the scenario.

STRUCTURE: Listen to the candidate's framework.
${coachMode === "interview"
  ? '- Respond only with probing questions that expose gaps. Never give the answer. E.g. "What else might be driving costs?", "Have you considered the competitive landscape?", "Which branch would you prioritize and why?"'
  : "- Evaluate their framework directly against ideal_structure in the brief. Tell them exactly what they got right, what is missing, and why each missing piece matters for this case."}

ANALYZE: The candidate will drill into branches.
- Only share a data_packet when the candidate explicitly asks for something that matches or closely relates to that packet's release_trigger.
${coachMode === "interview"
  ? '- If they ask for data without a stated hypothesis, respond: "What hypothesis are you testing with that data request?"'
  : "- If they appear stuck, give a direct hint about what to ask for next and why."}
- IMPORTANT — when sharing data, embed it as a structured exhibit using EXACTLY this format (no deviations):
|||EXHIBIT_START|||
{"type":"bar","title":"<title>","data":[{"label":"<label>","value":<number>},...]}
|||EXHIBIT_END|||
Valid types: "bar" | "waterfall" | "donut" | "table".
For table use: {"type":"table","title":"...","headers":["Col A","Col B"],"rows":[["cell",42],...]}
Place the exhibit block BEFORE your prose explanation, on its own line.

SYNTHESIZE: The candidate will present their recommendation.
${coachMode === "interview"
  ? "- Ask one pointed follow-up challenge question about their recommendation."
  : "- Evaluate their recommendation against hidden_answer_brief. Be specific about what they got right, what was missing, and what the ideal answer would include."}

STYLE:
- Never break character. Never mention Claude, AI, or that you are a language model.
- Keep responses concise: 2-4 sentences unless evaluating a framework or sharing data.
- Never proactively reveal hidden_answer_brief, ideal_structure, or data_packets.
- Address the candidate as "you" directly.
`;

const parseMessage = (text) => {
  const START = "|||EXHIBIT_START|||";
  const END = "|||EXHIBIT_END|||";
  const si = text.indexOf(START);
  const ei = text.indexOf(END);
  if (si === -1 || ei === -1) return { body: text, exhibit: null };
  const raw = text.slice(si + START.length, ei).trim();
  const body = (text.slice(0, si) + text.slice(ei + END.length))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  let exhibit = null;
  try { exhibit = JSON.parse(raw); } catch {}
  return { body, exhibit };
};

// ─── Issue Tree ───────────────────────────────────────────────────────────────

const INITIAL_NODES = [
  { id: "root", label: "Issue Tree", tag: "ROOT", x: 200, y: 28, kind: "root" },
  { id: "a", label: "Branch A", tag: "BRANCH A", x: 60, y: 120 },
  { id: "b", label: "Branch B", tag: "BRANCH B", x: 350, y: 120 },
  { id: "a1", label: "Sub-issue A1", tag: "Branch A", x: 10, y: 210 },
  { id: "a2", label: "Sub-issue A2", tag: "Branch A", x: 150, y: 210 },
  { id: "b1", label: "Sub-issue B1", tag: "Branch B", x: 300, y: 210 },
  { id: "b2", label: "Sub-issue B2", tag: "Branch B", x: 440, y: 210 },
];

const INITIAL_EDGES = [
  ["root", "a"], ["root", "b"],
  ["a", "a1"], ["a", "a2"],
  ["b", "b1"], ["b", "b2"],
];

let _nseq = 100;
const newNodeId = () => `n${++_nseq}`;

const IssueTree = ({ treeRef, nodes, setNodes, edges, setEdges }) => {
  const canvasRef = React.useRef(null);
  const [drag, setDrag] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [connectSrc, setConnectSrc] = React.useState(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    if (treeRef) treeRef.current = { nodes, edges };
  });

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

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setConnectSrc(null);
        setEditing(null);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startDrag = (e, id) => {
    if (connectSrc !== null) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === id);
    setDrag({ id, ox: e.clientX - rect.left - node.x, oy: e.clientY - rect.top - node.y, moved: false });
  };

  const onPointerMove = (e) => {
    if (!drag) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - drag.ox;
    let y = e.clientY - rect.top - drag.oy;
    x = Math.max(4, Math.min(x, rect.width - 132));
    y = Math.max(4, Math.min(y, rect.height - 54));
    const moved = drag.moved || Math.hypot(e.movementX, e.movementY) > 2;
    setDrag((d) => ({ ...d, moved }));
    setNodes((ns) => ns.map((n) => n.id === drag.id ? { ...n, x, y } : n));
  };

  const onPointerUp = () => setDrag(null);

  const onNodeClick = (e, id) => {
    e.stopPropagation();
    if (drag?.moved) return;
    if (connectSrc !== null) {
      if (connectSrc !== id) {
        setEdges((es) => {
          const dup = es.some(([a, b]) =>
            (a === connectSrc && b === id) || (a === id && b === connectSrc)
          );
          return dup ? es : [...es, [connectSrc, id]];
        });
      }
      setConnectSrc(null);
      return;
    }
    setSelected((s) => (s === id ? null : id));
  };

  const startEditing = (id) => { setEditing(id); setSelected(null); };
  const commitEdit = (id, val) => {
    if (val.trim()) setNodes((ns) => ns.map((n) => n.id === id ? { ...n, label: val.trim() } : n));
    setEditing(null);
  };

  const addChild = (parentId) => {
    const parent = nodes.find((n) => n.id === parentId);
    const id = newNodeId();
    setNodes((ns) => [...ns, { id, label: "New node", tag: parent.label, x: parent.x + 20, y: parent.y + 90 }]);
    setEdges((es) => [...es, [parentId, id]]);
    setSelected(null);
    setTimeout(() => startEditing(id), 50);
  };

  const deleteNode = (id) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter(([a, b]) => a !== id && b !== id));
    setSelected(null);
  };

  const autoLayout = () => {
    const childMap = {};
    edges.forEach(([a, b]) => { if (!childMap[a]) childMap[a] = []; childMap[a].push(b); });
    const rootId = (nodes.find((n) => n.kind === "root") || nodes[0])?.id;
    if (!rootId) return;
    const levels = {};
    const visited = new Set();
    const queue = [{ id: rootId, depth: 0 }];
    while (queue.length) {
      const { id, depth } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(id);
      (childMap[id] || []).forEach((c) => queue.push({ id: c, depth: depth + 1 }));
    }
    const updated = nodes.map((n) => ({ ...n }));
    Object.entries(levels).forEach(([d, ids]) => {
      const depth = Number(d);
      const y = 28 + depth * 90;
      const totalW = ids.length * 140;
      const startX = Math.max(10, (560 - totalW) / 2);
      ids.forEach((id, i) => {
        const idx = updated.findIndex((n) => n.id === id);
        if (idx >= 0) { updated[idx].x = startX + i * 140; updated[idx].y = y; }
      });
    });
    setNodes(updated);
  };

  const edgeEls = edges.map(([a, b]) => {
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
      className={["tree-canvas", connectSrc !== null ? "tree-connecting" : ""].filter(Boolean).join(" ")}
      style={{ position: "absolute", inset: 0 }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={() => { setSelected(null); if (connectSrc !== null) setConnectSrc(null); }}
    >
      {/* Toolbar */}
      <div style={{
        position: "absolute", top: 10, left: 12, right: 12,
        display: "flex", alignItems: "center", gap: 8, zIndex: 4, pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <span className="badge accent" style={{ background: "var(--bg-1)" }}>
            <Icon name="tree" size={10} /> Issue Tree
          </span>
          <span style={{ color: "var(--text-3)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {nodes.length} nodes
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, pointerEvents: "auto" }}>
          <button className="btn btn-sm" style={{ background: "var(--bg-1)" }}
            onClick={(e) => { e.stopPropagation(); addChild("root"); }}>
            <Icon name="plus" size={11} /> Add
          </button>
          <button className="btn btn-sm" style={{ background: "var(--bg-1)" }} title="Auto-layout"
            onClick={(e) => { e.stopPropagation(); autoLayout(); }}>
            <Icon name="settings" size={11} />
          </button>
        </div>
      </div>

      <svg width={size.w} height={size.h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {edgeEls}
      </svg>

      {nodes.map((n) => {
        const isSel = selected === n.id;
        const isEdit = editing === n.id;
        const isConSrc = connectSrc === n.id;
        return (
          <div
            key={n.id}
            className={[
              "tree-node",
              n.kind === "root" ? "root" : "",
              isEdit ? "editing" : "",
              isConSrc ? "tree-connect-src" : "",
              drag?.id === n.id ? "dragging" : "",
            ].filter(Boolean).join(" ")}
            style={{ left: n.x, top: n.y, width: 120, position: "absolute", zIndex: isSel ? 10 : 1 }}
            onPointerDown={(e) => startDrag(e, n.id)}
            onClick={(e) => onNodeClick(e, n.id)}
            onDoubleClick={(e) => { e.stopPropagation(); startEditing(n.id); }}
          >
            <span className="node-tag">{n.tag}</span>
            {isEdit ? (
              <input
                className="tree-node-edit"
                autoFocus
                defaultValue={n.label}
                onBlur={(e) => commitEdit(n.id, e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") commitEdit(n.id, e.target.value);
                  if (e.key === "Escape") setEditing(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{n.label}</span>
            )}

            {isSel && !isEdit && (
              <div className="tree-node-actions" onClick={(e) => e.stopPropagation()}>
                <button className="tree-node-btn" title="Rename" onClick={() => startEditing(n.id)}>✏</button>
                <button className="tree-node-btn" title="Add child" onClick={() => addChild(n.id)}>+</button>
                <button className="tree-node-btn" title="Connect to…"
                  onClick={() => { setConnectSrc(n.id); setSelected(null); }}>⟶</button>
                {n.kind !== "root" && (
                  <button className="tree-node-btn danger" title="Delete" onClick={() => deleteNode(n.id)}>✕</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {connectSrc !== null && (
        <div className="tree-connect-hint">Click a node to connect · Esc to cancel</div>
      )}

      <div style={{
        position: "absolute", bottom: 10, left: 12,
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg-1)", border: "1px solid var(--line-1)",
        padding: "5px 9px", borderRadius: "var(--r-md)",
        fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--font-mono)",
      }}>
        <Icon name="drag" size={10} /> Drag · click to select · double-click to rename
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

// ─── Scoring ──────────────────────────────────────────────────────────────────

export const scoreCase = async (activeCase, sessionMessages, treeRef, mathPadRef) => {
  const transcript = sessionMessages
    .filter((m) => m.role !== "coach")
    .map((m) => `[${m.role.toUpperCase()}]: ${m.body}`)
    .join("\n");

  const treeSection = treeRef?.current
    ? `\nCANDIDATE ISSUE TREE (node labels): ${treeRef.current.nodes.map((n) => n.label).join(" | ")}`
    : "";

  const mathSection = mathPadRef?.current
    ? `\nMATH PAD:\nHypothesis: ${mathPadRef.current.hypothesis || "(blank)"}\nCalculations:\n${
        mathPadRef.current.rows.map((r, i) => `  ${i + 1}. ${r.text}`).join("\n") || "  (none)"
      }\nConclusion: ${mathPadRef.current.conclusion || "(blank)"}`
    : "";

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
${treeSection}
${mathSection}

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
- STRUCTURE: Was the framework MECE? Relevant to case type? Appropriately deep? Evaluate the issue tree node labels if available.
- HYPOTHESIS: Did candidate state hypotheses before requesting data? Did they update hypotheses when data came in? Check math pad hypothesis field if available.
- QUANTITATIVE: Did they request the right data? Was math correct and clearly communicated? Evaluate math pad calculation rows and conclusion for rigor.
- COMMUNICATION: Was the final synthesis crisp? Did they lead with the answer? Clear signposting throughout?`,
    }],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
};

// ─── Simulator Screen ─────────────────────────────────────────────────────────

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
  const [rightTab, setRightTab] = React.useState("tree");
  const [treeNodes, setTreeNodes] = React.useState(INITIAL_NODES);
  const [treeEdges, setTreeEdges] = React.useState(INITIAL_EDGES);
  const [audioMode, setAudioMode] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const chatRef = React.useRef(null);
  const composerRef = React.useRef(null);
  const treeRef = React.useRef({ nodes: INITIAL_NODES, edges: INITIAL_EDGES });
  const mathPadRef = React.useRef({ hypothesis: "", rows: [], conclusion: "" });
  const prevPhaseRef = React.useRef(sessionPhase);
  const recognitionRef = React.useRef(null);
  const lastTranscriptRef = React.useRef("");
  const silenceTimerRef = React.useRef(null);
  const doSendRef = React.useRef(null);
  const audioModeRef = React.useRef(false);
  const speakRef = React.useRef(null);
  const startListeningRef = React.useRef(null);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Timer
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Auto-scroll chat
  React.useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [sessionMessages, loading]);

  // Opening message
  React.useEffect(() => {
    if (!activeCase || sessionMessages.length > 0) return;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: buildSystemPrompt(activeCase, 0, coachMode),
          messages: [{ role: "user", content: "[SESSION START] Begin the interview. Introduce the case naturally, as a McKinsey interviewer would." }],
        });
        const { body, exhibit } = parseMessage(res.content[0].text);
        setSessionMessages([{ role: "interviewer", body, exhibit, time: "00:00" }]);
        if (audioModeRef.current) speakRef.current?.(body);
      } catch (err) {
        setError(err.message || "Failed to start session. Check your API key.");
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCase?.id]);

  // Phase transition message
  React.useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = sessionPhase;
    if (sessionPhase <= prev || !activeCase || !PHASE_TRANSITIONS[sessionPhase]) return;

    if (sessionPhase === 2) setRightTab("math");

    const fireTransition = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiMessages = sessionMessages
          .filter((m) => m.role !== "coach")
          .map((m) => ({
            role: m.role === "interviewer" ? "assistant" : "user",
            content: m.body,
          }));
        apiMessages.push({ role: "user", content: PHASE_TRANSITIONS[sessionPhase] });

        const res = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: buildSystemPrompt(activeCase, sessionPhase, coachMode),
          messages: apiMessages,
        });
        const { body, exhibit } = parseMessage(res.content[0].text);
        setSessionMessages((msgs) => [
          ...msgs,
          { role: "interviewer", body, exhibit, time: fmt(seconds), isTransition: true },
        ]);
        if (audioModeRef.current) speakRef.current?.(body);
      } catch (err) {
        setError(err.message || "Phase transition failed.");
      } finally {
        setLoading(false);
      }
    };
    fireTransition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPhase]);

  // ─── Audio mode ─────────────────────────────────────────────────────────────
  const speak = (text) => {
    if (!audioModeRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.05;
    utt.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === "en-US" && !v.localService) ||
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;
    setIsSpeaking(true);
    utt.onend = () => {
      setIsSpeaking(false);
      if (audioModeRef.current) startListeningRef.current?.();
    };
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  };
  speakRef.current = speak;

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || recognitionRef.current || !audioModeRef.current) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      clearTimeout(silenceTimerRef.current);
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      lastTranscriptRef.current = transcript;
      setComposer(transcript);
      // Send after 2s of silence — resets on every new word
      silenceTimerRef.current = setTimeout(() => rec.stop(), 2000);
    };
    rec.onend = () => {
      clearTimeout(silenceTimerRef.current);
      setIsListening(false);
      recognitionRef.current = null;
      const text = lastTranscriptRef.current.trim();
      lastTranscriptRef.current = "";
      if (text && doSendRef.current) {
        setComposer("");
        doSendRef.current(text);
      }
    };
    rec.onerror = (e) => {
      clearTimeout(silenceTimerRef.current);
      if (e.error !== "no-speech") setError("Mic error: " + e.error);
      setIsListening(false);
      recognitionRef.current = null;
      lastTranscriptRef.current = "";
    };
    recognitionRef.current = rec;
    rec.start();
  };
  startListeningRef.current = startListening;

  const toggleAudio = () => {
    const next = !audioMode;
    audioModeRef.current = next;
    setAudioMode(next);
    if (!next) {
      clearTimeout(silenceTimerRef.current);
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsSpeaking(false);
      lastTranscriptRef.current = "";
    }
  };

  // ─── Send logic ──────────────────────────────────────────────────────────────
  const sendMessage = async (body) => {
    if (!body || loading) return;

    const candidateMsg = { role: "candidate", body, time: fmt(seconds) };
    const newMessages = [...sessionMessages, candidateMsg];
    setSessionMessages(newMessages);
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

      const { body: intBody, exhibit } = parseMessage(res.content[0].text);
      const interviewerMsg = { role: "interviewer", body: intBody, exhibit, time: fmt(seconds) };
      const withInterviewer = [...newMessages, interviewerMsg];
      setSessionMessages(withInterviewer);
      if (audioModeRef.current) speakRef.current?.(intBody);

      if (coachMode === "coach") {
        const coachRes = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `You are a case interview coach reviewing this exchange.

Interviewer said: "${intBody}"
Candidate said: "${body}"
Current phase: ${["Clarify", "Structure", "Analyze", "Synthesize"][sessionPhase]}

Write ONE short coaching observation (1-2 sentences) that helps the candidate improve. Be specific and actionable. Start with what they did right or wrong, then say what a stronger move would be. Do not repeat what the interviewer already said.`,
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

  doSendRef.current = sendMessage;

  const handleSend = () => {
    const body = composer.trim();
    if (!body) return;
    setComposer("");
    sendMessage(body);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSubmitAndScore = async () => {
    setScoring(true);
    setError(null);
    try {
      const result = await scoreCase(activeCase, sessionMessages, treeRef, mathPadRef);
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
        flexShrink: 0,
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
          <button className={coachMode === "interview" ? "on" : ""} onClick={() => setCoachMode("interview")}>
            <Icon name="telescope" size={11} /> Interview
          </button>
          <button className={coachMode === "coach" ? "on" : ""} onClick={() => setCoachMode("coach")}>
            <Icon name="book" size={11} /> Coach
          </button>
        </div>

        <button className={"audio-toggle" + (audioMode ? " on" : "")} onClick={toggleAudio} title="Toggle voice mode">
          <Icon name="mic" size={11} />
          {audioMode ? "Voice On" : "Voice Off"}
        </button>

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
        {/* Chat column */}
        <div style={{ borderRight: "1px solid var(--line-1)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{
            padding: "14px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--line-1)",
            fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
              {caseLabel}
            </span>
            <span style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
              {isSpeaking && (
                <span className="speaking-indicator">
                  <span className="speaking-wave">
                    <span style={{ height: 4 }} /><span /><span style={{ height: 4 }} />
                  </span>
                  SPEAKING
                </span>
              )}
              {isListening && (
                <span style={{ color: "var(--danger)", fontSize: 11, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)" }} />
                  LISTENING
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="pulse" style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: loading ? "var(--warn)" : "var(--good)",
                }} />
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
                      {m.isTransition && (
                        <span className="badge" style={{ marginLeft: 4, background: "var(--bg-2)", fontSize: 9 }}>
                          PHASE CHANGE
                        </span>
                      )}
                    </div>
                    {m.exhibit && <ExhibitCard exhibit={m.exhibit} />}
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
                margin: "8px 0", padding: "10px 14px",
                borderRadius: "var(--r-md)",
                background: "rgba(226,106,106,0.08)",
                border: "1px solid rgba(226,106,106,0.25)",
                color: "var(--danger)", fontSize: 12.5, fontFamily: "var(--font-mono)",
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="composer" style={{ flexShrink: 0 }}>
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
                <button
                  className={"btn btn-ghost btn-sm" + (isListening ? " mic-listening" : "")}
                  title={audioMode ? (isListening ? "Stop recording" : "Start recording") : "Enable voice mode to use mic"}
                  onClick={() => {
                    if (!audioMode) return;
                    isListening ? recognitionRef.current?.stop() : startListening();
                  }}
                  style={isListening ? { color: "var(--danger)" } : audioMode ? { color: "var(--accent)" } : {}}
                >
                  <Icon name="mic" size={12} />
                  {isListening && <span style={{ marginLeft: 2, fontSize: 10, fontFamily: "var(--font-mono)" }}>REC</span>}
                </button>
                <span className="composer-hint" style={{ marginLeft: 4 }}>
                  {audioMode
                    ? isListening ? "Listening… speak now" : "Click mic or speak after response"
                    : <>Press <span className="kbd-inline">↵</span> to send · <span className="kbd-inline">⇧↵</span> newline</>}
                </span>
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

        {/* Right panel — tabbed */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="panel-tabs">
            <button
              className={"panel-tab" + (rightTab === "tree" ? " active" : "")}
              onClick={() => setRightTab("tree")}
            >
              <Icon name="tree" size={11} /> Issue Tree
            </button>
            <button
              className={"panel-tab" + (rightTab === "math" ? " active" : "")}
              onClick={() => setRightTab("math")}
            >
              <Icon name="calc" size={11} /> Math Pad
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            {rightTab === "tree"
              ? <IssueTree treeRef={treeRef} nodes={treeNodes} setNodes={setTreeNodes} edges={treeEdges} setEdges={setTreeEdges} />
              : <MathPad padRef={mathPadRef} />}
          </div>
        </div>
      </div>
    </div>
  );
};
