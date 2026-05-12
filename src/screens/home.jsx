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

// ─── PDF.js loader (CDN, no npm needed) ──────────────────────────────────────
const loadPdfJs = () =>
  new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js from CDN"));
    document.head.appendChild(script);
  });

// Resize a dataUrl image and return base64 (no data: prefix) for Claude
const resizeToBase64 = (dataUrl, maxWidth = 800) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82).split(",")[1]);
    };
    img.src = dataUrl;
  });

// ─── Case card visual config ──────────────────────────────────────────────────
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

// ─── CaseCard ─────────────────────────────────────────────────────────────────
const CaseCard = ({ caseData, source, dateAdded, onStart, onDelete }) => {
  const badge = SOURCE_BADGE[source];
  return (
    <article className="card" style={{ padding: 0, overflow: "hidden", flexShrink: 0 }}>
      <div style={{
        height: 120, borderBottom: "1px solid var(--line-1)",
        background: HEADER_GRADIENTS[source], position: "relative",
        padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge accent">{caseData.type}</span>
          <span className="badge">{caseData.industry}</span>
          <span className="badge">{caseData.format || "McKinsey-style"}</span>
          {badge && (
            <span className="badge" style={{ marginLeft: "auto", background: `${badge.color}22`, color: badge.color, border: `1px solid ${badge.color}55` }}>
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
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 4 }}>{caseData.title}</div>
        <div style={{ color: "var(--text-3)", fontSize: 12, fontFamily: "var(--font-mono)", marginBottom: 14 }}>{caseData.client}</div>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px", textWrap: "pretty" }}>{caseData.prompt}</p>
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
              <button className="btn btn-ghost btn-sm" onClick={onDelete} title="Remove case"><Icon name="x" size={11} /></button>
            )}
            <button className="btn btn-primary" onClick={() => onStart(caseData)}>
              <Icon name="play" size={11} /> Start Case
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line-1)", background: "var(--bg-0)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
        <span>{source === "curated" ? "Curated case · real India F&B scenario" : source === "ai" ? "AI-generated case" : "Custom case"}</span>
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

// ─── Add Case Modal ───────────────────────────────────────────────────────────
const CASE_SCHEMA = `{"id":"custom_ID","title":"Company — Problem","client":"one sentence","type":"case type e.g. Profitability","industry":"industry","region":"region","difficulty":3,"estimated_minutes":30,"format":"McKinsey-style","prompt":"2-3 sentence prompt for interviewee","context":"1-2 sentence interviewer background","tags":["tag1","tag2"],"data_packets":{"packet_1":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks X"},"packet_2":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks Y"},"packet_3":{"label":"short label","content":"data under 60 words","release_trigger":"when candidate asks Z"}},"ideal_structure":{"bucket_1":{"label":"label","sub_buckets":["sub1","sub2"]},"bucket_2":{"label":"label","sub_buckets":["sub1","sub2"]},"bucket_3":{"label":"label","sub_buckets":["sub1","sub2"]}},"hidden_answer_brief":"root cause and recommendation under 80 words","key_insights":["insight1","insight2"],"common_mistakes":["mistake1","mistake2"]}`;

const AddCaseModal = ({ onClose, onAdd }) => {
  const [tab, setTab] = React.useState("paste");

  // Text / file tab state
  const [pasteText, setPasteText] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [fileText, setFileText] = React.useState("");
  const [textDragging, setTextDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);

  // PDF / images tab state
  const [pdfPages, setPdfPages] = React.useState([]);   // { pageNum, dataUrl, selected, name? }
  const [loadingPdf, setLoadingPdf] = React.useState(false);
  const [pdfLoadProgress, setPdfLoadProgress] = React.useState(0);
  const [pdfDragging, setPdfDragging] = React.useState(false);
  const pdfInputRef = React.useRef(null);

  // Shared state
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState(null);
  const [processedCase, setProcessedCase] = React.useState(null);
  const [genTick, setGenTick] = React.useState(0);

  React.useEffect(() => {
    if (!processing && !loadingPdf) return;
    const id = setInterval(() => setGenTick((t) => (t + 1) % 4), 350);
    return () => clearInterval(id);
  }, [processing, loadingPdf]);

  // ── text / file helpers ──────────────────────────────────────────────────
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
    setProcessing(true); setProcessError(null); setProcessedCase(null);
    try {
      const res = await anthropic.messages.create({
        model: "claude-sonnet-4-6", max_tokens: 8000,
        messages: [{ role: "user", content: `Extract a consulting case interview from the text below and return ONLY a JSON object — no markdown fences, no explanation.

Schema (data_packet content ≤60 words, hidden_answer_brief ≤80 words):
${CASE_SCHEMA}

Text:
${rawText.slice(0, 8000)}` }],
      });
      const text = res.content[0].text;
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      if (s === -1 || e === -1) throw new Error("No JSON found in response.");
      setProcessedCase(JSON.parse(text.slice(s, e + 1)));
    } catch (err) { setProcessError(err.message || "Processing failed."); }
    finally { setProcessing(false); }
  };

  // ── PDF / image helpers ──────────────────────────────────────────────────
  const handlePdfOrImages = async (fileList) => {
    if (!fileList || !fileList.length) return;
    setProcessError(null);
    setProcessedCase(null);
    const first = fileList[0];
    if (first.type === "application/pdf") {
      await handlePdfFile(first);
    } else {
      await handleImageFiles(Array.from(fileList));
    }
  };

  const handlePdfFile = async (f) => {
    setLoadingPdf(true); setPdfLoadProgress(0); setPdfPages([]);
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const limit = Math.min(pdf.numPages, 15);
      const pages = [];
      for (let i = 1; i <= limit; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        pages.push({ pageNum: i, dataUrl: canvas.toDataURL("image/jpeg", 0.85), selected: i <= 10 });
        setPdfLoadProgress(Math.round((i / limit) * 100));
      }
      setPdfPages(pages);
    } catch (err) {
      setProcessError("PDF render failed: " + err.message);
    } finally { setLoadingPdf(false); }
  };

  const handleImageFiles = async (files) => {
    setPdfPages([]);
    const pages = [];
    for (const f of files) {
      const dataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.readAsDataURL(f);
      });
      pages.push({ pageNum: pages.length + 1, dataUrl, selected: true, name: f.name });
    }
    setPdfPages(pages);
  };

  const handleProcessPdf = async () => {
    const selected = pdfPages.filter((p) => p.selected);
    if (!selected.length) return;
    if (selected.length > 10) {
      setProcessError("Select at most 10 pages to keep processing fast.");
      return;
    }
    setProcessing(true); setProcessError(null); setProcessedCase(null);
    try {
      const imageBlocks = await Promise.all(
        selected.map(async (page) => ({
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: await resizeToBase64(page.dataUrl) },
        }))
      );
      const res = await anthropic.messages.create({
        model: "claude-sonnet-4-6", max_tokens: 8000,
        messages: [{
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: `These are ${selected.length} page(s) from a consulting case interview document. Extract and structure this as a case. Return ONLY a JSON object — no markdown, no explanation.

Key instruction: for data_packets, extract the actual numbers, percentages, and values you can read from any charts, graphs, or tables in the images — do not make them up.

Schema (data_packet content ≤60 words, hidden_answer_brief ≤80 words):
${CASE_SCHEMA}`,
            },
          ],
        }],
      });
      const text = res.content[0].text;
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      if (s === -1 || e === -1) throw new Error("No JSON found in response.");
      setProcessedCase(JSON.parse(text.slice(s, e + 1)));
    } catch (err) { setProcessError(err.message || "Processing failed."); }
    finally { setProcessing(false); }
  };

  // ── shared: save & add ───────────────────────────────────────────────────
  const handleAdd = () => {
    if (!processedCase) return;
    const entry = {
      name: processedCase.title, type: processedCase.type,
      time: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      timestamp: Date.now(), caseObj: processedCase,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("customCases") || "[]");
      localStorage.setItem("customCases", JSON.stringify([entry, ...existing]));
    } catch {}
    onAdd(entry);
    onClose();
  };

  const selectedCount = pdfPages.filter((p) => p.selected).length;
  const canExtract = tab === "pdf"
    ? selectedCount > 0 && !loadingPdf
    : tab === "paste" ? pasteText.trim().length > 0 : fileText.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 560 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Add Custom Case</div>
            <div style={{ color: "var(--text-3)", fontSize: 11.5, fontFamily: "var(--font-mono)", marginTop: 2 }}>
              Claude extracts and structures the case for you
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line-1)" }}>
          {[
            { key: "paste",  label: "Paste text" },
            { key: "upload", label: "Upload .txt" },
            { key: "pdf",    label: "PDF / Images" },
          ].map((t) => (
            <button key={t.key} className={"modal-tab" + (tab === t.key ? " active" : "")}
              onClick={() => { setTab(t.key); setProcessedCase(null); setProcessError(null); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: 20, overflowY: "auto", maxHeight: "calc(100vh - 260px)" }}>

          {/* ── Paste tab ── */}
          {tab === "paste" && (
            <textarea
              className="input"
              style={{ width: "100%", height: 180, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, boxSizing: "border-box" }}
              placeholder="Paste any case description, article, or case text here…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
          )}

          {/* ── Upload .txt tab ── */}
          {tab === "upload" && (
            <div
              className={"file-drop" + (textDragging ? " dragging" : "")}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setTextDragging(true); }}
              onDragLeave={() => setTextDragging(false)}
              onDrop={(e) => { e.preventDefault(); setTextDragging(false); handleFileChange(e.dataTransfer.files[0]); }}
            >
              <input ref={fileInputRef} type="file" accept=".txt,.md,.text" style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])} />
              {file ? (
                <>
                  <Icon name="book" size={20} style={{ color: "var(--accent)" }} />
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    {fileText.length.toLocaleString()} chars · ~{Math.round(fileText.length / 5)} words
                  </div>
                </>
              ) : (
                <>
                  <Icon name="paperclip" size={20} style={{ color: "var(--text-3)" }} />
                  <div style={{ color: "var(--text-2)" }}>Drop a file or click to browse</div>
                  <div style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>Supports .txt · .md</div>
                </>
              )}
            </div>
          )}

          {/* ── PDF / Images tab ── */}
          {tab === "pdf" && (
            <>
              {pdfPages.length === 0 && !loadingPdf ? (
                /* Drop zone */
                <div
                  className={"file-drop" + (pdfDragging ? " dragging" : "")}
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setPdfDragging(true); }}
                  onDragLeave={() => setPdfDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setPdfDragging(false); handlePdfOrImages(e.dataTransfer.files); }}
                >
                  <input ref={pdfInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/jpg"
                    multiple style={{ display: "none" }}
                    onChange={(e) => handlePdfOrImages(e.target.files)} />
                  <Icon name="paperclip" size={20} style={{ color: "var(--text-3)" }} />
                  <div style={{ color: "var(--text-2)", fontWeight: 500 }}>Drop a PDF or images here</div>
                  <div style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>
                    PDF · JPG · PNG · multi-select images for slide decks
                  </div>
                </div>
              ) : loadingPdf ? (
                /* Loading progress */
                <div style={{ padding: "28px 0" }}>
                  <div style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 10, textAlign: "center" }}>
                    Rendering pages{".".repeat(genTick + 1)}
                  </div>
                  <div style={{ height: 4, background: "var(--bg-0)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pdfLoadProgress}%`, background: "var(--accent)", transition: "width 0.2s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)", marginTop: 6, textAlign: "center" }}>{pdfLoadProgress}%</div>
                </div>
              ) : (
                /* Thumbnail grid */
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                      {selectedCount} / {pdfPages.length} selected
                      {selectedCount > 10 && <span style={{ color: "var(--warn)", marginLeft: 8 }}>⚠ max 10 recommended</span>}
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPdfPages((p) => p.map((pg) => ({ ...pg, selected: true })))}>All</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPdfPages((p) => p.map((pg) => ({ ...pg, selected: false })))}>None</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setPdfPages([]); setProcessedCase(null); setProcessError(null); }}>Clear</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                    {pdfPages.map((page, i) => (
                      <div key={i}
                        onClick={() => setPdfPages((prev) => prev.map((p, j) => j === i ? { ...p, selected: !p.selected } : p))}
                        style={{
                          position: "relative", cursor: "pointer", borderRadius: 4, overflow: "hidden",
                          border: page.selected ? "2px solid var(--accent)" : "2px solid var(--line-1)",
                          transition: "border-color 0.1s",
                        }}
                      >
                        <img src={page.dataUrl} alt={`p${page.pageNum}`} style={{ width: "100%", display: "block" }} />
                        {page.selected && (
                          <div style={{ position: "absolute", top: 3, right: 3, width: 16, height: 16, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="check" size={9} style={{ color: "#fff" }} />
                          </div>
                        )}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 9, fontFamily: "var(--font-mono)", textAlign: "center", padding: "2px 0" }}>
                          {page.name ? page.name.slice(0, 10) : `P${page.pageNum}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Shared result / error block */}
          {(processing || processError || processedCase) && (
            <div style={{ marginTop: 14, border: "1px solid var(--line-1)", borderRadius: "var(--r-md)", padding: 12, background: "var(--bg-0)", fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.7 }}>
              {processing ? (
                <span style={{ color: "var(--text-3)" }}>
                  {tab === "pdf" ? "Reading exhibits" : "Extracting case"}{".".repeat(genTick + 1)}<span className="pulse">▍</span>
                </span>
              ) : processError ? (
                <span style={{ color: "var(--danger)" }}>Error: {processError}</span>
              ) : processedCase ? (
                <>
                  <span style={{ color: "var(--good)" }}>✓ Case extracted</span><br />
                  <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{processedCase.title}</span><br />
                  <span style={{ color: "var(--text-2)" }}>{processedCase.prompt?.slice(0, 110)}{processedCase.prompt?.length > 110 ? "…" : ""}</span>
                </>
              ) : null}
            </div>
          )}

          {/* Action row */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {processedCase ? (
              <>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleAdd}>
                  <Icon name="check" size={12} /> Add to Library
                </button>
                <button className="btn" onClick={() => { setProcessedCase(null); setProcessError(null); }}>Re-process</button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={tab === "pdf" ? handleProcessPdf : handleProcess}
                disabled={processing || !canExtract}
              >
                <Icon name="sparkles" size={12} />
                {processing ? "Extracting…" : tab === "pdf" ? `Extract from ${selectedCount || "0"} page${selectedCount !== 1 ? "s" : ""}` : "Extract Case"}
              </button>
            )}
            <button className="btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────
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
  const avgScore = history.length ? (history.reduce((s, h) => s + h.overall, 0) / history.length).toFixed(1) : "—";
  const streak = computeStreak(history);

  const weakestDim = React.useMemo(() => {
    if (!history.length) return null;
    const dims = ["structure", "hypothesis", "quantitative", "communication"];
    const avgs = dims.map((d) => ({ label: d.charAt(0).toUpperCase() + d.slice(1), avg: history.reduce((s, h) => s + h.scores[d], 0) / history.length }));
    return avgs.sort((a, b) => a.avg - b.avg)[0];
  }, [history]);

  React.useEffect(() => {
    if (!generating) return;
    const id = setInterval(() => setGenTick((t) => (t + 1) % 4), 350);
    return () => clearInterval(id);
  }, [generating]);

  const handleGenerate = async () => {
    setGenerating(true); setGenError(null); setGeneratedCase(null);
    const diffNum = { "Easy (2/5)": 2, "Medium (3/5)": 3, "Hard (4/5)": 4, "Partner (5/5)": 5 }[difficulty] || 4;
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6", max_tokens: 8000,
        messages: [{ role: "user", content: `Generate a consulting case interview. Return ONLY a JSON object — no markdown fences, no explanation.

Parameters: type=${type}, industry=${industry}, region=${region}, difficulty=${diffNum}/5, constraints=${constraints || "none"}

Schema (data_packet content ≤60 words, hidden_answer_brief ≤80 words):
${CASE_SCHEMA}` }],
      });
      const text = response.content[0].text;
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      if (s === -1 || e === -1) throw new Error("No JSON found in response.");
      const parsed = JSON.parse(text.slice(s, e + 1));
      setGeneratedCase(parsed);
      setRecentGenerations((prev) => {
        const updated = [{ name: parsed.title, type: parsed.type, time: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }), timestamp: Date.now(), caseObj: parsed }, ...prev.slice(0, 9)];
        try { localStorage.setItem("generatedCases", JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch (err) { setGenError(err.message || "Generation failed. Check your API key."); }
    finally { setGenerating(false); }
  };

  const handleDeleteCustom = (timestamp) => {
    setCustomCases((prev) => {
      const updated = prev.filter((c) => c.timestamp !== timestamp);
      try { localStorage.setItem("customCases", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleAddCase = (entry) => setCustomCases((prev) => [entry, ...prev]);

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
        {[
          { label: "Cases completed", value: casesCompleted || 0, delta: casesCompleted > 0 ? `${casesCompleted} total` : "Start your first case" },
          { label: "Avg score", value: avgScore, suffix: avgScore !== "—" ? "/5" : "", delta: history.length >= 2 ? `last ${Math.min(history.length, 5)} cases` : "no data yet" },
          { label: "Streak", value: streak, icon: "flame", delta: streak > 0 ? `day${streak !== 1 ? "s" : ""} active` : "start today" },
          { label: "Weakest dimension", value: weakestDim ? weakestDim.label : "—", valueSize: 18, delta: weakestDim ? `${weakestDim.avg.toFixed(1)} avg · focus area` : "complete a case first" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 14 }}>
            <div className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={s.valueSize ? { fontSize: s.valueSize } : {}}>
                {s.value}
                {s.suffix && <span style={{ color: "var(--text-4)", fontSize: 14, marginLeft: 2 }}>{s.suffix}</span>}
                {s.icon && <Icon name={s.icon} size={16} style={{ color: "var(--warn)", marginLeft: 6 }} />}
              </div>
              <div className="stat-delta">{s.delta}</div>
            </div>
          </div>
        ))}
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
                <span>Generate a case on the right, or add your own — paste text, upload a file, or drop in a PDF.</span>
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
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", border: "1px solid var(--accent-line)" }}>
                <Icon name="sparkles" size={14} />
              </div>
              <div>
                <div style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>Bespoke case generator</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>Tunable along five dimensions · ~6s</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[
                { label: "Type", value: type, set: setType, opts: ["Profitability","Market Entry","M&A","Growth Strategy","Operations","Pricing"] },
                { label: "Industry", value: industry, set: setIndustry, opts: ["Tech / SaaS","Consumer / F&B","Healthcare","Financial Services","Industrials","Energy & Utilities"] },
                { label: "Region", value: region, set: setRegion, opts: ["North America","EMEA","APAC","LATAM","India"] },
                { label: "Difficulty", value: difficulty, set: setDifficulty, opts: ["Easy (2/5)","Medium (3/5)","Hard (4/5)","Partner (5/5)"] },
              ].map((f) => (
                <div key={f.label} className="field">
                  <label className="field-label">{f.label}</label>
                  <select className="select" value={f.value} onChange={(e) => f.set(e.target.value)}>
                    {f.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">Optional constraints</label>
              <input className="input" placeholder="e.g. focus on unit economics, exclude pricing levers…" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
            </div>

            <div style={{ border: "1px solid var(--line-1)", borderRadius: "var(--r-md)", padding: 12, background: "var(--bg-0)", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 16, minHeight: 78 }}>
              {generating ? (
                <><span style={{ color: "var(--text-4)" }}>// generating…</span><br /><span style={{ color: "var(--accent)" }}>drafting{".".repeat(genTick + 1)}<span className="pulse">▍</span></span></>
              ) : generatedCase ? (
                <><span style={{ color: "var(--good)" }}>// generated ✓</span><br /><span style={{ color: "var(--text-1)", fontWeight: 600 }}>{generatedCase.title}</span><br /><span style={{ color: "var(--text-2)" }}>{generatedCase.prompt?.slice(0, 120)}{generatedCase.prompt?.length > 120 ? "…" : ""}</span></>
              ) : genError ? (
                <><span style={{ color: "var(--danger)" }}>// error</span><br /><span style={{ color: "var(--danger)", opacity: 0.8 }}>{genError}</span></>
              ) : (
                <><span style={{ color: "var(--text-4)" }}>// preview brief</span><br /><span style={{ color: "var(--text-2)" }}>{type}</span> case · <span style={{ color: "var(--text-2)" }}>{industry}</span> · <span style={{ color: "var(--text-2)" }}>{region}</span><br /><span>ready · est. <span style={{ color: "var(--text-1)" }}>32 min</span> · prompt-style: open</span></>
              )}
            </div>

            {generatedCase ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "11px 14px", fontSize: 13 }} onClick={() => onStart(generatedCase)}>
                  <Icon name="play" size={13} /> Start This Case
                </button>
                <button className="btn" style={{ padding: "11px 14px", fontSize: 13 }} onClick={() => { setGeneratedCase(null); setGenError(null); }}>New</button>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px 14px", fontSize: 13 }} onClick={handleGenerate} disabled={generating}>
                <Icon name="sparkles" size={13} />
                {generating ? "Generating…" : "Generate Case"}
              </button>
            )}

            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>
              <span>Powered by Claude Sonnet</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="command" size={10} /> Press <span className="kbd-inline">⌘↵</span></span>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && <AddCaseModal onClose={() => setShowAddModal(false)} onAdd={handleAddCase} />}
    </div>
  );
};
