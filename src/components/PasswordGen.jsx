import React, { useState, useEffect } from "react";

export default function PasswordGen({ inlineMode = false, onSelectPassword }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generated, setGenerated] = useState("");

  const generate = () => {
    let pool = "";
    if (uppercase) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) pool += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) pool += "0123456789";
    if (symbols) pool += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!pool) {
      setGenerated("");
      return;
    }

    let result = "";
    const poolLength = pool.length;
    // Secure random generation using window.crypto.getRandomValues
    const randomArray = new Uint32Array(length);
    window.crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
      result += pool.charAt(randomArray[i] % poolLength);
    }
    setGenerated(result);
  };

  // Generate on load or parameter changes
  useEffect(() => {
    generate();
  }, [length, uppercase, lowercase, numbers, symbols]);

  // Calculate Shannon Entropy
  const calculateEntropy = () => {
    let poolSize = 0;
    if (uppercase) poolSize += 26;
    if (lowercase) poolSize += 26;
    if (numbers) poolSize += 10;
    if (symbols) poolSize += 26; // approx symbols count

    if (poolSize === 0 || length === 0) return 0;
    
    // Entropy = length * log2(poolSize)
    const entropy = length * Math.log2(poolSize);
    return Math.round(entropy);
  };

  const entropy = calculateEntropy();

  const getEntropyDetails = () => {
    if (entropy === 0) return { text: "No Character Pool", class: "weak" };
    if (entropy < 50) return { text: "Weak - Guessable", class: "weak" };
    if (entropy < 80) return { text: "Moderate - Safe", class: "medium" };
    return { text: "Strong - Secure (Military Grade)", class: "strong" };
  };

  const entropyDetails = getEntropyDetails();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      
      {/* Generated Output Display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "1.1rem",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid var(--border-glass)",
            padding: "0.6rem 0.8rem",
            borderRadius: "8px",
            wordBreak: "break-all",
            minHeight: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00f2fe",
            textAlign: "center"
          }}
        >
          {generated || "Configure options..."}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: "0.4rem 1rem", fontSize: "0.82rem", alignSelf: "center" }}
          onClick={generate}
        >
          🔄 Regenerate
        </button>
      </div>

      {/* Entropy Health Metric */}
      <div style={{ background: "rgba(0,0,0,0.15)", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-glass)", fontSize: "0.82rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>Entropy:</span>
          <span style={{ fontWeight: "700" }}>{entropy} Bits</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-secondary)" }}>Rating:</span>
          <span style={{ fontWeight: "700" }} className={entropyDetails.class}>{entropyDetails.text}</span>
        </div>
      </div>

      {/* Length Slider */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
          <span>Password Length</span>
          <span style={{ color: "white", fontWeight: "700" }}>{length} Chars</span>
        </div>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value, 10))}
        />
      </div>

      {/* Checkboxes Grid */}
      <div className="generator-section" style={{ margin: 0, padding: "0.8rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Character Pool Rules</span>
        <div className="gen-options-grid">
          <label className="gen-option-row">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
            <span>Uppercase (A-Z)</span>
          </label>

          <label className="gen-option-row">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
            />
            <span>Lowercase (a-z)</span>
          </label>

          <label className="gen-option-row">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="gen-option-row">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
            />
            <span>Symbols (&^*)</span>
          </label>
        </div>
      </div>

      {/* Select button to push generated string back */}
      {inlineMode && generated && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.6rem", fontSize: "0.9rem" }}
          onClick={() => onSelectPassword(generated)}
        >
          ✓ Use This Password
        </button>
      )}

    </div>
  );
}
