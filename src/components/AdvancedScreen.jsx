import React, { useState } from "react";
import { speakText } from "../utils/speech";

export default function AdvancedScreen({ cultureText, languageId, onCompleteAdvanced, onExit }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleSpeakText = () => {
    // Speak first sentence or summary
    const summary = `${cultureText.title}. ${cultureText.text.split(".")[0]}.`;
    speakText(summary, languageId);
  };

  const handleSelectOption = (qIdx, option) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: option
    }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    cultureText.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);
    speakText(correctCount === cultureText.questions.length ? "Excellent" : "Try again", "english");
  };

  const handleFinish = () => {
    onCompleteAdvanced(score === cultureText.questions.length);
  };

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={onExit} style={{ padding: "0.4rem 1rem" }}>
          ← Exit Reading
        </button>
        <div style={{ fontWeight: "700", color: "#10b981" }}>
          📜 Advanced Immersive Track
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.8rem" }} className="gradient-text">{cultureText.title}</h2>
          <button className="btn btn-secondary btn-icon" onClick={handleSpeakText} title="Listen to narration snippet">
            🔊
          </button>
        </div>
        
        <p style={{ color: "#f8fafc", fontSize: "1.1rem", lineHeight: "1.7", textIndent: "2rem", textAlign: "justify" }}>
          {cultureText.text}
        </p>
      </div>

      {/* Comprehension Quiz */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Comprehension Quiz</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {cultureText.questions.map((q, idx) => {
            const chosen = selectedAnswers[idx];
            return (
              <div key={idx} style={{ background: "rgba(0,0,0,0.1)", padding: "1.2rem", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <h4 style={{ fontSize: "1.05rem", marginBottom: "0.8rem", color: "#f8fafc" }}>
                  {idx + 1}. {q.question}
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {q.options.map((option, optIdx) => {
                    const isSelected = chosen === option;
                    const isCorrect = option === q.answer;
                    
                    let btnStyle = "btn-secondary";
                    if (showResults) {
                      if (isCorrect) btnStyle = "btn-correct"; // Green correct choice
                      else if (isSelected) btnStyle = "btn-danger"; // Red incorrect choice
                    } else if (isSelected) {
                      btnStyle = "btn-primary";
                    }

                    return (
                      <button
                        key={optIdx}
                        className={`btn ${btnStyle}`}
                        style={{ justifyContent: "flex-start", padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}
                        onClick={() => handleSelectOption(idx, option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          {!showResults ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length < cultureText.questions.length}
            >
              Submit Answers
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                Score: {score} / {cultureText.questions.length} Correct
              </div>
              <button className="btn btn-primary" onClick={handleFinish}>
                {score === cultureText.questions.length ? "Complete Track" : "Return to Track"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
