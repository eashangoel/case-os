import React from "react";
import { Icon } from "./ui";

let _rowIdSeq = 10;
const newRowId = () => ++_rowIdSeq;

export const MathPad = ({ padRef }) => {
  const [hypothesis, setHypothesis] = React.useState("");
  const [rows, setRows] = React.useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);
  const [conclusion, setConclusion] = React.useState("");

  React.useEffect(() => {
    if (padRef) padRef.current = { hypothesis, rows, conclusion };
  });

  const addRow = () => setRows((rs) => [...rs, { id: newRowId(), text: "" }]);

  const updateRow = (id, text) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, text } : r)));

  const deleteRow = (id) => setRows((rs) => rs.filter((r) => r.id !== id));

  return (
    <div className="math-pad">
      <div className="math-hypothesis">
        <span className="math-hypothesis-label">H:</span>
        <textarea
          className="math-hypothesis-input"
          placeholder="State your hypothesis…"
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
        />
      </div>

      <div className="math-workspace">
        {rows.map((r, i) => (
          <div key={r.id} className="math-row">
            <span className="math-row-label">{i + 1}</span>
            <input
              className="math-row-input"
              placeholder="e.g. Revenue = 5 000 units × ₹120 = ₹600 000"
              value={r.text}
              onChange={(e) => updateRow(r.id, e.target.value)}
            />
            <button
              className="math-row-del"
              onClick={() => deleteRow(r.id)}
              title="Delete row"
            >
              ×
            </button>
          </div>
        ))}
        <button className="math-add-row" onClick={addRow}>
          <Icon name="plus" size={11} /> Add calculation row
        </button>
      </div>

      <div className="math-conclusion">
        <span className="math-conclusion-label">∴</span>
        <textarea
          className="math-conclusion-input"
          placeholder="Conclusion / so what…"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
        />
      </div>
    </div>
  );
};
