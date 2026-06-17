import React from "react";

export default function Navbar({ streak, confidenceScore, completedCount, activeLanguage, onBackToDashboard }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={onBackToDashboard}>
        <span>AuraLingo</span>
      </div>

      <div className="nav-stats">
        {activeLanguage && (
          <div className="stat-badge" style={{ color: "#a78bfa", borderColor: "rgba(139, 92, 246, 0.2)" }}>
            <span style={{ fontSize: "1.2rem" }}>{activeLanguage.flag}</span>
            <span>{activeLanguage.name}</span>
          </div>
        )}

        <div className="stat-badge streak" title="Daily speaking streak">
          <span>🔥</span>
          <span>{streak} Day Streak</span>
        </div>

        <div className="stat-badge confidence" title="Overall speaking confidence score">
          <span>🏆</span>
          <span>{confidenceScore}% Speak Confidence</span>
        </div>

        <div className="stat-badge" title="Completed exercises">
          <span>✔️</span>
          <span>{completedCount} Solved</span>
        </div>
      </div>
    </header>
  );
}
