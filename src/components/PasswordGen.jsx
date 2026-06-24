import { useState, useEffect, useCallback } from "react";
import { WORD_LIST } from "../utils/words";



export default function PasswordGen({ inlineMode = false, onSelectPassword, onGenerate, onCopyPassword }) {
  // Config States
  const [genMode, setGenMode] = useState("random"); // 'random' | 'passphrase' | 'pin'
  const [length, setLength] = useState(16); // length for random string (8-64) or PIN (4-16)
  
  // Random Mode Options
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);

  // Passphrase Mode Options
  const [passphraseWordCount, setPassphraseWordCount] = useState(4); // (3-10)
  const [passphraseSeparator, setPassphraseSeparator] = useState("-"); // '-', '_', '.', ' ', '', etc.
  const [passphraseCapitalize, setPassphraseCapitalize] = useState(true);
  const [passphraseIncludeDigitSymbol, setPassphraseIncludeDigitSymbol] = useState(true);

  // Output State
  const [generated, setGenerated] = useState("");

  // Helper: Secure Random array generation
  const getSecureRandomInt = (max) => {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return randomArray[0] % max;
  };

  // Helper: Cryptographically secure shuffle (Fisher-Yates)
  const secureShuffle = (arr) => {
    const result = [...arr];
    const len = result.length;
    if (len <= 1) return result;

    const randomValues = new Uint32Array(len);
    window.crypto.getRandomValues(randomValues);

    for (let i = len - 1; i > 0; i--) {
      const j = randomValues[i] % (i + 1);
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  };

  // Core Password Generator logic
  const generate = useCallback(() => {
    let result = "";

    if (genMode === "random") {
      let uppercasePool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let lowercasePool = "abcdefghijklmnopqrstuvwxyz";
      let numbersPool = "0123456789";
      let symbolsPool = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      if (avoidAmbiguous) {
        // Exclude I, l, 1, O, 0, o, S, 5, Z, 2, B, 8, |, !
        uppercasePool = "ABCDEFGHJKLMNPQRTVWXY";
        lowercasePool = "abcdefghijkmnpqrtuwxyz";
        numbersPool = "34679";
        symbolsPool = "@#$%^&*()_+-=[]{};:,.<>?";
      }

      const activePools = [];
      if (uppercase) activePools.push(uppercasePool);
      if (lowercase) activePools.push(lowercasePool);
      if (numbers) activePools.push(numbersPool);
      if (symbols) activePools.push(symbolsPool);

      if (activePools.length === 0) {
        setTimeout(() => {
          setGenerated("");
          if (onGenerate) onGenerate("");
        }, 0);
        return;
      }

      const guaranteedChars = [];
      const combinedPool = activePools.join("");

      // 1. Put one guaranteed character from each checked pool
      activePools.forEach((pool) => {
        guaranteedChars.push(pool.charAt(getSecureRandomInt(pool.length)));
      });

      // 2. Fill the remaining spots with characters from the combined pool
      const remainingLength = Math.max(0, length - guaranteedChars.length);
      const randomIndices = new Uint32Array(remainingLength);
      window.crypto.getRandomValues(randomIndices);

      for (let i = 0; i < remainingLength; i++) {
        guaranteedChars.push(combinedPool.charAt(randomIndices[i] % combinedPool.length));
      }

      // 3. Securely shuffle the elements so guaranteed characters are not always at the beginning
      result = secureShuffle(guaranteedChars).join("");

    } else if (genMode === "passphrase") {
      if (!WORD_LIST || WORD_LIST.length === 0) {
        setTimeout(() => {
          setGenerated("");
          if (onGenerate) onGenerate("");
        }, 0);
        return;
      }

      const selectedWords = [];
      for (let i = 0; i < passphraseWordCount; i++) {
        let word = WORD_LIST[getSecureRandomInt(WORD_LIST.length)];
        if (passphraseCapitalize) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        selectedWords.push(word);
      }

      result = selectedWords.join(passphraseSeparator);

      if (passphraseIncludeDigitSymbol) {
        const digit = getSecureRandomInt(10);
        // Small pool of safe, common symbols that won't break systems easily
        const safeSymbols = ["#", "$", "%", "&", "*", "?", "!"];
        const symbol = safeSymbols[getSecureRandomInt(safeSymbols.length)];
        
        result += passphraseSeparator + digit + symbol;
      }

    } else if (genMode === "pin") {
      const pinLength = length;
      const digits = new Uint32Array(pinLength);
      window.crypto.getRandomValues(digits);
      
      const pinChars = [];
      for (let i = 0; i < pinLength; i++) {
        pinChars.push(digits[i] % 10);
      }
      result = pinChars.join("");
    }

    // Wrap set state in setTimeout to comply with react-hooks/set-state-in-effect
    setTimeout(() => {
      setGenerated(result);
      if (onGenerate) {
        onGenerate(result);
      }
    }, 0);
  }, [
    genMode,
    length,
    uppercase,
    lowercase,
    numbers,
    symbols,
    avoidAmbiguous,
    passphraseWordCount,
    passphraseSeparator,
    passphraseCapitalize,
    passphraseIncludeDigitSymbol,
    onGenerate
  ]);

  // Generate on configuration changes
  useEffect(() => {
    generate();
  }, [generate]);

  // Calculate Shannon Entropy
  const calculateEntropy = () => {
    if (generated.length === 0) return 0;

    if (genMode === "random") {
      let poolSize = 0;
      if (uppercase) poolSize += avoidAmbiguous ? 21 : 26;
      if (lowercase) poolSize += avoidAmbiguous ? 22 : 26;
      if (numbers) poolSize += avoidAmbiguous ? 5 : 10;
      if (symbols) poolSize += avoidAmbiguous ? 24 : 27;

      if (poolSize === 0) return 0;
      const entropy = length * Math.log2(poolSize);
      return Math.round(entropy);

    } else if (genMode === "passphrase") {
      const wordCount = passphraseWordCount;
      const dictSize = WORD_LIST.length;
      
      let entropy = wordCount * Math.log2(dictSize);
      if (passphraseIncludeDigitSymbol) {
        // 10 digits (log2(10) ~ 3.32) + 7 safe symbols (log2(7) ~ 2.8)
        entropy += Math.log2(10) + Math.log2(7);
      }
      return Math.round(entropy);

    } else if (genMode === "pin") {
      // 10 possible values (0-9) per digit
      const entropy = length * Math.log2(10);
      return Math.round(entropy);
    }
    return 0;
  };

  const entropy = calculateEntropy();

  // Get Entropy Ratings & Time Estimates
  const getEntropyDetails = () => {
    if (entropy === 0) return { text: "No Entropy", class: "weak", color: "#ef4444", percent: 0 };
    if (entropy < 50) return { text: "Weak - Easily Crackable", class: "weak", color: "#ef4444", percent: 25 };
    if (entropy < 80) return { text: "Moderate - Safe", class: "medium", color: "#f59e0b", percent: 55 };
    if (entropy < 110) return { text: "Strong - Secure (Military Grade)", class: "strong", color: "#10b981", percent: 85 };
    return { text: "Unbreakable (Insane Security)", class: "strong", color: "#00f2fe", percent: 100 };
  };

  const entropyDetails = getEntropyDetails();

  // Formats time-to-crack estimates (guesses per second)
  const formatTime = (seconds) => {
    if (seconds < 1) return "Instantaneous";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} hours`;
    
    const days = hours / 24;
    if (days < 365) return `${Math.round(days)} days`;
    
    const years = days / 365;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1e6) return `${Math.round(years / 1000)} centuries`;
    if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
    if (years < 1e12) return `${Math.round(years / 1e9)} billion years`;
    return "Trillions of years";
  };

  const getCrackTimes = () => {
    if (entropy === 0) return { online: "N/A", offline: "N/A" };

    const totalGuesses = Math.pow(2, entropy);
    
    // Online rate-limited (e.g. 100 requests/sec)
    const onlineCrackSec = totalGuesses / 100;
    // Offline high-performance brute force (e.g. 100 billion hashes/sec on custom GPU cluster)
    const offlineCrackSec = totalGuesses / 1e11;

    return {
      online: formatTime(onlineCrackSec),
      offline: formatTime(offlineCrackSec)
    };
  };

  const crackTimes = getCrackTimes();




  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      
      {/* Mode Tabs */}
      <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.2rem", border: "1px solid var(--border-glass)" }}>
        <button
          type="button"
          onClick={() => {
            setGenMode("random");
            setLength(16);
          }}
          style={{
            flex: 1,
            background: genMode === "random" ? "var(--primary-grad)" : "transparent",
            color: genMode === "random" ? "white" : "var(--text-secondary)",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🔀 Random
        </button>
        <button
          type="button"
          onClick={() => {
            setGenMode("passphrase");
          }}
          style={{
            flex: 1,
            background: genMode === "passphrase" ? "var(--primary-grad)" : "transparent",
            color: genMode === "passphrase" ? "white" : "var(--text-secondary)",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          📖 Passphrase
        </button>
        <button
          type="button"
          onClick={() => {
            setGenMode("pin");
            setLength(6);
          }}
          style={{
            flex: 1,
            background: genMode === "pin" ? "var(--primary-grad)" : "transparent",
            color: genMode === "pin" ? "white" : "var(--text-secondary)",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🔢 PIN
        </button>
      </div>

      {/* Generated Output Display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: generated.length > 28 ? "0.95rem" : "1.15rem",
            background: "rgba(0,0,0,0.45)",
            border: "1px solid var(--border-glass)",
            padding: "0.8rem 1.2rem",
            borderRadius: "10px",
            wordBreak: "break-all",
            minHeight: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00f2fe",
            textShadow: "0 0 10px rgba(0, 242, 254, 0.35)",
            textAlign: "center",
            letterSpacing: "0.05em",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
          }}
        >
          {generated || "Configure options..."}
        </div>

        {/* Copy and Regenerate Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flexGrow: 1 }}
            onClick={generate}
          >
            🔄 Regenerate
          </button>

          {generated && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flexGrow: 1 }}
              onClick={() => {
                if (onCopyPassword) {
                  onCopyPassword(generated);
                } else {
                  navigator.clipboard.writeText(generated);
                }
              }}
            >
              📋 Copy
            </button>
          )}
        </div>
      </div>

      {/* Visual Strength Indicator */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          <span>Security Strength Score</span>
          <span style={{ color: entropyDetails.color, fontWeight: "700" }}>{entropy} Bits ({entropyDetails.text})</span>
        </div>
        <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${entropyDetails.percent}%`,
              background: entropyDetails.color,
              boxShadow: `0 0 10px ${entropyDetails.color}cc`,
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        </div>
      </div>

      {/* Dynamic Health Stats Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          padding: "0.8rem 1rem",
          borderRadius: "10px",
          border: "1px solid var(--border-glass)",
          fontSize: "0.8rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-secondary)" }}>Online Hack Time (100 req/s):</span>
          <span style={{ fontWeight: "700", color: "#10b981" }}>{crackTimes.online}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-secondary)" }}>GPU Hash Crack Time (100B/s):</span>
          <span style={{ fontWeight: "700", color: entropy < 60 ? "#ef4444" : entropy < 80 ? "#f59e0b" : "#00f2fe" }}>
            {crackTimes.offline}
          </span>
        </div>
      </div>

      {/* Configuration Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        
        {/* LENGTH SLIDER (for Random and PIN modes) */}
        {genMode !== "passphrase" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
              <span>{genMode === "pin" ? "PIN Digit Count" : "Character Length"}</span>
              <span style={{ color: "white", fontWeight: "700" }}>{length} digits/chars</span>
            </div>
            <input
              type="range"
              min={genMode === "pin" ? "4" : "8"}
              max={genMode === "pin" ? "16" : "64"}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* RANDOM CONFIG CONTROLS */}
        {genMode === "random" && (
          <div className="generator-section" style={{ margin: 0, padding: "0.8rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
              Character Pool Rules
            </span>
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

            <div style={{ borderTop: "1px solid var(--border-glass)", margin: "0.6rem 0" }} />
            
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={avoidAmbiguous}
                onChange={(e) => setAvoidAmbiguous(e.target.checked)}
              />
              <span style={{ color: "var(--text-secondary)" }}>
                Avoid ambiguous characters (e.g. <code>1, l, I, 0, O</code>)
              </span>
            </label>
          </div>
        )}

        {/* PASSPHRASE CONFIG CONTROLS */}
        {genMode === "passphrase" && (
          <div className="generator-section" style={{ margin: 0, padding: "0.8rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                <span>Word Count</span>
                <span style={{ color: "white", fontWeight: "700" }}>{passphraseWordCount} words</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={passphraseWordCount}
                onChange={(e) => setPassphraseWordCount(parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                  Word Separator
                </label>
                <select
                  className="input-field"
                  style={{ padding: "0.4rem 0.6rem", fontSize: "0.82rem", height: "34px" }}
                  value={passphraseSeparator}
                  onChange={(e) => setPassphraseSeparator(e.target.value)}
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Period (.)</option>
                  <option value=" ">Space ( )</option>
                  <option value="/">Slash (/)</option>
                  <option value="">None (Empty)</option>
                </select>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem", justifyContent: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={passphraseCapitalize}
                    onChange={(e) => setPassphraseCapitalize(e.target.checked)}
                  />
                  <span>Capitalize words</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={passphraseIncludeDigitSymbol}
                    onChange={(e) => setPassphraseIncludeDigitSymbol(e.target.checked)}
                  />
                  <span>Add number+symbol</span>
                </label>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Select button to push generated string back (if in modal drawer) */}
      {inlineMode && generated && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.6rem", fontSize: "0.9rem", marginTop: "0.5rem" }}
          onClick={() => onSelectPassword(generated)}
        >
          ✓ Use This Password
        </button>
      )}

    </div>
  );
}
