import { useState } from "react";
import logoImg from "../assets/logo.png";

export default function PinSetupScreen({ onSetupPin }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{4,6}$/.test(pin)) {
      setError("Security PIN must be between 4 and 6 digits.");
      triggerShake();
      return;
    }

    if (pin !== confirmPin) {
      setError("Security PINs do not match.");
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSetupPin(pin);
    } catch {
      setError("An error occurred during PIN setup. Please try again.");
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className={`glass-panel modal-content ${shake ? "shake" : ""}`} style={{ maxWidth: "480px" }}>
        
        <div className="vault-lock-container">
          <img 
            src={logoImg} 
            alt="SecureVault Logo" 
            style={{ 
              width: "80px", 
              height: "80px", 
              marginBottom: "1rem", 
              borderRadius: "16px", 
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" 
            }} 
          />
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.2rem" }} className="gradient-text">
            Set Security PIN
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", textAlign: "center", marginBottom: "1.5rem" }}>
            Define a quick 4-to-6 digit PIN. This PIN will be used as a secondary security layer before revealing hidden passwords.
          </p>
        </div>

        {error && (
          <div style={{ 
            color: "#ef4444", 
            background: "rgba(239, 68, 68, 0.08)", 
            border: "1px solid rgba(239, 68, 68, 0.2)", 
            padding: "0.8rem", 
            borderRadius: "10px", 
            marginBottom: "1.2rem", 
            fontSize: "0.88rem" 
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
              Define Security PIN
            </label>
            <input
              type="password"
              pattern="\d*"
              inputMode="numeric"
              maxLength={6}
              className="input-field"
              placeholder="4 to 6 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
              Confirm Security PIN
            </label>
            <input
              type="password"
              pattern="\d*"
              inputMode="numeric"
              maxLength={6}
              className="input-field"
              placeholder="Confirm 4 to 6 digits"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
            disabled={isSubmitting || !pin}
          >
            {isSubmitting ? "Saving PIN..." : "Save PIN & Continue"}
          </button>
        </form>

      </div>
    </div>
  );
}
