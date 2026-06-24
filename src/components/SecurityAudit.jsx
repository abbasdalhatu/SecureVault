import { useState, useMemo } from "react";

// Common weak password patterns to detect instantly
const WEAK_PATTERNS = ["12345", "123456", "12345678", "password", "admin", "qwerty", "letmein", "123456789"];

export default function SecurityAudit({ items, onEditItem, onSaveItem, onCopyPassword }) {
  const [successToast, setSuccessToast] = useState("");

  // Helper to calculate Shannon Entropy for any password string
  const calculateEntropy = (password) => {
    if (!password) return 0;
    
    let uppercase = false;
    let lowercase = false;
    let numbers = false;
    let symbols = false;

    for (let i = 0; i < password.length; i++) {
      const char = password[i];
      if (/[A-Z]/.test(char)) uppercase = true;
      else if (/[a-z]/.test(char)) lowercase = true;
      else if (/[0-9]/.test(char)) numbers = true;
      else symbols = true;
    }

    let poolSize = 0;
    if (uppercase) poolSize += 26;
    if (lowercase) poolSize += 26;
    if (numbers) poolSize += 10;
    if (symbols) poolSize += 26;

    if (poolSize === 0) return 0;
    return Math.round(password.length * Math.log2(poolSize));
  };

  // Perform full security audit on items
  const auditResults = useMemo(() => {
    // Filter down to credentials that have passwords (exclude Notes)
    const creds = items.filter(item => item.category !== "note" && item.password);
    
    const weakList = [];
    const reusedMap = {}; // password -> Array of items
    const shortList = [];
    const safeList = [];

    // Group items by password to check for reuse
    creds.forEach((item) => {
      const pass = item.password;
      if (!reusedMap[pass]) {
        reusedMap[pass] = [];
      }
      reusedMap[pass].push(item);
    });

    creds.forEach((item) => {
      const pass = item.password;
      const entropy = calculateEntropy(pass);
      const isShort = pass.length < 10;
      const isCommon = WEAK_PATTERNS.includes(pass.toLowerCase());
      const isWeak = entropy < 60 || isCommon;
      
      const isReused = reusedMap[pass].length > 1;

      let flagged = false;

      const issues = [];
      if (isCommon) {
        issues.push({ type: "critical", msg: "Found in list of common, easily hackable passwords." });
        flagged = true;
      } else if (isWeak) {
        issues.push({ type: "weak", msg: `Low entropy (${entropy} bits). Recommend 60+ bits.` });
        flagged = true;
      }

      if (isShort) {
        issues.push({ type: "short", msg: `Too short (${pass.length} chars). Recommend 10+ characters.` });
        flagged = true;
      }

      if (isReused) {
        const otherItems = reusedMap[pass].filter(x => x.id !== item.id).map(x => x.title);
        issues.push({ type: "reused", msg: `Password reused across other accounts: ${otherItems.join(", ")}.` });
        flagged = true;
      }

      const auditedItem = {
        item,
        entropy,
        issues,
        isReused,
        isWeak,
        isShort
      };

      if (flagged) {
        if (isWeak || isCommon) weakList.push(auditedItem);
        else if (isShort) shortList.push(auditedItem);
        // If it's only reused, or not already in weak/short lists, we still want it represented
      } else {
        safeList.push(auditedItem);
      }
    });

    // Extract all items that have any issue
    const allFlagged = creds.map(item => {
      const pass = item.password;
      const entropy = calculateEntropy(pass);
      const isShort = pass.length < 10;
      const isCommon = WEAK_PATTERNS.includes(pass.toLowerCase());
      const isWeak = entropy < 60 || isCommon;
      const isReused = reusedMap[pass].length > 1;

      const issues = [];
      if (isCommon) issues.push(`Common/dangerous password`);
      else if (isWeak) issues.push(`Weak entropy (${entropy} bits)`);
      if (isShort) issues.push(`Short length (${pass.length} chars)`);
      if (isReused) {
        const dups = reusedMap[pass].filter(x => x.id !== item.id).map(x => x.title);
        issues.push(`Shared with: ${dups.join(", ")}`);
      }

      if (issues.length > 0) {
        return { item, issues, isWeak, isReused, isShort };
      }
      return null;
    }).filter(Boolean);

    // Calculate Vault Health Score out of 100
    // Start at 100 if credentials exist, deduct 15 points per unique weak password, deduct 20 points per unique reused password group. Otherwise 0.
    let score = 0;
    if (creds.length > 0) {
      score = 100;
      // Unique weak passwords count
      const uniqueWeakCount = new Set(creds.filter(x => WEAK_PATTERNS.includes(x.password.toLowerCase()) || calculateEntropy(x.password) < 60).map(x => x.password)).size;
      // Reused password groups count
      const uniqueReusedCount = Object.keys(reusedMap).filter(k => reusedMap[k].length > 1).length;

      score -= uniqueWeakCount * 15;
      score -= uniqueReusedCount * 20;
      score = Math.max(0, Math.min(100, score));
    }

    return {
      totalCredentials: creds.length,
      flaggedItems: allFlagged,
      weakCount: allFlagged.filter(x => x.isWeak).length,
      reusedCount: allFlagged.filter(x => x.isReused).length,
      shortCount: allFlagged.filter(x => x.isShort).length,
      healthScore: score
    };
  }, [items]);

  // Generate a highly secure, 20-character password for Auto-Fix
  const generateSecureFix = () => {
    const uppercasePool = "ABCDEFGHJKLMNPQRTVWXY";
    const lowercasePool = "abcdefghijkmnpqrtuwxyz";
    const numbersPool = "34679";
    const symbolsPool = "@#$%^&*()_+-=[]{};:,.<>?";
    
    const pools = [uppercasePool, lowercasePool, numbersPool, symbolsPool];
    const guaranteed = [];

    // Get 1 character from each pool to guarantee presence
    pools.forEach((pool) => {
      const rand = new Uint32Array(1);
      window.crypto.getRandomValues(rand);
      guaranteed.push(pool.charAt(rand[0] % pool.length));
    });

    const combined = pools.join("");
    const remaining = 20 - guaranteed.length;
    const randValues = new Uint32Array(remaining);
    window.crypto.getRandomValues(randValues);

    for (let i = 0; i < remaining; i++) {
      guaranteed.push(combined.charAt(randValues[i] % combined.length));
    }

    // Cryptographically secure shuffle (Fisher-Yates)
    const result = [...guaranteed];
    const len = result.length;
    const randShuffle = new Uint32Array(len);
    window.crypto.getRandomValues(randShuffle);

    for (let i = len - 1; i > 0; i--) {
      const j = randShuffle[i] % (i + 1);
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }

    return result.join("");
  };

  // Perform Auto-Fix on an item: Generate strong password and save it
  const handleAutoFix = (item) => {
    const securePass = generateSecureFix();
    const updated = {
      ...item,
      password: securePass,
      updatedAt: new Date().toISOString()
    };
    onSaveItem(updated);
    
    setSuccessToast(`Auto-Fixed "${item.title}" with a strong 20-char password!`);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  // SVG Circular progress configurations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (auditResults.healthScore / 100) * circumference;

  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 50) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const scoreColor = getScoreColor(auditResults.healthScore);

  return (
    <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Toast Notification */}
      {successToast && (
        <div className="clipboard-toast" style={{ background: "#10b981", bottom: "2rem" }}>
          🚀 {successToast}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="gradient-text" style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
          🛡️ Vault Security Auditor
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Scans all encrypted credentials in your vault to identify weak entropy, short length, and dangerous password reuse.
        </p>
      </div>

      {/* Health Overview Area */}
      <div
        style={{
          display: "flex",
          background: "rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border-glass)",
          borderRadius: "14px",
          padding: "1.5rem",
          alignItems: "center",
          gap: "2rem",
          flexWrap: "wrap"
        }}
      >
        {/* Animated Circular Meter */}
        <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.8s ease-in-out, stroke 0.8s ease-in-out" }}
            />
          </svg>
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "white" }}>{auditResults.healthScore}%</span>
            <span style={{ fontSize: "0.62rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: "700" }}>Health</span>
          </div>
        </div>

        {/* Detailed counts */}
        <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Security Breakdown</h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.4rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Total Passwords Analyzed:</span>
            <span style={{ fontWeight: "700" }}>{auditResults.totalCredentials}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.4rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>🔴 Weak Passwords:</span>
            <span style={{ fontWeight: "700", color: auditResults.weakCount > 0 ? "#ef4444" : "var(--text-secondary)" }}>{auditResults.weakCount}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.4rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>🟡 Reused Passwords:</span>
            <span style={{ fontWeight: "700", color: auditResults.reusedCount > 0 ? "#f59e0b" : "var(--text-secondary)" }}>{auditResults.reusedCount}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>🟠 Short Passwords:</span>
            <span style={{ fontWeight: "700", color: auditResults.shortCount > 0 ? "#fb923c" : "var(--text-secondary)" }}>{auditResults.shortCount}</span>
          </div>
        </div>
      </div>

      {/* Flagged Passwords List */}
      <div>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }} className="gradient-text">
          ⚠️ Flagged Accounts ({auditResults.flaggedItems.length})
        </h3>

        {auditResults.flaggedItems.length === 0 ? (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "12px",
              padding: "2.5rem 1.5rem",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</div>
            <h4 style={{ color: "#10b981", fontSize: "1.05rem", fontWeight: "700" }}>Your Vault is Strong & Healthy!</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
              All analyzed credentials satisfy entropy recommendations and are unique. No weaknesses found.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {auditResults.flaggedItems.map(({ item, issues, isWeak, isReused }) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  background: "var(--bg-card)",
                  border: `1px solid ${isWeak ? "rgba(239, 68, 68, 0.2)" : isReused ? "rgba(245, 158, 11, 0.2)" : "var(--border-glass)"}`,
                  borderRadius: "12px",
                  gap: "1.5rem",
                  flexWrap: "wrap"
                }}
              >
                {/* Credentials details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: "200px" }}>
                  <div style={{ fontWeight: "700", fontSize: "1.02rem", color: "white" }}>
                    {item.title}
                  </div>
                  {item.username && (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      👤 {item.username}
                    </div>
                  )}
                  {/* Warning labels */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginTop: "0.4rem" }}>
                    {issues.map((issue, idx) => {
                      const isDup = issue.startsWith("Shared with");
                      const color = isWeak ? "#fca5a5" : isDup ? "#fde047" : "#ffedd5";
                      return (
                        <span key={idx} style={{ fontSize: "0.75rem", color, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span>⚠️</span>
                          <span>{issue}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Fix actions */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                    onClick={() => {
                      if (onCopyPassword) {
                        onCopyPassword(item.password);
                      } else {
                        navigator.clipboard.writeText(item.password);
                      }
                    }}
                    title="Copy existing password"
                  >
                    📋 Copy
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                    onClick={() => onEditItem(item)}
                    title="Edit item details manually"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.8rem",
                      background: "var(--correct-grad)",
                      boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)"
                    }}
                    onClick={() => handleAutoFix(item)}
                    title="Instantly generate a strong 20-character password & encrypt/save to vault"
                  >
                    ⚡ Auto-Fix
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
