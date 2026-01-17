import React, { useState } from "react";
import "../css/AssetSelector.css";

export default function AssetSelector({ onSelect }) {
  const [mode, setMode] = useState("preset");
  const [customValue, setCustomValue] = useState("");

  const PREMADE_ASSETS = [
    "tree",
    "monkey",
    "house",
    "cacti",
    "charriot",
    "grass",
    "oasis",
    "weather",
    "wolf",
  ];

  const handleConfirm = () => {
    if (!customValue.trim()) return;
    onSelect(customValue.trim().toLowerCase());
  };

  return (
    <div className="asset-selector">
      <div className="asset-selector-modes">
        <button onClick={() => setMode("preset")}>Choose Premade</button>
        <button onClick={() => setMode("manual")}>Manual Entry</button>
        <button onClick={() => setMode("generate")}>Generate Asset</button>
      </div>

      {mode === "preset" && (
        <select onChange={(e) => onSelect(e.target.value)}>
          <option value="">Select an asset…</option>
          {PREMADE_ASSETS.map((a) => (
            <option key={a} value={a}>
              {a[0].toUpperCase() + a.slice(1)}
            </option>
          ))}
        </select>
      )}

      {mode === "manual" && (
        <div className="asset-manual-row">
          <input
            type="text"
            placeholder="Enter asset name"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
          <button onClick={handleConfirm}>Use</button>
        </div>
      )}

      {mode === "generate" && (
        <div className="asset-manual-row">
          <input
            type="text"
            placeholder="Generate: enter thing"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
          <button onClick={handleConfirm}>Generate</button>
        </div>
      )}
    </div>
  );
}
