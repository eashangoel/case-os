import React from "react";

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

function FrameworkCard({ fw, needsReview, onNavigateDrill }) {
  const [open, setOpen] = React.useState(false);
  const [subTab, setSubTab] = React.useState("example");

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

          {/* Tree */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 10.5,
                fontFamily: "var(--font-mono)",
                color: "var(--text-3)",
                letterSpacing: "0.07em",
                marginBottom: 8,
              }}
            >
              STRUCTURE
            </div>
            <StaticTree tree={fw.tree} accent={fw.color} />
          </div>

          {/* Key questions */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 10.5,
                fontFamily: "var(--font-mono)",
                color: "var(--text-3)",
                letterSpacing: "0.07em",
                marginBottom: 8,
              }}
            >
              KEY QUESTIONS
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
              {fw.keyQuestions.map((q, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                  {q}
                </li>
              ))}
            </ol>
          </div>

          {/* Sub-tabs */}
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
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: 0 }}>
                {fw.realExample}
              </p>
            )}
            {subTab === "mistakes" && (
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {fw.commonMistakes.map((m, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigateDrill(fw.id)}
              style={{ fontSize: 12 }}
            >
              Practice in Flash Drill →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Library Tab ──────────────────────────────────────────────────────────────

function LibraryTab({ onNavigateDrill }) {
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
          {FRAMEWORKS.length} frameworks · Click any card to expand the full structure, key questions, and examples.
        </p>
      </div>
      <div className="framework-grid">
        {FRAMEWORKS.map((fw) => (
          <FrameworkCard
            key={fw.id}
            fw={fw}
            needsReview={needsReviewSet.has(fw.id)}
            onNavigateDrill={onNavigateDrill}
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

  // Jump to highlighted framework
  React.useEffect(() => {
    if (highlightedFw) {
      const i = queue.findIndex((fw) => fw.id === highlightedFw);
      if (i !== -1) { setIdx(i); setFlipped(false); setElapsed(0); }
    }
  }, [highlightedFw]); // eslint-disable-line

  // Timer
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

    let newQueue = [...queue];
    if (rating === "bad") {
      // re-queue at end
      newQueue = [...newQueue, fw];
    }

    const nextIdx = idx + 1;
    if (nextIdx >= newQueue.filter((_, i) => i !== idx || rating !== "bad" ? true : false).length && rating !== "bad") {
      // simpler: just check if we've exhausted the original list
    }

    // advance
    const remaining = [...newQueue.slice(0, idx), ...newQueue.slice(idx + 1)];
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
        <button className="btn" onClick={restart}>
          Start again
        </button>
      </div>
    );
  }

  const fw = queue[idx];
  const remaining = queue.length;
  const progress = FRAMEWORKS.length - remaining;

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            background: "var(--bg-3)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(progress / FRAMEWORKS.length) * 100}%`,
              height: "100%",
              background: "var(--accent)",
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
        </div>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)", flexShrink: 0 }}>
          {progress}/{FRAMEWORKS.length}
        </span>
      </div>

      <div className="drill-card">
        {!flipped ? (
          /* Front */
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.07em" }}>
              FRAMEWORK
            </div>
            <div className="drill-front-title" style={{ color: fw.color }}>
              {fw.title}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 8 }}>{fw.subtitle}</div>
            <div className="drill-timer">{formatTime(elapsed)}</div>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
              Mentally walk through the structure. When ready, flip to see the full tree.
            </p>
            <button className="btn" onClick={() => setFlipped(true)}>
              Reveal structure
            </button>
          </div>
        ) : (
          /* Back */
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.07em" }}>
              {fw.title.toUpperCase()} · STRUCTURE
            </div>
            <div style={{ marginBottom: 16, textAlign: "left" }}>
              <StaticTree tree={fw.tree} accent={fw.color} />
            </div>
            <div style={{ textAlign: "left", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.07em" }}>
                KEY QUESTIONS
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {fw.keyQuestions.slice(0, 3).map((q, i) => (
                  <li key={i} style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
            <div className="drill-timer">Time: {formatTime(elapsed)}</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>How well did you recall this?</div>
            <div className="drill-rating-row">
              <button className="rating-btn bad" onClick={() => handleRate("bad")}>
                😕 Again
              </button>
              <button className="rating-btn ok" onClick={() => handleRate("ok")}>
                🤔 Partial
              </button>
              <button className="rating-btn good" onClick={() => handleRate("good")}>
                ✅ Got it
              </button>
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

  const reset = () => {
    setNodeId("root");
    setBreadcrumb(["Start"]);
  };

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

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: "var(--text-3)", fontSize: 12 }}>›</span>}
            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: i === breadcrumb.length - 1 ? "var(--text-1)" : "var(--text-3)",
              }}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
        {nodeId !== "root" && (
          <button
            onClick={reset}
            style={{
              marginLeft: 8,
              fontSize: 11,
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              padding: 0,
            }}
          >
            ↺ restart
          </button>
        )}
      </div>

      {/* Decision node */}
      {node && !fw && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 16, lineHeight: 1.4 }}>
            {node.question}
          </div>
          <div>
            {node.options.map((opt, i) => (
              <button
                key={i}
                className="decision-option card"
                onClick={() => handleOption(opt.next, opt.label)}
                style={{ display: "block", width: "100%", marginBottom: 8 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Framework result */}
      {fw && (
        <div className="card" style={{ padding: 20, borderLeft: `3px solid ${fw.color}` }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.07em" }}>
            RECOMMENDED FRAMEWORK
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: fw.color, marginBottom: 4 }}>{fw.title}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>{fw.subtitle}</div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              padding: "10px 12px",
              background: "var(--bg-2)",
              borderRadius: 6,
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--text-1)" }}>Why this framework?</strong>
            <br />
            Use when: {fw.trigger}
          </div>
          <div style={{ marginBottom: 16 }}>
            <StaticTree tree={fw.tree} accent={fw.color} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => onNavigateLibrary(fw.id)}>
              View full framework →
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function FrameworksScreen() {
  const [tab, setTab] = React.useState("library");
  const [highlightedFw, setHighlightedFw] = React.useState(null);

  const handleNavigateDrill = (fwId) => {
    setHighlightedFw(fwId);
    setTab("drill");
  };

  const handleNavigateLibrary = (fwId) => {
    setHighlightedFw(fwId);
    setTab("library");
  };

  const TABS = [
    { key: "library", label: "Framework Library" },
    { key: "drill", label: "Flash Drill" },
    { key: "guide", label: "Application Guide" },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--line-1)",
          marginBottom: 24,
        }}
      >
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

      {tab === "library" && (
        <LibraryTab onNavigateDrill={handleNavigateDrill} />
      )}
      {tab === "drill" && (
        <FlashDrillTab highlightedFw={highlightedFw} />
      )}
      {tab === "guide" && (
        <ApplicationGuideTab onNavigateLibrary={handleNavigateLibrary} />
      )}
    </div>
  );
}
