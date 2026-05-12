import React from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─── Level system ─────────────────────────────────────────────────────────────
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000];
export const LEVEL_TITLES = ["Analyst", "Consultant", "Manager", "Principal", "Partner"];

// ─── XP float animation (attaches to document.body at cursor) ─────────────────
let _mx = typeof window !== "undefined" ? window.innerWidth / 2 : 400;
let _my = 200;
if (typeof document !== "undefined") {
  document.addEventListener("mousemove", (e) => { _mx = e.clientX; _my = e.clientY; }, { passive: true });
}
function triggerXpFloat(amount) {
  if (typeof document === "undefined") return;
  const el = document.createElement("div");
  el.className = "xp-float";
  el.textContent = `+${amount} XP`;
  el.style.left = `${_mx - 20}px`;
  el.style.top = `${_my - 30}px`;
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1300);
}

// ─── Framework data ────────────────────────────────────────────────────────────

const FRAMEWORKS = [
  {
    id: "profitability",
    title: "Profitability",
    subtitle: "Revenue vs. Cost decomposition",
    color: "#4F8EF7",
    frequency: "VERY HIGH",
    trigger: "Profits declining, margins shrinking, losses reported",
    tree: {
      label: "Profit Problem",
      children: [
        {
          label: "Revenue",
          children: [
            { label: "Price", children: [{ label: "Mix shift" }, { label: "Discounting" }] },
            { label: "Volume", children: [{ label: "Market size" }, { label: "Market share" }] },
          ],
        },
        {
          label: "Costs",
          children: [
            { label: "Fixed Costs", children: [{ label: "Overhead" }, { label: "Depreciation" }] },
            { label: "Variable Costs", children: [{ label: "COGS" }, { label: "Labor" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "Is the issue revenue-side, cost-side, or both?",
      "Is this a new problem or has profitability been declining for a while?",
      "How do competitors' margins compare?",
      "Which product lines / geographies are most affected?",
      "Are costs fixed or variable — can we flex them quickly?",
    ],
    realExample:
      "A retail chain saw 200bps margin compression. Revenue was flat but COGS rose 15% — driven by a supplier price increase that wasn't passed through to customers. Fix: renegotiate supplier contract or increase retail prices selectively.",
    commonMistakes: [
      "Jumping to cost-cutting before checking if revenue is also declining",
      "Forgetting to benchmark against industry / historical margins",
      "Not splitting fixed vs. variable costs — they have very different lever implications",
    ],
  },
  {
    id: "market-entry",
    title: "Market Entry",
    subtitle: "Attractiveness + Competitive position",
    color: "#7C5CFF",
    frequency: "HIGH",
    trigger: "Enter a new market, expand to new geography, launch new product",
    tree: {
      label: "Enter Market?",
      children: [
        {
          label: "Market Attractive?",
          children: [
            { label: "Market Size", children: [{ label: "TAM / SAM" }, { label: "Growth rate" }] },
            { label: "Profitability", children: [{ label: "Margins" }, { label: "Structure" }] },
          ],
        },
        {
          label: "Can We Win?",
          children: [
            { label: "Capabilities", children: [{ label: "Assets" }, { label: "Know-how" }] },
            { label: "Competition", children: [{ label: "Incumbents" }, { label: "Barriers" }] },
          ],
        },
        {
          label: "How to Enter?",
          children: [
            { label: "Organic", children: [{ label: "Greenfield" }, { label: "Timeline" }] },
            { label: "Inorganic", children: [{ label: "Acquire" }, { label: "Partner/JV" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "What is the size and growth rate of the target market?",
      "What does the competitive landscape look like — fragmented or concentrated?",
      "Do we have relevant capabilities, assets, or brand to compete?",
      "What are the barriers to entry (regulatory, capital, network effects)?",
      "Should we enter organically, acquire, or form a JV?",
    ],
    realExample:
      "A US consumer goods company considered entering the Indian snacks market. TAM was $5B growing 12% p.a. but dominated by two incumbents with distribution lock-in. Recommendation: enter via acquisition of a regional brand with existing distribution rather than greenfield.",
    commonMistakes: [
      "Recommending entry without evaluating if the company can actually win",
      "Ignoring regulatory / cultural barriers in cross-border cases",
      "Not addressing how to enter (organic vs. inorganic) — consultants love that second question",
    ],
  },
  {
    id: "mergers",
    title: "M&A / Merger",
    subtitle: "Strategic fit + Financial value",
    color: "#F5A623",
    frequency: "HIGH",
    trigger: "Acquire a company, evaluate a deal, merger synergies",
    tree: {
      label: "Pursue Deal?",
      children: [
        {
          label: "Strategic Fit",
          children: [
            { label: "Rationale", children: [{ label: "Synergies" }, { label: "Capabilities" }] },
            { label: "Alternatives", children: [{ label: "Build" }, { label: "Partner" }] },
          ],
        },
        {
          label: "Financial Value",
          children: [
            { label: "Target Health", children: [{ label: "Revenue" }, { label: "Margins" }] },
            { label: "Valuation", children: [{ label: "DCF / Comps" }, { label: "Premium" }] },
          ],
        },
        {
          label: "Risks",
          children: [
            { label: "Integration", children: [{ label: "Culture" }, { label: "Systems" }] },
            { label: "External", children: [{ label: "Regulatory" }, { label: "Market" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "What is the strategic rationale — revenue synergies, cost synergies, or capability acquisition?",
      "What does the target's financial health look like?",
      "What is a fair valuation and what premium are we paying?",
      "What are the key integration risks (culture, systems, talent)?",
      "Are there regulatory hurdles (antitrust)?",
    ],
    realExample:
      "A pharma company acquired a biotech for $2B. Strategic fit was strong (pipeline fills gap), but integration risk was high — biotech culture clash. Recommendation: proceed but ring-fence R&D team, keep separate brand for 2 years.",
    commonMistakes: [
      "Over-counting synergies — synergies are often 50% of what management projects",
      "Ignoring integration costs — they can wipe out financial value",
      "Not asking 'why not just build it?' — forces you to justify the premium",
    ],
  },
  {
    id: "pricing",
    title: "Pricing Strategy",
    subtitle: "Value-based · Cost-plus · Competitive",
    color: "#58C97A",
    frequency: "MEDIUM",
    trigger: "Launch price for new product, reprice existing offering, monetization",
    tree: {
      label: "Pricing Decision",
      children: [
        {
          label: "Value to Customer",
          children: [
            { label: "WTP", children: [{ label: "Segments" }, { label: "Benefits" }] },
            { label: "Substitutes", children: [{ label: "Alternatives" }, { label: "Switching cost" }] },
          ],
        },
        {
          label: "Cost Floor",
          children: [
            { label: "Unit Economics", children: [{ label: "COGS" }, { label: "Contribution" }] },
            { label: "Break-even", children: [{ label: "Volume needed" }, { label: "Payback" }] },
          ],
        },
        {
          label: "Competitive Context",
          children: [
            { label: "Benchmarks", children: [{ label: "Competitors" }, { label: "Market norms" }] },
            { label: "Positioning", children: [{ label: "Premium?" }, { label: "Penetration?" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "What is the customer's willingness to pay — and how does it vary by segment?",
      "What do competitors charge for similar products?",
      "What is our cost floor (minimum price to break even)?",
      "Are we positioning as premium, parity, or penetration?",
      "What pricing model fits best (subscription, per-use, bundled)?",
    ],
    realExample:
      "A SaaS startup was pricing at $49/mo (cost-plus). Competitors charged $99–$149/mo. Customer interviews revealed WTP of $120/mo for the core segment. Recommendation: raise to $99/mo, with a $149/mo tier unlocking advanced features.",
    commonMistakes: [
      "Anchoring on cost-plus without checking competitive benchmarks or WTP",
      "Assuming one price fits all segments — segmented pricing often doubles revenue",
      "Forgetting that price signals quality — too low can hurt premium perception",
    ],
  },
  {
    id: "growth",
    title: "Growth Strategy",
    subtitle: "Ansoff matrix · Organic / Inorganic",
    color: "#E26A6A",
    frequency: "HIGH",
    trigger: "Grow revenue, hit a growth target, stagnating top line",
    tree: {
      label: "Grow How?",
      children: [
        {
          label: "Existing Markets",
          children: [
            { label: "Market Penetration", children: [{ label: "Share gain" }, { label: "Pricing" }] },
            { label: "New Products", children: [{ label: "Adjacent" }, { label: "R&D" }] },
          ],
        },
        {
          label: "New Markets",
          children: [
            { label: "New Segments", children: [{ label: "Demographics" }, { label: "Use cases" }] },
            { label: "New Geographies", children: [{ label: "Domestic" }, { label: "International" }] },
          ],
        },
        {
          label: "Inorganic",
          children: [
            { label: "Acquire", children: [{ label: "Bolt-on" }, { label: "Transformational" }] },
            { label: "Partner / JV", children: [{ label: "Distribution" }, { label: "Tech" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "What is the current growth rate vs. market growth rate?",
      "Where is the growth gap — losing share, or market slowing?",
      "Which Ansoff quadrant has the highest return for lowest risk?",
      "Do we have the capabilities to pursue organic growth, or do we need M&A?",
      "What is the timeline — quick wins vs. long-term bets?",
    ],
    realExample:
      "A media company with flat domestic revenue. Core market was saturated (0% growth). Adjacent opportunity: licensing content internationally. Recommendation: prioritize international licensing (low capital, fast) while exploring a bolt-on acquisition in adjacent vertical.",
    commonMistakes: [
      "Defaulting to 'grow market share' without checking if the market is growing",
      "Not prioritizing — listing all four Ansoff quadrants without a recommendation",
      "Ignoring execution risk — organic international expansion often takes 3–5 years",
    ],
  },
  {
    id: "ops",
    title: "Operations / Process",
    subtitle: "Input → Process → Output",
    color: "#38BDF8",
    frequency: "MEDIUM",
    trigger: "Improve efficiency, reduce costs, fix a process bottleneck",
    tree: {
      label: "Process Issue",
      children: [
        {
          label: "Inputs",
          children: [
            { label: "Labor", children: [{ label: "Skill mix" }, { label: "Capacity" }] },
            { label: "Materials", children: [{ label: "Quality" }, { label: "Supply chain" }] },
          ],
        },
        {
          label: "Process",
          children: [
            { label: "Bottleneck", children: [{ label: "Cycle time" }, { label: "Throughput" }] },
            { label: "Waste", children: [{ label: "Rework" }, { label: "Idle time" }] },
          ],
        },
        {
          label: "Outputs",
          children: [
            { label: "Quality", children: [{ label: "Defect rate" }, { label: "Returns" }] },
            { label: "Cost / Speed", children: [{ label: "Unit cost" }, { label: "Lead time" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "Where exactly is the bottleneck in the process?",
      "Is the issue an input problem (bad materials/labor) or a process problem?",
      "What is the current throughput vs. target throughput?",
      "Where is waste occurring (rework, idle time, defects)?",
      "What is the cost of the inefficiency, and what does fixing it cost?",
    ],
    realExample:
      "A hospital had 4-hour ER wait times. Bottleneck analysis showed triage was the constraint — 1 triage nurse for 200 daily patients. Fix: add a second triage nurse (cost $80K/yr), reducing average wait to 90 minutes and increasing patient throughput 30%.",
    commonMistakes: [
      "Jumping to solutions before identifying the actual bottleneck",
      "Focusing on outputs (quality/cost) without tracing back to root cause in inputs/process",
      "Not quantifying the cost of inefficiency — hard to prioritize without a number",
    ],
  },
  {
    id: "competitive",
    title: "Competitive Response",
    subtitle: "Porter's Five Forces · Threat assessment",
    color: "#C084FC",
    frequency: "MEDIUM",
    trigger: "New competitor entered, losing share to rival, disruptive threat",
    tree: {
      label: "Competitive Threat",
      children: [
        {
          label: "Threat Assessment",
          children: [
            { label: "Competitor Strength", children: [{ label: "Resources" }, { label: "Intent" }] },
            { label: "Our Vulnerability", children: [{ label: "Overlap" }, { label: "Moat" }] },
          ],
        },
        {
          label: "Response Options",
          children: [
            { label: "Defend", children: [{ label: "Price" }, { label: "Lock-in" }] },
            { label: "Attack", children: [{ label: "Counter-launch" }, { label: "Acquire" }] },
            { label: "Retreat", children: [{ label: "Cede segment" }, { label: "Reposition" }] },
          ],
        },
      ],
    },
    keyQuestions: [
      "How serious is the competitive threat — well-funded disruptor or niche player?",
      "Where does our moat come from (switching costs, brand, scale, IP)?",
      "What segments are most at risk of being taken?",
      "What response options do we have — defend, attack, or selectively retreat?",
      "What is the cost of each response vs. cost of doing nothing?",
    ],
    realExample:
      "An incumbent telecom faced a new MVNO undercutting on price. Analysis: MVNO targeted price-sensitive prepaid customers (20% of revenue, 8% of profit). Recommendation: don't match on price — launch a separate sub-brand to compete in that segment without cannibalizing core.",
    commonMistakes: [
      "Always recommending 'match their price' — price wars destroy industry profitability",
      "Not assessing whether the threat is actually material to our core customer",
      "Forgetting that retreating from a losing segment can be the right answer",
    ],
  },
];

// ─── Decision tree for Application Guide ──────────────────────────────────────

const DECISION_TREE = [
  {
    id: "root",
    question: "What is the core question the client is asking?",
    options: [
      { label: "Why are profits / margins down?", next: "profitability" },
      { label: "Should we enter a new market or launch a product?", next: "market-entry-or-growth" },
      { label: "Should we acquire / merge with a company?", next: "mergers" },
      { label: "How should we price this offering?", next: "pricing" },
      { label: "How do we grow revenue?", next: "growth" },
      { label: "How do we fix an operational problem?", next: "ops" },
      { label: "A competitor just entered / we're losing share", next: "competitive" },
    ],
  },
  {
    id: "market-entry-or-growth",
    question: "Is the client in the market already, or considering entering from scratch?",
    options: [
      { label: "Entering from scratch — new market / geography", next: "market-entry" },
      { label: "Already in the market, wants to grow faster", next: "growth" },
    ],
  },
];

// ─── Game data ────────────────────────────────────────────────────────────────

function makeSprintQuestions() {
  const allBranches = FRAMEWORKS.flatMap((f) => f.tree.children.map((c) => c.label));
  return shuffle(
    FRAMEWORKS.map((f) => {
      const correct = f.tree.children.map((b) => b.label);
      const wrong = shuffle(allBranches.filter((l) => !correct.includes(l))).slice(0, 4);
      return { frameworkId: f.id, fw: f, correct, options: shuffle([...correct, ...wrong]) };
    })
  );
}

function makeBuilderData(fw) {
  const zones = fw.tree.children.map((c) => c.label);
  const cards = [];
  for (const branch of fw.tree.children) {
    if (branch.children) {
      for (const child of branch.children) {
        cards.push({ label: child.label, correctZone: branch.label });
      }
    }
  }
  return { zones, cards: shuffle(cards) };
}

const CASE_PROMPTS = [
  { prompt: "A chai chain's margins fell from 14% to 6% despite 20% revenue growth.", answer: "profitability", difficulty: 1 },
  { prompt: "A hospital network's EBITDA has declined 3 years in a row despite growing patient volumes.", answer: "profitability", difficulty: 2 },
  { prompt: "A SaaS company's gross margins are compressing as they scale.", answer: "profitability", difficulty: 2 },
  { prompt: "An Indian QSR chain is considering expanding to Southeast Asia.", answer: "market-entry", difficulty: 1 },
  { prompt: "A US private equity firm wants to enter the Indian diagnostics market.", answer: "market-entry", difficulty: 2 },
  { prompt: "A B2B software company wants to launch a consumer product.", answer: "market-entry", difficulty: 3 },
  { prompt: "A regional bank wants to double its retail customer base in 3 years.", answer: "growth", difficulty: 2 },
  { prompt: "An edtech startup wants to grow from ₹50Cr to ₹200Cr ARR.", answer: "growth", difficulty: 2 },
  { prompt: "A consumer brand wants to increase wallet share among existing customers.", answer: "growth", difficulty: 3 },
  { prompt: "A hospital chain is evaluating the acquisition of a diagnostics company.", answer: "mergers", difficulty: 2 },
  { prompt: "A PE firm wants to know if they should acquire a struggling retail chain.", answer: "mergers", difficulty: 2 },
  { prompt: "Two airlines are considering a merger to improve network coverage.", answer: "mergers", difficulty: 3 },
  { prompt: "A pharma company needs to set a launch price for a new drug.", answer: "pricing", difficulty: 2 },
  { prompt: "A hotel chain is reconsidering its pricing across different booking channels.", answer: "pricing", difficulty: 2 },
  { prompt: "A SaaS startup is deciding between usage-based and seat-based pricing.", answer: "pricing", difficulty: 3 },
  { prompt: "A manufacturing plant's cost per unit has increased 30% over two years.", answer: "ops", difficulty: 2 },
  { prompt: "A delivery company's last-mile costs are rising faster than revenue.", answer: "ops", difficulty: 2 },
  { prompt: "A consulting firm's revenue per partner has been declining for 4 years.", answer: "profitability", difficulty: 3 },
  { prompt: "A startup wants to know if it should build, buy, or partner to get into fintech.", answer: "market-entry", difficulty: 3 },
  { prompt: "A retailer wants to maximize revenue from its loyalty program members.", answer: "growth", difficulty: 3 },
];

// ─── Static SVG tree renderer ─────────────────────────────────────────────────

const NODE_W = 100;
const NODE_H = 28;
const H_GAP = 28;
const V_GAP = 10;

function layoutTree(node, depth = 0) {
  if (!node.children || node.children.length === 0) {
    return { ...node, depth, width: NODE_W, height: NODE_H, x: 0, y: 0, subtreeH: NODE_H };
  }
  const laid = node.children.map((c) => layoutTree(c, depth + 1));
  const totalChildH = laid.reduce((s, c) => s + c.subtreeH, 0) + V_GAP * (laid.length - 1);
  return { ...node, depth, children: laid, width: NODE_W, height: NODE_H, x: 0, y: 0, subtreeH: totalChildH };
}

function assignPositions(node, x = 0, y = 0) {
  node.x = x;
  node.y = y + (node.subtreeH - node.height) / 2;
  if (node.children) {
    let cy = y;
    for (const child of node.children) {
      assignPositions(child, x + NODE_W + H_GAP, cy);
      cy += child.subtreeH + V_GAP;
    }
  }
  return node;
}

function collectNodes(node, nodes = [], edges = []) {
  nodes.push(node);
  if (node.children) {
    for (const child of node.children) {
      edges.push({ from: node, to: child });
      collectNodes(child, nodes, edges);
    }
  }
  return { nodes, edges };
}

function StaticTree({ tree, accent = "#4F8EF7" }) {
  const laid = layoutTree(tree);
  assignPositions(laid);
  const { nodes, edges } = collectNodes(laid);

  const maxX = Math.max(...nodes.map((n) => n.x)) + NODE_W;
  const maxY = Math.max(...nodes.map((n) => n.y)) + NODE_H;
  const PAD = 12;
  const W = maxX + PAD * 2;
  const H = maxY + PAD * 2;

  const truncate = (s, max = 13) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <svg width={W} height={H} style={{ display: "block", minWidth: W }}>
        <g transform={`translate(${PAD},${PAD})`}>
          {edges.map((e, i) => {
            const x1 = e.from.x + NODE_W;
            const y1 = e.from.y + NODE_H / 2;
            const x2 = e.to.x;
            const y2 = e.to.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="var(--line-2)"
                strokeWidth={1.5}
              />
            );
          })}
          {nodes.map((n, i) => {
            const isRoot = n.depth === 0;
            return (
              <g key={i} transform={`translate(${n.x},${n.y})`}>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={5}
                  fill={isRoot ? accent : "var(--bg-2)"}
                  stroke={isRoot ? accent : "var(--line-2)"}
                  strokeWidth={1}
                />
                <title>{n.label}</title>
                <text
                  x={NODE_W / 2}
                  y={NODE_H / 2 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isRoot ? "#fff" : "var(--text-2)"}
                  style={{ fontFamily: "var(--font-sans)", userSelect: "none" }}
                >
                  {truncate(n.label)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ─── Framework Card ───────────────────────────────────────────────────────────

function FrameworkCard({ fw, needsReview, onNavigateDrill, confidence = 0 }) {
  const [open, setOpen] = React.useState(false);
  const [subTab, setSubTab] = React.useState("example");

  const dotColor = confidence <= 1 ? "var(--danger)" : confidence <= 3 ? "var(--warn)" : "var(--good)";

  return (
    <div
      className="card expand"
      style={{ borderLeft: `3px solid ${fw.color}`, padding: 0 }}
    >
      <button
        className="expand-head"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{fw.title}</span>
            {needsReview && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  background: "rgba(226,106,106,0.15)",
                  color: "var(--danger)",
                  border: "1px solid rgba(226,106,106,0.3)",
                  borderRadius: 4,
                  padding: "1px 6px",
                  letterSpacing: "0.05em",
                }}
              >
                NEEDS REVIEW
              </span>
            )}
            <span className="framework-freq">{fw.frequency}</span>
            <span
              title={`Confidence: ${confidence}/5`}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: dotColor,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>{fw.subtitle}</div>
          {!open && (
            <div
              style={{
                fontSize: 11.5,
                color: "var(--text-3)",
                marginTop: 6,
                fontStyle: "italic",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Use when: {fw.trigger}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="expand-body" style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-3)",
              marginBottom: 14,
              padding: "8px 10px",
              background: "var(--bg-2)",
              borderRadius: 6,
              borderLeft: `2px solid ${fw.color}`,
            }}
          >
            <strong style={{ color: "var(--text-2)" }}>Use when: </strong>
            {fw.trigger}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.07em", marginBottom: 8 }}>
              STRUCTURE
            </div>
            <StaticTree tree={fw.tree} accent={fw.color} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.07em", marginBottom: 8 }}>
              KEY QUESTIONS
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
              {fw.keyQuestions.map((q, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{q}</li>
              ))}
            </ol>
          </div>

          <div style={{ borderTop: "1px solid var(--line-1)", paddingTop: 12 }}>
            <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
              {["example", "mistakes"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSubTab(t)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${subTab === t ? fw.color : "transparent"}`,
                    color: subTab === t ? "var(--text-1)" : "var(--text-3)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "color 0.15s",
                  }}
                >
                  {t === "example" ? "Real Example" : "Common Mistakes"}
                </button>
              ))}
            </div>
            {subTab === "example" && (
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: 0 }}>{fw.realExample}</p>
            )}
            {subTab === "mistakes" && (
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {fw.commonMistakes.map((m, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{m}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigateDrill(fw.id)} style={{ fontSize: 12 }}>
              Practice in Flash Drill →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Library Tab ──────────────────────────────────────────────────────────────

function LibraryTab({ onNavigateDrill, confidence }) {
  const needsReviewSet = React.useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem("drillHistory") || "{}");
      const set = new Set();
      for (const [id, entries] of Object.entries(history)) {
        const last = entries[entries.length - 1];
        if (last && last.rating === "bad") set.add(id);
      }
      return set;
    } catch {
      return new Set();
    }
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Framework Library</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
          {FRAMEWORKS.length} frameworks · Click any card to expand the full structure, key questions, and examples. Dot = confidence from games.
        </p>
      </div>
      <div className="framework-grid">
        {FRAMEWORKS.map((fw) => (
          <FrameworkCard
            key={fw.id}
            fw={fw}
            needsReview={needsReviewSet.has(fw.id)}
            onNavigateDrill={onNavigateDrill}
            confidence={confidence[fw.id] || 0}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Flash Drill Tab ──────────────────────────────────────────────────────────

function FlashDrillTab({ highlightedFw }) {
  const [queue, setQueue] = React.useState(() => [...FRAMEWORKS]);
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [sessionDone, setSessionDone] = React.useState(false);

  React.useEffect(() => {
    if (highlightedFw) {
      const i = queue.findIndex((fw) => fw.id === highlightedFw);
      if (i !== -1) { setIdx(i); setFlipped(false); setElapsed(0); }
    }
  }, [highlightedFw]); // eslint-disable-line

  React.useEffect(() => {
    if (flipped || sessionDone) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [flipped, sessionDone]);

  const saveHistory = (fwId, rating) => {
    try {
      const history = JSON.parse(localStorage.getItem("drillHistory") || "{}");
      if (!history[fwId]) history[fwId] = [];
      history[fwId].push({ date: new Date().toISOString().slice(0, 10), rating, elapsedSeconds: elapsed });
      localStorage.setItem("drillHistory", JSON.stringify(history));
    } catch {}
  };

  const handleRate = (rating) => {
    const fw = queue[idx];
    saveHistory(fw.id, rating);

    const remaining = [...queue.slice(0, idx), ...queue.slice(idx + 1)];
    if (rating === "bad") remaining.push(fw);

    if (remaining.length === 0) {
      setSessionDone(true);
      return;
    }

    setQueue(remaining);
    setIdx(0);
    setFlipped(false);
    setElapsed(0);
  };

  const restart = () => {
    setQueue([...FRAMEWORKS]);
    setIdx(0);
    setFlipped(false);
    setElapsed(0);
    setSessionDone(false);
  };

  if (sessionDone) {
    return (
      <div className="drill-card">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <div className="drill-front-title">Session complete!</div>
        <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28 }}>
          You reviewed all {FRAMEWORKS.length} frameworks. Ones you marked "Again" have been saved to review next time.
        </p>
        <button className="btn" onClick={restart}>Start again</button>
      </div>
    );
  }

  const fw = queue[idx];
  const remaining = queue.length;
  const progress = FRAMEWORKS.length - remaining;
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(progress / FRAMEWORKS.length) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)", flexShrink: 0 }}>
          {progress}/{FRAMEWORKS.length}
        </span>
      </div>

      <div className="drill-card">
        {!flipped ? (
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.07em" }}>FRAMEWORK</div>
            <div className="drill-front-title" style={{ color: fw.color }}>{fw.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 8 }}>{fw.subtitle}</div>
            <div className="drill-timer">{formatTime(elapsed)}</div>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
              Mentally walk through the structure. When ready, flip to see the full tree.
            </p>
            <button className="btn" onClick={() => setFlipped(true)}>Reveal structure</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.07em" }}>
              {fw.title.toUpperCase()} · STRUCTURE
            </div>
            <div style={{ marginBottom: 16, textAlign: "left" }}>
              <StaticTree tree={fw.tree} accent={fw.color} />
            </div>
            <div style={{ textAlign: "left", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.07em" }}>KEY QUESTIONS</div>
              <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {fw.keyQuestions.slice(0, 3).map((q, i) => (
                  <li key={i} style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>{q}</li>
                ))}
              </ol>
            </div>
            <div className="drill-timer">Time: {formatTime(elapsed)}</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>How well did you recall this?</div>
            <div className="drill-rating-row">
              <button className="rating-btn bad" onClick={() => handleRate("bad")}>😕 Again</button>
              <button className="rating-btn ok" onClick={() => handleRate("ok")}>🤔 Partial</button>
              <button className="rating-btn good" onClick={() => handleRate("good")}>✅ Got it</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Application Guide Tab ────────────────────────────────────────────────────

function ApplicationGuideTab({ onNavigateLibrary }) {
  const [nodeId, setNodeId] = React.useState("root");
  const [breadcrumb, setBreadcrumb] = React.useState(["Start"]);

  const nodeMap = React.useMemo(() => {
    const m = {};
    for (const n of DECISION_TREE) m[n.id] = n;
    return m;
  }, []);

  const isFwId = (id) => FRAMEWORKS.some((f) => f.id === id);

  const handleOption = (next, label) => {
    if (isFwId(next)) {
      setBreadcrumb((b) => [...b, label, FRAMEWORKS.find((f) => f.id === next).title]);
      setNodeId(next);
    } else {
      setBreadcrumb((b) => [...b, label]);
      setNodeId(next);
    }
  };

  const reset = () => { setNodeId("root"); setBreadcrumb(["Start"]); };

  const node = nodeMap[nodeId];
  const fw = isFwId(nodeId) ? FRAMEWORKS.find((f) => f.id === nodeId) : null;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Which framework should I use?</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
          Answer a few questions to identify the right framework for your case.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: "var(--text-3)", fontSize: 12 }}>›</span>}
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: i === breadcrumb.length - 1 ? "var(--text-1)" : "var(--text-3)" }}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
        {nodeId !== "root" && (
          <button onClick={reset} style={{ marginLeft: 8, fontSize: 11, background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--font-mono)", padding: 0 }}>
            ↺ restart
          </button>
        )}
      </div>

      {node && !fw && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 16, lineHeight: 1.4 }}>{node.question}</div>
          <div>
            {node.options.map((opt, i) => (
              <button key={i} className="decision-option card" onClick={() => handleOption(opt.next, opt.label)} style={{ display: "block", width: "100%", marginBottom: 8 }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {fw && (
        <div className="card" style={{ padding: 20, borderLeft: `3px solid ${fw.color}` }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.07em" }}>RECOMMENDED FRAMEWORK</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: fw.color, marginBottom: 4 }}>{fw.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>{fw.subtitle}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", padding: "10px 12px", background: "var(--bg-2)", borderRadius: 6, marginBottom: 14, lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-1)" }}>Why this framework?</strong><br />
            Use when: {fw.trigger}
          </div>
          <div style={{ marginBottom: 16 }}><StaticTree tree={fw.tree} accent={fw.color} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => onNavigateLibrary(fw.id)}>View full framework →</button>
            <button className="btn btn-ghost" onClick={reset}>Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAMES TAB
// ═══════════════════════════════════════════════════════════════════════════════

// ─── XP bar ───────────────────────────────────────────────────────────────────

function XPBar({ xp }) {
  const level = LEVEL_THRESHOLDS.filter((t) => xp >= t).length - 1;
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const prevThreshold = LEVEL_THRESHOLDS[level];
  const pct = level >= LEVEL_TITLES.length - 1
    ? 100
    : Math.min(100, ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100);

  return (
    <div className="card" style={{ padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.07em", marginBottom: 2 }}>
          LEVEL {level + 1}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{LEVEL_TITLES[level]}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: "var(--bg-2)", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 4, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
          {xp} / {level >= LEVEL_TITLES.length - 1 ? "MAX" : nextThreshold} XP
        </div>
      </div>
    </div>
  );
}

// ─── Game 1: Framework Sprint ─────────────────────────────────────────────────

function SprintGame({ addXP, updateConfidence, onBack }) {
  const [questions] = React.useState(() => makeSprintQuestions());
  const [qIdx, setQIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(new Set());
  const [timeLeft, setTimeLeft] = React.useState(90);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [showCorrect, setShowCorrect] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [streakBonus, setStreakBonus] = React.useState(null);
  const [answers, setAnswers] = React.useState([]);

  React.useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  const q = questions[qIdx];

  if (!q || done) {
    const mastered = answers.filter((a) => a.correct).map((a) => a.fwId);
    const missed = answers.filter((a) => !a.correct).map((a) => a.fwId);
    return (
      <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>⚡</div>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Sprint complete!</h3>
        <div style={{ fontSize: 36, fontWeight: 800, color: "var(--accent)", marginBottom: 20, letterSpacing: "-0.03em" }}>{score} pts</div>
        {mastered.length > 0 && (
          <div style={{ textAlign: "left", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--good)", marginBottom: 6, letterSpacing: "0.07em" }}>✓ MASTERED</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mastered.map((id) => { const fw = FRAMEWORKS.find((f) => f.id === id); return <span key={id} className="badge" style={{ background: "rgba(88,201,122,0.1)", color: "var(--good)", border: "1px solid rgba(88,201,122,0.3)" }}>{fw?.title}</span>; })}
            </div>
          </div>
        )}
        {missed.length > 0 && (
          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--danger)", marginBottom: 6, letterSpacing: "0.07em" }}>✗ NEEDS REVIEW</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {missed.map((id) => { const fw = FRAMEWORKS.find((f) => f.id === id); return <span key={id} className="badge" style={{ background: "rgba(226,106,106,0.1)", color: "var(--danger)", border: "1px solid rgba(226,106,106,0.3)" }}>{fw?.title}</span>; })}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn" onClick={() => window.location.reload()}>Play again</button>
          <button className="btn btn-ghost" onClick={onBack}>← Games</button>
        </div>
      </div>
    );
  }

  const toggleOption = (label) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const advance = () => {
    if (qIdx + 1 >= questions.length) { setDone(true); }
    else { setQIdx((i) => i + 1); setSelected(new Set()); setSubmitted(false); setShowCorrect(false); }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = selected.size === q.correct.length && [...selected].every((s) => q.correct.includes(s));
    if (isCorrect) {
      const multiplier = streak >= 2 ? Math.min(streak, 5) : 1;
      let pts = (timeLeft > 80 ? 3 : timeLeft > 60 ? 2 : 1) * multiplier;
      const newStreak = streak + 1;
      setStreak(newStreak);
      if ([3, 5, 7].includes(newStreak)) {
        pts += newStreak;
        setStreakBonus(`🔥 STREAK ×${newStreak} BONUS +${newStreak}!`);
        setTimeout(() => setStreakBonus(null), 1600);
      }
      setScore((s) => s + pts);
      addXP(pts, "Framework Sprint");
      updateConfidence(q.frameworkId, "known");
      setAnswers((a) => [...a, { fwId: q.frameworkId, correct: true }]);
      setTimeout(advance, 700);
    } else {
      setStreak(0);
      setShowCorrect(true);
      updateConfidence(q.frameworkId, "missed");
      setAnswers((a) => [...a, { fwId: q.frameworkId, correct: false }]);
      setTimeout(advance, 1600);
    }
  };

  const btnStyle = (label) => {
    const sel = selected.has(label);
    if (showCorrect) {
      if (q.correct.includes(label)) return { background: "rgba(88,201,122,0.15)", borderColor: "rgba(88,201,122,0.5)", color: "var(--good)" };
      if (sel) return { background: "rgba(226,106,106,0.1)", borderColor: "rgba(226,106,106,0.4)", color: "var(--danger)" };
    }
    if (sel) return { background: "var(--accent-soft)", borderColor: "var(--accent)", color: "var(--accent)" };
    return {};
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, height: 5, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${(timeLeft / 90) * 100}%`, height: "100%", background: timeLeft < 20 ? "var(--danger)" : "var(--accent)", borderRadius: 3, transition: "width 1s linear" }} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: timeLeft < 20 ? "var(--danger)" : "var(--text-1)", minWidth: 42 }}>
          {timeLeft}s
        </div>
        {streak >= 2 && (
          <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--warn)", fontWeight: 700 }}>🔥 {streak}x</div>
        )}
      </div>

      {streakBonus && (
        <div style={{ textAlign: "center", color: "var(--warn)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, marginBottom: 10, padding: "6px 0" }}>
          {streakBonus}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.07em", marginBottom: 4 }}>
          FRAMEWORK {qIdx + 1} / {questions.length}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: q.fw.color, marginBottom: 4 }}>{q.fw.title}</div>
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Select ALL top-level branches</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {q.options.map((label, i) => (
          <button
            key={i}
            onClick={() => toggleOption(label)}
            style={{
              padding: "10px 14px",
              border: "1px solid var(--line-2)",
              borderRadius: "var(--r-md)",
              background: "var(--bg-2)",
              fontSize: 13,
              cursor: submitted ? "default" : "pointer",
              textAlign: "left",
              transition: "all 0.1s",
              fontFamily: "var(--font-sans)",
              ...btnStyle(label),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {selected.size > 0 && !submitted && (
        <button className="btn" style={{ width: "100%" }} onClick={handleSubmit}>
          Submit answer
        </button>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: "var(--text-3)", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
        <span>Score: {score} pts</span>
        <button style={{ background: "none", border: "none", fontSize: 11.5, color: "var(--text-4)", cursor: "pointer", fontFamily: "var(--font-mono)", padding: 0 }} onClick={onBack}>← back</button>
      </div>
    </div>
  );
}

// ─── Game 2: Branch Builder ────────────────────────────────────────────────────

function BuilderRound({ fw, addXP, updateConfidence, onNext, onBack }) {
  const builderData = React.useMemo(() => makeBuilderData(fw), [fw.id]); // eslint-disable-line
  const [unplaced, setUnplaced] = React.useState(() => builderData.cards.map((c) => c.label));
  const [placed, setPlaced] = React.useState(() => Object.fromEntries(builderData.zones.map((z) => [z, []])));
  const [dragging, setDragging] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  const startRef = React.useRef(Date.now());

  React.useEffect(() => {
    if (result) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [result]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const moveToZone = (label, fromZone, toZone) => {
    if (fromZone === null) {
      setUnplaced((u) => u.filter((l) => l !== label));
    } else {
      setPlaced((p) => ({ ...p, [fromZone]: p[fromZone].filter((l) => l !== label) }));
    }
    if (toZone === null) {
      setUnplaced((u) => [...u, label]);
    } else {
      setPlaced((p) => ({ ...p, [toZone]: [...p[toZone], label] }));
    }
  };

  const handleSubmit = () => {
    const correctMap = Object.fromEntries(builderData.cards.map((c) => [c.label, c.correctZone]));
    let xpEarned = 0;
    const breakdown = [];
    for (const [zone, items] of Object.entries(placed)) {
      for (const label of items) {
        const isCorrect = correctMap[label] === zone;
        breakdown.push({ label, placedZone: zone, correctZone: correctMap[label], correct: isCorrect });
        if (isCorrect) { xpEarned += 5; updateConfidence(fw.id, "known"); }
        else { updateConfidence(fw.id, "missed"); }
      }
    }
    const speedBonus = elapsed < 25;
    if (speedBonus) xpEarned = Math.round(xpEarned * 1.5);
    addXP(xpEarned, "Branch Builder");
    setResult({ breakdown, xpEarned, speedBonus });
  };

  if (result) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏗️</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: fw.color }}>{fw.title}</h3>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--good)", marginBottom: 4 }}>+{result.xpEarned} XP</div>
          {result.speedBonus && <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--warn)" }}>⚡ SPEED BONUS (under 25s)</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {result.breakdown.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 6,
              background: item.correct ? "rgba(88,201,122,0.07)" : "rgba(226,106,106,0.07)",
              border: `1px solid ${item.correct ? "rgba(88,201,122,0.25)" : "rgba(226,106,106,0.25)"}`,
            }}>
              <span style={{ color: item.correct ? "var(--good)" : "var(--danger)", fontSize: 13 }}>{item.correct ? "✓" : "✗"}</span>
              <span style={{ fontSize: 13, flex: 1 }}>{item.label}</span>
              {!item.correct && <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>→ {item.correctZone}</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={onNext}>Next framework →</button>
          <button className="btn btn-ghost" onClick={onBack}>← Games</button>
        </div>
      </div>
    );
  }

  const colCount = Math.min(builderData.zones.length, 3);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: fw.color, flex: 1 }}>🏗️ {fw.title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)" }}>{formatTime(elapsed)}</div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>Drag each label card into its correct branch zone.</p>

      {/* Unplaced area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver("__unplaced__"); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={() => {
          if (dragging && dragging.fromZone !== null) moveToZone(dragging.label, dragging.fromZone, null);
          setDragging(null); setDragOver(null);
        }}
        style={{
          display: "flex", flexWrap: "wrap", gap: 8, minHeight: 46, padding: 10,
          borderRadius: "var(--r-md)",
          border: dragOver === "__unplaced__" ? "1px solid var(--accent-line)" : "1px dashed var(--line-2)",
          background: dragOver === "__unplaced__" ? "var(--accent-soft)" : "var(--bg-2)",
          marginBottom: 18, transition: "border-color 0.1s, background 0.1s",
        }}
      >
        {unplaced.length === 0
          ? <span style={{ fontSize: 12, color: "var(--text-4)", fontFamily: "var(--font-mono)", alignSelf: "center" }}>All cards placed</span>
          : unplaced.map((label) => (
            <div
              key={label}
              draggable
              onDragStart={() => setDragging({ label, fromZone: null })}
              onDragEnd={() => setDragging(null)}
              className="badge"
              style={{ padding: "6px 12px", cursor: "grab", userSelect: "none", fontSize: 12, background: "var(--bg-3)", border: "1px solid var(--line-2)" }}
            >
              {label}
            </div>
          ))
        }
      </div>

      {/* Drop zones */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: 10, marginBottom: 16 }}>
        {builderData.zones.map((zone) => (
          <div
            key={zone}
            onDragOver={(e) => { e.preventDefault(); setDragOver(zone); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => {
              if (dragging) moveToZone(dragging.label, dragging.fromZone, zone);
              setDragging(null); setDragOver(null);
            }}
            style={{
              minHeight: 80, borderRadius: "var(--r-md)", padding: 10,
              border: dragOver === zone ? "1px solid var(--accent-line)" : "1px dashed var(--line-2)",
              background: dragOver === zone ? "var(--accent-soft)" : "var(--bg-2)",
              transition: "border-color 0.1s, background 0.1s",
            }}
          >
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>
              {zone.toUpperCase()}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {placed[zone]?.map((label) => (
                <div
                  key={label}
                  draggable
                  onDragStart={() => setDragging({ label, fromZone: zone })}
                  onDragEnd={() => setDragging(null)}
                  className="badge"
                  style={{ padding: "5px 10px", cursor: "grab", userSelect: "none", fontSize: 12, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", color: "var(--accent)" }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unplaced.length === 0 && (
        <button className="btn" style={{ width: "100%" }} onClick={handleSubmit}>
          Check answers
        </button>
      )}
    </div>
  );
}

function BuilderGame({ addXP, updateConfidence, onBack, confidence }) {
  const [fwIdx, setFwIdx] = React.useState(() => Math.floor(Math.random() * FRAMEWORKS.length));
  const [roundKey, setRoundKey] = React.useState(0);

  const pickNext = () => {
    const weights = FRAMEWORKS.map((f) => Math.max(1, 6 - (confidence[f.id] || 0)));
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < FRAMEWORKS.length; i++) {
      r -= weights[i];
      if (r <= 0) { setFwIdx(i); setRoundKey((k) => k + 1); return; }
    }
    setFwIdx(0); setRoundKey((k) => k + 1);
  };

  return (
    <BuilderRound
      key={roundKey}
      fw={FRAMEWORKS[fwIdx]}
      addXP={addXP}
      updateConfidence={updateConfidence}
      onNext={pickNext}
      onBack={onBack}
    />
  );
}

// ─── Game 3: Case Sorter ──────────────────────────────────────────────────────

function SorterGame({ addXP, updateConfidence, onBack, hardOnly = false }) {
  const [prompts] = React.useState(() => shuffle(hardOnly ? CASE_PROMPTS.filter((p) => p.difficulty === 3) : CASE_PROMPTS).slice(0, 20));
  const [idx, setIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  const [flash, setFlash] = React.useState(null);
  const [done, setDone] = React.useState(false);

  const current = prompts[idx];

  const handleAnswer = (fwId) => {
    if (flash) return;
    const isCorrect = fwId === current.answer;
    setFlash({ correct: isCorrect, chosen: fwId });
    if (isCorrect) {
      const bonus = streak >= 2 ? streak * 2 : 0;
      const pts = 10 + bonus;
      setScore((s) => s + pts);
      addXP(pts, "Case Sorter");
      updateConfidence(current.answer, "known");
      const ns = streak + 1;
      setStreak(ns);
      setBestStreak((b) => Math.max(b, ns));
    } else {
      setScore((s) => Math.max(0, s - 5));
      updateConfidence(current.answer, "missed");
      setStreak(0);
    }
    setAnswers((a) => [...a, { answer: current.answer, chosen: fwId, correct: isCorrect }]);
    setTimeout(() => {
      setFlash(null);
      if (idx + 1 >= prompts.length) setDone(true);
      else setIdx((i) => i + 1);
    }, isCorrect ? 550 : 950);
  };

  if (done) {
    const accuracy = Math.round((answers.filter((a) => a.correct).length / answers.length) * 100);
    const confMap = {};
    answers.filter((a) => !a.correct).forEach((a) => {
      const key = `${a.answer}||${a.chosen}`;
      confMap[key] = (confMap[key] || 0) + 1;
    });
    const topConf = Object.entries(confMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎯</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Case Sorter Complete</h3>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {[{ v: score, l: "SCORE", c: "var(--accent)" }, { v: `${accuracy}%`, l: "ACCURACY", c: accuracy >= 70 ? "var(--good)" : "var(--warn)" }, { v: `🔥${bestStreak}`, l: "BEST STREAK", c: "var(--warn)" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.07em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {topConf.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--danger)", marginBottom: 8, letterSpacing: "0.07em" }}>CONFUSED PAIRS</div>
            {topConf.map(([key, count], i) => {
              const [from, to] = key.split("||");
              return (
                <div key={i} style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 4 }}>
                  Answered <strong>{FRAMEWORKS.find((f) => f.id === to)?.title}</strong> when correct was <strong>{FRAMEWORKS.find((f) => f.id === from)?.title}</strong> ({count}×)
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => { setIdx(0); setScore(0); setStreak(0); setBestStreak(0); setAnswers([]); setDone(false); }}>Play again</button>
          <button className="btn btn-ghost" onClick={onBack}>← Games</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>{idx + 1}/{prompts.length}</div>
        <div style={{ flex: 1, height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(idx / prompts.length) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", flexShrink: 0 }}>{score}pts</div>
        {streak >= 2 && <div style={{ fontSize: 12, color: "var(--warn)", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>🔥{streak}x</div>}
      </div>

      <div style={{
        padding: "18px 20px", borderRadius: "var(--r-lg)", marginBottom: 18,
        background: flash ? (flash.correct ? "rgba(88,201,122,0.07)" : "rgba(226,106,106,0.07)") : "var(--bg-2)",
        border: flash ? `1px solid ${flash.correct ? "rgba(88,201,122,0.3)" : "rgba(226,106,106,0.3)"}` : "1px solid var(--line-1)",
        transition: "background 0.2s, border-color 0.2s",
      }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.07em" }}>
          CASE PROMPT · DIFFICULTY {"★".repeat(current.difficulty)}{"☆".repeat(3 - current.difficulty)}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-1)", fontWeight: 500 }}>{current.prompt}</div>
        {flash && !flash.correct && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
            −5 pts · correct answer: {FRAMEWORKS.find((f) => f.id === current.answer)?.title}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {FRAMEWORKS.map((fw) => {
          let extra = {};
          if (flash) {
            if (fw.id === current.answer) extra = { background: "rgba(88,201,122,0.1)", borderColor: "rgba(88,201,122,0.4)", color: "var(--good)" };
            else if (fw.id === flash.chosen && !flash.correct) extra = { background: "rgba(226,106,106,0.08)", borderColor: "rgba(226,106,106,0.3)", color: "var(--danger)" };
          }
          return (
            <button
              key={fw.id}
              onClick={() => handleAnswer(fw.id)}
              disabled={!!flash}
              style={{
                padding: "10px 14px", textAlign: "left", background: "var(--bg-2)",
                border: `1px solid ${fw.color}22`, borderLeft: `3px solid ${fw.color}`,
                borderRadius: "var(--r-md)", cursor: flash ? "default" : "pointer",
                transition: "all 0.1s", fontFamily: "var(--font-sans)", ...extra,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{fw.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{fw.subtitle}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game 4: Weekly Mastery Challenge ─────────────────────────────────────────

function WeeklySprintPhase({ onComplete, addXP, updateConfidence }) {
  const [questions] = React.useState(() => makeSprintQuestions().slice(0, 4));
  const [qIdx, setQIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(new Set());
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [score, setScore] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!doneRef.current) { doneRef.current = true; onComplete(score); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const q = questions[qIdx];
  if (!q) return null;

  const advance = (pts) => {
    const ns = score + pts;
    if (qIdx + 1 >= questions.length) {
      doneRef.current = true;
      onComplete(ns);
    } else {
      setQIdx((i) => i + 1);
      setSelected(new Set());
      setSubmitted(false);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = selected.size === q.correct.length && [...selected].every((s) => q.correct.includes(s));
    const pts = isCorrect ? (timeLeft > 40 ? 3 : 2) : 0;
    if (pts > 0) { addXP(pts, "Weekly Sprint"); updateConfidence(q.frameworkId, "known"); }
    else { updateConfidence(q.frameworkId, "missed"); }
    setScore((s) => s + pts);
    setTimeout(() => advance(pts), 700);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: q.fw.color }}>{q.fw.title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: timeLeft < 15 ? "var(--danger)" : "var(--text-2)", fontWeight: 600 }}>{timeLeft}s</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>Select all top-level branches ({qIdx + 1}/4)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        {q.options.map((label, i) => {
          const sel = selected.has(label);
          return (
            <button key={i} onClick={() => { if (submitted) return; setSelected((p) => { const n = new Set(p); sel ? n.delete(label) : n.add(label); return n; }); }}
              style={{ padding: "8px 12px", border: `1px solid ${sel ? "var(--accent)" : "var(--line-2)"}`, borderRadius: "var(--r-md)", background: sel ? "var(--accent-soft)" : "var(--bg-2)", color: sel ? "var(--accent)" : "var(--text-2)", fontSize: 12, cursor: submitted ? "default" : "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}>
              {label}
            </button>
          );
        })}
      </div>
      {selected.size > 0 && !submitted && <button className="btn" style={{ width: "100%" }} onClick={handleSubmit}>Submit</button>}
    </div>
  );
}

function WeeklyBuilderPhase({ onComplete, addXP, updateConfidence }) {
  const [fw] = React.useState(() => FRAMEWORKS[Math.floor(Math.random() * FRAMEWORKS.length)]);
  const bd = React.useMemo(() => makeBuilderData(fw), [fw.id]); // eslint-disable-line
  const [unplaced, setUnplaced] = React.useState(() => bd.cards.map((c) => c.label));
  const [placed, setPlaced] = React.useState(() => Object.fromEntries(bd.zones.map((z) => [z, []])));
  const [dragging, setDragging] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(60);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!doneRef.current) { doneRef.current = true; onComplete(0); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const move = (label, from, to) => {
    if (from === null) setUnplaced((u) => u.filter((l) => l !== label));
    else setPlaced((p) => ({ ...p, [from]: p[from].filter((l) => l !== label) }));
    if (to === null) setUnplaced((u) => [...u, label]);
    else setPlaced((p) => ({ ...p, [to]: [...p[to], label] }));
  };

  const handleSubmit = () => {
    const cm = Object.fromEntries(bd.cards.map((c) => [c.label, c.correctZone]));
    let correct = 0;
    for (const [zone, items] of Object.entries(placed)) {
      for (const label of items) {
        if (cm[label] === zone) { correct++; updateConfidence(fw.id, "known"); }
        else { updateConfidence(fw.id, "missed"); }
      }
    }
    const pct = Math.round((correct / bd.cards.length) * 100);
    const xp = correct * 5;
    addXP(xp, "Weekly Builder");
    doneRef.current = true;
    onComplete(pct);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: fw.color }}>{fw.title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: timeLeft < 15 ? "var(--danger)" : "var(--text-2)", fontWeight: 600 }}>{timeLeft}s</div>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver("_up_"); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={() => { if (dragging && dragging.from) { move(dragging.label, dragging.from, null); } setDragging(null); setDragOver(null); }}
        style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 36, padding: 8, borderRadius: "var(--r-md)", border: dragOver === "_up_" ? "1px solid var(--accent-line)" : "1px dashed var(--line-2)", background: dragOver === "_up_" ? "var(--accent-soft)" : "var(--bg-2)", marginBottom: 12 }}
      >
        {unplaced.map((label) => (
          <div key={label} draggable onDragStart={() => setDragging({ label, from: null })} onDragEnd={() => setDragging(null)}
            style={{ padding: "4px 10px", border: "1px solid var(--line-2)", borderRadius: 4, background: "var(--bg-3)", fontSize: 11.5, cursor: "grab", userSelect: "none" }}>
            {label}
          </div>
        ))}
        {unplaced.length === 0 && <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)", alignSelf: "center" }}>all placed</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(bd.zones.length, 3)}, 1fr)`, gap: 8, marginBottom: 10 }}>
        {bd.zones.map((zone) => (
          <div key={zone}
            onDragOver={(e) => { e.preventDefault(); setDragOver(zone); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => { if (dragging) move(dragging.label, dragging.from, zone); setDragging(null); setDragOver(null); }}
            style={{ minHeight: 60, borderRadius: "var(--r-md)", padding: 8, border: dragOver === zone ? "1px solid var(--accent-line)" : "1px dashed var(--line-2)", background: dragOver === zone ? "var(--accent-soft)" : "var(--bg-2)", transition: "border-color 0.1s" }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6 }}>{zone.toUpperCase()}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {placed[zone]?.map((label) => (
                <div key={label} draggable onDragStart={() => setDragging({ label, from: zone })} onDragEnd={() => setDragging(null)}
                  style={{ padding: "3px 8px", border: "1px solid var(--accent-line)", borderRadius: 4, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11.5, cursor: "grab", userSelect: "none" }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {unplaced.length === 0 && <button className="btn" style={{ width: "100%" }} onClick={handleSubmit}>Submit placements</button>}
    </div>
  );
}

function WeeklySorterPhase({ onComplete, updateConfidence }) {
  const [prompts] = React.useState(() => shuffle(CASE_PROMPTS).slice(0, 8));
  const [idx, setIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [flash, setFlash] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(60);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!doneRef.current) { doneRef.current = true; onComplete(score); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const current = prompts[idx];
  if (!current) return null;

  const handleAnswer = (fwId) => {
    if (flash) return;
    const isCorrect = fwId === current.answer;
    const pts = isCorrect ? 10 : 0;
    setScore((s) => s + pts);
    updateConfidence(current.answer, isCorrect ? "known" : "missed");
    setFlash({ correct: isCorrect, chosen: fwId });
    setTimeout(() => {
      setFlash(null);
      const nextIdx = idx + 1;
      if (nextIdx >= prompts.length) {
        doneRef.current = true;
        onComplete(score + pts);
      } else {
        setIdx(nextIdx);
      }
    }, 500);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{idx + 1}/8 prompts</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: timeLeft < 15 ? "var(--danger)" : "var(--text-2)", fontWeight: 600 }}>{timeLeft}s</div>
      </div>
      <div style={{ padding: "12px 14px", borderRadius: "var(--r-md)", background: "var(--bg-2)", border: "1px solid var(--line-1)", marginBottom: 10, fontSize: 13.5, lineHeight: 1.6, fontWeight: 500 }}>
        {current.prompt}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {FRAMEWORKS.map((fw) => {
          let extra = {};
          if (flash) {
            if (fw.id === current.answer) extra = { background: "rgba(88,201,122,0.1)", borderColor: "rgba(88,201,122,0.35)" };
            else if (fw.id === flash.chosen && !flash.correct) extra = { background: "rgba(226,106,106,0.08)", borderColor: "rgba(226,106,106,0.3)" };
          }
          return (
            <button key={fw.id} onClick={() => handleAnswer(fw.id)} disabled={!!flash}
              style={{ padding: "7px 10px", textAlign: "left", background: "var(--bg-2)", border: `1px solid ${fw.color}22`, borderLeft: `2px solid ${fw.color}`, borderRadius: "var(--r-md)", cursor: flash ? "default" : "pointer", fontFamily: "var(--font-sans)", fontSize: 12, ...extra }}>
              {fw.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyChallenge({ addXP, updateConfidence, onBack }) {
  const today = new Date().toISOString().slice(0, 10);
  const [lastDate] = React.useState(() => localStorage.getItem("lastChallengeDate") || null);
  const [phase, setPhase] = React.useState("home");
  const [scores, setScores] = React.useState({ sprint: 0, builder: 0, sorter: 0 });

  const daysSinceLast = lastDate ? (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24) : 999;
  const isLocked = daysSinceLast < 7 && daysSinceLast > 0;
  const daysUntilNext = isLocked ? Math.ceil(7 - daysSinceLast) : 0;

  const completeMastery = (finalScores) => {
    const sp = Math.min(100, Math.round((finalScores.sprint / 12) * 100));
    const bu = Math.min(100, finalScores.builder);
    const so = Math.min(100, Math.round((finalScores.sorter / 80) * 100));
    const mastery = Math.round(sp * 0.3 + bu * 0.3 + so * 0.4);
    try {
      const hist = JSON.parse(localStorage.getItem("masteryHistory") || "[]");
      hist.unshift({ date: today, score: mastery, breakdown: { sprint: sp, builder: bu, sorter: so } });
      localStorage.setItem("masteryHistory", JSON.stringify(hist.slice(0, 10)));
      localStorage.setItem("lastChallengeDate", today);
    } catch {}
    addXP(mastery, "Weekly Mastery Challenge");
    setScores({ sprint: sp, builder: bu, sorter: so });
    setPhase("results");
  };

  if (isLocked) {
    return (
      <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Challenge locked</h3>
        <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 20 }}>
          Next challenge unlocks in <strong style={{ color: "var(--text-1)" }}>{daysUntilNext}d</strong>
        </p>
        <button className="btn btn-ghost" onClick={onBack}>← Back to games</button>
      </div>
    );
  }

  if (phase === "home") {
    return (
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏆</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Weekly Mastery Challenge</h3>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>3 phases · 3 minutes total · once per week</p>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {[
            { emoji: "⚡", label: "Sprint", desc: "4 frameworks · identify all branches · 60s" },
            { emoji: "🏗️", label: "Builder", desc: "1 framework · drag cards into zones · 60s" },
            { emoji: "🎯", label: "Sorter", desc: "8 case prompts · pick the framework · 60s" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 18px", borderBottom: i < 2 ? "1px solid var(--line-1)" : "none" }}>
              <div style={{ fontSize: 22, width: 32, flexShrink: 0, textAlign: "center" }}>{p.emoji}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Phase {i + 1}: {p.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={() => setPhase("sprint")}>Start Challenge →</button>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onBack}>← Back to games</button>
      </div>
    );
  }

  if (phase === "results") {
    const mastery = Math.round(scores.sprint * 0.3 + scores.builder * 0.3 + scores.sorter * 0.4);
    return (
      <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🏆</div>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Mastery Score</h3>
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.04em", color: mastery >= 70 ? "var(--good)" : mastery >= 40 ? "var(--warn)" : "var(--danger)", marginBottom: 20 }}>
          {mastery}<span style={{ fontSize: 22, color: "var(--text-3)", fontWeight: 400 }}>/100</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, textAlign: "left" }}>
          {[{ l: "Sprint (30%)", v: scores.sprint }, { l: "Builder (30%)", v: scores.builder }, { l: "Sorter (40%)", v: scores.sorter }].map((item, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 4 }}>
                <span>{item.l}</span><span>{item.v}%</span>
              </div>
              <div style={{ height: 5, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${item.v}%`, height: "100%", background: "var(--accent)", borderRadius: 3, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, fontFamily: "var(--font-mono)" }}>Saved · Next challenge in 7 days</p>
        <button className="btn btn-ghost" onClick={onBack}>← Back to games</button>
      </div>
    );
  }

  // Active phases
  const phaseNum = { sprint: 1, builder: 2, sorter: 3 }[phase];
  const phaseLabel = { sprint: "Phase 1: Sprint", builder: "Phase 2: Builder", sorter: "Phase 3: Sorter" }[phase];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.06em" }}>{phaseLabel}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n < phaseNum ? "var(--good)" : n === phaseNum ? "var(--accent)" : "var(--bg-3)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {phase === "sprint" && (
        <WeeklySprintPhase
          addXP={addXP}
          updateConfidence={updateConfidence}
          onComplete={(pts) => { setScores((s) => ({ ...s, sprint: Math.min(100, Math.round((pts / 12) * 100)) })); setPhase("builder"); }}
        />
      )}
      {phase === "builder" && (
        <WeeklyBuilderPhase
          addXP={addXP}
          updateConfidence={updateConfidence}
          onComplete={(pct) => { setScores((s) => ({ ...s, builder: pct })); setPhase("sorter"); }}
        />
      )}
      {phase === "sorter" && (
        <WeeklySorterPhase
          updateConfidence={updateConfidence}
          onComplete={(pts) => {
            const finalScores = { ...scores, sorter: pts };
            completeMastery(finalScores);
          }}
        />
      )}
    </div>
  );
}

// ─── Games Tab shell ──────────────────────────────────────────────────────────

const GAME_MODES = [
  { id: "sprint", emoji: "⚡", title: "Framework Sprint", desc: "90 seconds · select all branches · streak multiplier", color: "#4F8EF7" },
  { id: "builder", emoji: "🏗️", title: "Branch Builder", desc: "Drag-and-drop · sort labels into the correct zones · speed bonus", color: "#58C97A" },
  { id: "sorter", emoji: "🎯", title: "Case Sorter", desc: "20 real case prompts · identify the right framework fast", color: "#E26A6A" },
  { id: "weekly", emoji: "🏆", title: "Weekly Challenge", desc: "3 phases · 3 minutes · once per week · earns mastery score", color: "#F5A623" },
];

function GamesTab({ addXP, updateConfidence, confidence, xp }) {
  const [mode, setMode] = React.useState(null);

  if (mode === "sprint") return <SprintGame addXP={addXP} updateConfidence={updateConfidence} onBack={() => setMode(null)} />;
  if (mode === "builder") return <BuilderGame addXP={addXP} updateConfidence={updateConfidence} onBack={() => setMode(null)} confidence={confidence} />;
  if (mode === "sorter") return <SorterGame addXP={addXP} updateConfidence={updateConfidence} onBack={() => setMode(null)} />;
  if (mode === "weekly") return <WeeklyChallenge addXP={addXP} updateConfidence={updateConfidence} onBack={() => setMode(null)} />;

  return (
    <div>
      <XPBar xp={xp} />
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Games</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
          Practice under pressure. Earn XP, build confidence dots in the Library tab.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {GAME_MODES.map((g) => (
          <button
            key={g.id}
            onClick={() => setMode(g.id)}
            style={{
              padding: "20px 18px",
              textAlign: "left",
              background: "var(--bg-1)",
              border: `1px solid ${g.color}30`,
              borderLeft: `4px solid ${g.color}`,
              borderRadius: "var(--r-lg)",
              cursor: "pointer",
              transition: "border-color 0.12s, background 0.12s",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-1)"; }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{g.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{g.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{g.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function FrameworksScreen() {
  const [tab, setTab] = React.useState("library");
  const [highlightedFw, setHighlightedFw] = React.useState(null);

  // ── Shared confidence / XP state ──
  const [confidence, setConfidence] = React.useState(() => {
    try {
      const saved = localStorage.getItem("frameworkConfidence");
      return saved ? JSON.parse(saved) : Object.fromEntries(FRAMEWORKS.map((f) => [f.id, 0]));
    } catch { return Object.fromEntries(FRAMEWORKS.map((f) => [f.id, 0])); }
  });

  const [xp, setXp] = React.useState(() => parseInt(localStorage.getItem("frameworkXP") || "0"));

  const [xpLog, setXpLog] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("xpLog") || "[]"); } catch { return []; }
  });

  const addXP = React.useCallback((amount, reason) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("frameworkXP", String(next));
      return next;
    });
    setXpLog((prev) => {
      const next = [{ amount, reason, date: Date.now() }, ...prev].slice(0, 50);
      localStorage.setItem("xpLog", JSON.stringify(next));
      return next;
    });
    triggerXpFloat(amount);
  }, []);

  const updateConfidence = React.useCallback((frameworkId, rating) => {
    const delta = rating === "known" ? 2 : rating === "partial" ? 1 : -2;
    setConfidence((prev) => {
      const next = { ...prev, [frameworkId]: Math.max(0, Math.min(5, (prev[frameworkId] || 0) + delta)) };
      localStorage.setItem("frameworkConfidence", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleNavigateDrill = (fwId) => { setHighlightedFw(fwId); setTab("drill"); };
  const handleNavigateLibrary = (fwId) => { setHighlightedFw(fwId); setTab("library"); };

  const TABS = [
    { key: "library", label: "📚 Library" },
    { key: "drill",   label: "⚡ Flash Drill" },
    { key: "guide",   label: "🗺 App Guide" },
    { key: "games",   label: "🎮 Games" },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line-1)", marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${tab === t.key ? "var(--accent)" : "transparent"}`,
              color: tab === t.key ? "var(--text-1)" : "var(--text-3)",
              fontSize: 13.5,
              fontWeight: tab === t.key ? 600 : 400,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              marginBottom: -1,
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "library" && <LibraryTab onNavigateDrill={handleNavigateDrill} confidence={confidence} />}
      {tab === "drill"   && <FlashDrillTab highlightedFw={highlightedFw} />}
      {tab === "guide"   && <ApplicationGuideTab onNavigateLibrary={handleNavigateLibrary} />}
      {tab === "games"   && <GamesTab addXP={addXP} updateConfidence={updateConfidence} confidence={confidence} xp={xp} xpLog={xpLog} />}
    </div>
  );
}
