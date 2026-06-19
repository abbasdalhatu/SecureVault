import React, { useState, useEffect } from "react";
import logoImg from "../assets/logo.png";
import { generateRecoveryPhrase } from "../utils/words";

export default function AuthScreen({ isFirstTime, onUnlock, onSetup, onRecover, onResetPassword, onImport }) {
  // Master Password States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Setup Flow States
  const [setupStep, setSetupStep] = useState(1); // 1 = Define Password, 2 = Save Recovery Phrase
  const [recoveryWords, setRecoveryWords] = useState([]);
  const [wordsSavedConfirmed, setWordsSavedConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Unlock/Recover Flow States
  const [viewMode, setViewMode] = useState("unlock"); // 'unlock', 'recover', 'resetPassword'
  const [enteredWords, setEnteredWords] = useState(Array(10).fill(""));
  const [recoveredPassword, setRecoveredPassword] = useState("");

  // Initialize recovery words once on setup load
  useEffect(() => {
    if (isFirstTime && recoveryWords.length === 0) {
      setRecoveryWords(generateRecoveryPhrase());
    }
  }, [isFirstTime]);

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImport(data);
      } catch (err) {
        setError("Invalid file format. Please import a valid SecureVault export file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Simple password strength calculator
  const checkStrength = (val) => {
    if (!val) return { text: "None", score: 0, class: "" };
    
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 2) return { text: "Weak", score: 1, class: "weak" };
    if (score <= 4) return { text: "Medium", score: 2, class: "medium" };
    return { text: "Strong", score: 3, class: "strong" };
  };

  const strength = checkStrength(password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  // Setup Flow - Step 1: Password validation
  const handleSetupStep1Submit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Master password must be at least 8 characters long.");
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }

    setSetupStep(2);
  };

  // Setup Flow - Step 2: Finalize initialization
  const handleSetupStep2Submit = (e) => {
    e.preventDefault();
    setError("");

    if (!wordsSavedConfirmed) {
      setError("Please confirm that you have saved your recovery phrase.");
      triggerShake();
      return;
    }

    const phraseStr = recoveryWords.join(" ");
    onSetup(password, phraseStr);
  };

  // Normal Unlock Submit
  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onUnlock(password);
    } catch (err) {
      setError("Incorrect master password. Access denied.");
      triggerShake();
    }
  };

  // Word Paste Splitter logic for Recovery input
  const handleWordPaste = (e, index) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const words = pastedText.trim().toLowerCase().split(/\s+/);
    if (words.length > 0) {
      setEnteredWords(prev => {
        const copy = [...prev];
        for (let i = 0; i < words.length && (index + i) < 10; i++) {
          copy[index + i] = words[i];
        }
        return copy;
      });
    }
  };

  // Recover Submit: Check recovery words
  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phraseStr = enteredWords.map(w => w.trim().toLowerCase()).join(" ");
    const emptyCount = enteredWords.filter(w => !w.trim()).length;
    if (emptyCount > 0) {
      setError("Please fill in all 10 recovery words.");
      triggerShake();
      return;
    }

    try {
      const oldPass = await onRecover(phraseStr);
      setRecoveredPassword(oldPass);
      setViewMode("resetPassword");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Invalid recovery phrase. Verification failed.");
      triggerShake();
    }
  };

  // Password Reset Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Master password must be at least 8 characters long.");
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }

    try {
      const phraseStr = enteredWords.map(w => w.trim().toLowerCase()).join(" ");
      await onResetPassword(recoveredPassword, password, phraseStr);
    } catch (err) {
      setError(err.message || "Failed to reset master password.");
      triggerShake();
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryWords.join(" ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className={`glass-panel modal-content ${shake ? "shake" : ""}`} style={{ animation: "none", maxWidth: (setupStep === 2 || viewMode === "recover") ? "620px" : "520px" }}>
        
        <div className="vault-lock-container">
          <img src={logoImg} alt="SecureVault Logo" style={{ width: "90px", height: "90px", marginBottom: "1rem", borderRadius: "16px", boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }} />
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.2rem" }} className="gradient-text">
            {isFirstTime 
              ? (setupStep === 1 ? "Create Your Vault" : "Save Recovery Phrase") 
              : (viewMode === "unlock" ? "SecureVault Locked" : (viewMode === "recover" ? "Recover Your Vault" : "Reset Master Password"))}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", textAlign: "center" }}>
            {isFirstTime 
              ? (setupStep === 1 
                  ? "All passwords will be encrypted locally on this device using your Master Password." 
                  : "Write down these 10 words. If you forget your password, you will need them to recover your vault.")
              : (viewMode === "unlock" 
                  ? "Enter your Master Password to decrypt your credentials." 
                  : (viewMode === "recover"
                      ? "Enter your 10 recovery words in order to set a new password."
                      : "Choose a strong new Master Password to re-encrypt your vault."))}
          </p>
        </div>

        {error && (
          <div style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "0.8rem", borderRadius: "10px", marginBottom: "1.2rem", fontSize: "0.88rem" }}>
            ⚠️ {error}
          </div>
        )}

        {isFirstTime ? (
          // SETUP FLOW
          setupStep === 1 ? (
            // SETUP STEP 1: PASSWORD DEFINITION
            <form onSubmit={handleSetupStep1Submit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  Define Master Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field"
                    placeholder="Minimum 8 characters..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? "👁️" : "🙈"}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginTop: "0.4rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Strength:</span>
                      <span style={{ fontWeight: "700" }} className={strength.class}>{strength.text}</span>
                    </div>
                    <div className="strength-indicator">
                      <div className={`strength-bar ${strength.score >= 1 ? strength.class : ""}`}></div>
                      <div className={`strength-bar ${strength.score >= 2 ? strength.class : ""}`}></div>
                      <div className={`strength-bar ${strength.score >= 3 ? strength.class : ""}`}></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  Confirm Master Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field"
                  placeholder="Retype password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.8rem" }}>
                Next: Recovery Phrase
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Already have a backup from another device?</span>
                <div style={{ marginTop: "0.5rem" }}>
                  <label className="btn btn-secondary" style={{ display: "inline-flex", cursor: "pointer", gap: "0.5rem", fontSize: "0.85rem", margin: 0 }}>
                    📥 Import Existing Vault
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleImportFileChange}
                    />
                  </label>
                </div>
              </div>
            </form>
          ) : (
            // SETUP STEP 2: RECOVERY PHRASE DISPLAY
            <form onSubmit={handleSetupStep2Submit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "12px", padding: "1.2rem 1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>Your 10 Recovery Words:</span>
                  <button type="button" className="btn btn-secondary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem", borderRadius: "6px" }} onClick={handleCopyPhrase}>
                    {copied ? "✅ Copied" : "📋 Copy Phrase"}
                  </button>
                </div>

                {/* 10 Words Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.6rem" }}>
                  {recoveryWords.map((word, idx) => (
                    <div key={idx} style={{ background: "rgba(0, 0, 0, 0.25)", border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "0.5rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: "#8b5cf6", fontWeight: "700", fontSize: "0.8rem" }}>{idx + 1}.</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "#f1f5f9" }}>{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "10px", padding: "0.8rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                ⚠️ <strong>Write down these words</strong> on a physical sheet of paper and keep it in a safe place. If you forget your master password and lose these phrases, you will permanently lose access to your vault data.
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginTop: "0.3rem" }}>
                <input
                  type="checkbox"
                  id="confirm-saved"
                  checked={wordsSavedConfirmed}
                  onChange={(e) => setWordsSavedConfirmed(e.target.checked)}
                  style={{ marginTop: "3px" }}
                />
                <label htmlFor="confirm-saved" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
                  I have written down or saved my 10 recovery words in a secure place.
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: "0.8rem" }} onClick={() => setSetupStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: "0.8rem" }} disabled={!wordsSavedConfirmed}>
                  Initialize Secure Vault
                </button>
              </div>
            </form>
          )
        ) : (
          // UNLOCK / RECOVERY FLOW
          viewMode === "unlock" ? (
            // NORMAL UNLOCK SCREEN
            <form onSubmit={handleUnlockSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  Master Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter vault key..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.8rem" }}>
                Unlock Vault
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600", textDecoration: "underline" }}
                  onClick={() => {
                    setError("");
                    setEnteredWords(Array(10).fill(""));
                    setViewMode("recover");
                  }}
                >
                  Forgot Master Password? Recover Vault
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: "1rem", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Need to restore a different backup?</span>
                <div style={{ marginTop: "0.5rem" }}>
                  <label className="btn btn-secondary" style={{ display: "inline-flex", cursor: "pointer", gap: "0.5rem", fontSize: "0.85rem", margin: 0 }}>
                    📥 Import Vault Backup
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleImportFileChange}
                    />
                  </label>
                </div>
              </div>
            </form>
          ) : viewMode === "recover" ? (
            // RECOVERY PHRASE INPUT SCREEN
            <form onSubmit={handleRecoverySubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "12px", padding: "1.2rem 1rem" }}>
                <div style={{ marginBottom: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>Enter Your 10 Recovery Words:</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>💡 Paste phrase to split words automatically</span>
                </div>

                {/* 10 Words Inputs Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.8rem" }}>
                  {enteredWords.map((word, idx) => (
                    <div key={idx} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span style={{ position: "absolute", left: "10px", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "bold", zIndex: 1 }}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: "1.8rem", textTransform: "lowercase", fontSize: "0.88rem" }}
                        placeholder="word"
                        value={word}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z]/g, "");
                          setEnteredWords(prev => {
                            const copy = [...prev];
                            copy[idx] = val;
                            return copy;
                          });
                        }}
                        onPaste={(e) => handleWordPaste(e, idx)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.8rem" }}
                  onClick={() => {
                    setError("");
                    setViewMode("unlock");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: "0.8rem" }}>
                  Verify Recovery Words
                </button>
              </div>
            </form>
          ) : (
            // PASSWORD RESET SCREEN (AFTER SUCCESSFUL RECOVERY VERIFICATION)
            <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "0.8rem", fontSize: "0.85rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>✅ Recovery Phrase Verified. Please set a new master password to restore access to your vault data.</span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  New Master Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field"
                    placeholder="Minimum 8 characters..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? "👁️" : "🙈"}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginTop: "0.4rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Strength:</span>
                      <span style={{ fontWeight: "700" }} className={strength.class}>{strength.text}</span>
                    </div>
                    <div className="strength-indicator">
                      <div className={`strength-bar ${strength.score >= 1 ? strength.class : ""}`}></div>
                      <div className={`strength-bar ${strength.score >= 2 ? strength.class : ""}`}></div>
                      <div className={`strength-bar ${strength.score >= 3 ? strength.class : ""}`}></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  Confirm New Master Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field"
                  placeholder="Retype new password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.8rem" }}
                  onClick={() => {
                    setError("");
                    setViewMode("recover");
                  }}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: "0.8rem" }}>
                  Update Password & Unlock
                </button>
              </div>
            </form>
          )
        )}

      </div>
    </div>
  );
}

