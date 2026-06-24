import { useState } from "react";
import { verifyPin, unlockVault } from "../utils/crypto";

export default function SecurityPrompt({ onSuccess, onCancel, pinMessage, passwordMessage }) {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  
  const [mode, setMode] = useState("pin"); // 'pin' or 'password'
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [statusText, setStatusText] = useState("");
  const [shouldShake, setShouldShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!pin || isVerifying) return;

    setIsVerifying(true);
    setError(false);
    setStatus("idle");
    setStatusText("");

    try {
      const pinSalt = localStorage.getItem("securevault_pin_salt");
      const pinVerifierCipher = localStorage.getItem("securevault_pin_verifier_cipher");
      const pinVerifierIv = localStorage.getItem("securevault_pin_verifier_iv");

      if (!pinSalt || !pinVerifierCipher || !pinVerifierIv) {
        throw new Error("No PIN configured.");
      }

      const isValid = await verifyPin(pin, pinSalt, pinVerifierCipher, pinVerifierIv);
      if (isValid) {
        setStatus("success");
        setStatusText("Verified!");
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        throw new Error("Incorrect PIN");
      }
    } catch (err) {
      console.error("PIN verification failed:", err);
      setError(true);
      triggerShake();
      setStatus("error");
      setStatusText("Incorrect Security PIN");
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || isVerifying) return;

    setIsVerifying(true);
    setError(false);
    setStatus("idle");
    setStatusText("");

    try {
      const salt = localStorage.getItem("securevault_salt");
      const verifierCipher = localStorage.getItem("securevault_verifier_cipher");
      const verifierIv = localStorage.getItem("securevault_verifier_iv");

      if (!salt || !verifierCipher || !verifierIv) {
        throw new Error("No vault configuration found.");
      }

      // Verify the Master Password by unlocking
      await unlockVault(password, salt, verifierCipher, verifierIv);

      setStatus("success");
      setStatusText("Verified!");
      setTimeout(() => {
        onSuccess();
      }, 600);
    } catch (err) {
      console.error("Master password verification failed:", err);
      setError(true);
      triggerShake();
      setStatus("error");
      setStatusText("Incorrect Master Password");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="biometric-overlay">
      <div className={`biometric-card ${shouldShake ? "shake" : ""}`}>
        
        {/* Header */}
        <div className="biometric-header">
          <h2 className="gradient-text">🔒 Confirm Security</h2>
          <p>
            {mode === "pin" 
              ? (pinMessage || "Enter your Security PIN to reveal this credential.")
              : (passwordMessage || "Confirm your Master Password to reveal this credential.")
            }
          </p>
        </div>

        {/* Status Text Indicator */}
        {statusText && (
          <div className={`biometric-status-text ${status}`} style={{ marginBottom: "1rem" }}>
            {statusText}
          </div>
        )}

        {mode === "pin" ? (
          <div>
            <form onSubmit={handlePinSubmit} className="biometric-password-form">
              <input
                type="password"
                pattern="\d*"
                inputMode="numeric"
                maxLength={6}
                className={`input-field ${error ? "error" : ""}`}
                style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "0.5rem" }}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                disabled={isVerifying}
                autoFocus
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isVerifying || !pin}
                style={{ width: "100%" }}
              >
                {isVerifying ? "Verifying PIN..." : "Verify PIN"}
              </button>
            </form>

            <button 
              type="button" 
              className="biometric-fallback-toggle"
              style={{ marginTop: "1.2rem", display: "inline-block" }}
              onClick={() => {
                setMode("password");
                setError(false);
                setStatusText("");
              }}
            >
              🔑 Use Master Password
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handlePasswordSubmit} className="biometric-password-form">
              <input
                type="password"
                className={`input-field ${error ? "error" : ""}`}
                placeholder="Enter Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isVerifying}
                autoFocus
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isVerifying || !password.trim()}
                style={{ width: "100%" }}
              >
                {isVerifying ? "Verifying..." : "Verify Master Password"}
              </button>
            </form>

            <button 
              type="button" 
              className="biometric-fallback-toggle"
              style={{ marginTop: "1.2rem", display: "inline-block" }}
              onClick={() => {
                setMode("pin");
                setError(false);
                setStatusText("");
              }}
            >
              🔢 Use Security PIN
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="biometric-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isVerifying}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
