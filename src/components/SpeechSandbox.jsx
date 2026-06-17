import React, { useState, useEffect, useRef } from "react";
import { speakText, checkSpeechMatch, SpeechRecognitionManager } from "../utils/speech";

export default function SpeechSandbox({ scenario, languageId, onCompleteScenario, onExit }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [showTranslations, setShowTranslations] = useState(true);
  
  // Microphone listening states
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successRate, setSuccessRate] = useState(null);
  const [manualText, setManualText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const speechRecognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  const currentStep = scenario.steps[activeStepIndex];

  // Initialize Speech recognition
  useEffect(() => {
    speechRecognitionRef.current = new SpeechRecognitionManager();
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Whenever a new step starts, have the bot speak
  useEffect(() => {
    if (currentStep) {
      // Small timeout to allow transition
      const timer = setTimeout(() => {
        speakText(currentStep.botLine, languageId);
        
        // Add bot line to chat history if not already present
        const isBotLineAdded = chatHistory.some(
          item => item.sender === "bot" && item.text === currentStep.botLine
        );

        if (!isBotLineAdded) {
          setChatHistory(prev => [
            ...prev,
            {
              id: `bot-${activeStepIndex}`,
              sender: "bot",
              speakerName: currentStep.speaker,
              text: currentStep.botLine,
              translation: currentStep.botTranslation
            }
          ]);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeStepIndex, currentStep, languageId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSpeakText = (text, lang) => {
    speakText(text, lang || languageId);
  };

  const handleStartListening = () => {
    setSpokenText("");
    setErrorMsg("");
    setSuccessRate(null);
    setIsListening(true);

    if (!speechRecognitionRef.current) {
      setErrorMsg("Speech Recognition not supported in this browser.");
      setIsListening(false);
      return;
    }

    speechRecognitionRef.current.start(
      languageId,
      (result) => {
        setSpokenText(result);
        
        // Match spoken text against any of the accepted strings
        let bestMatch = { match: false, score: 0 };
        for (const expected of currentStep.expectedResponses) {
          const check = checkSpeechMatch(result, expected);
          if (check.score > bestMatch.score) {
            bestMatch = check;
          }
        }

        if (bestMatch.match) {
          setSuccessRate(bestMatch.score);
          setIsListening(false);
          
          // Add user reply to chat history
          const userText = currentStep.expectedResponses[0]; // standard expected response
          setChatHistory(prev => [
            ...prev,
            {
              id: `user-${activeStepIndex}`,
              sender: "user",
              speakerName: "You",
              text: userText,
              translation: currentStep.hint.replace("Say: ", "").replace(/'/g, "")
            }
          ]);

          speakText("Excellent", "english");

          // Advance to next step or complete
          setTimeout(() => {
            if (activeStepIndex < scenario.steps.length - 1) {
              setActiveStepIndex(prev => prev + 1);
              setSpokenText("");
              setSuccessRate(null);
            } else {
              // Complete Scenario!
              setActiveStepIndex(scenario.steps.length); // triggers final view
            }
          }, 1500);

        } else {
          setSuccessRate(bestMatch.score);
          setErrorMsg(`We heard: "${result}". Speak clearly: "${currentStep.expectedResponses[0]}"`);
          setIsListening(false);
        }
      },
      (error) => {
        if (error === "not-allowed") {
          setShowManualInput(true);
          setErrorMsg("Microphone permission denied. Feel free to type your response below!");
        } else {
          setErrorMsg("Failed to hear you. Click the mic button to try again.");
        }
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;

    let bestMatch = { match: false, score: 0 };
    for (const expected of currentStep.expectedResponses) {
      const check = checkSpeechMatch(manualText, expected);
      if (check.score > bestMatch.score) {
        bestMatch = check;
      }
    }

    if (bestMatch.match) {
      setErrorMsg("");
      setManualText("");
      setChatHistory(prev => [
        ...prev,
        {
          id: `user-${activeStepIndex}`,
          sender: "user",
          speakerName: "You",
          text: currentStep.expectedResponses[0],
          translation: currentStep.hint.replace("Say: ", "").replace(/'/g, "")
        }
      ]);

      if (activeStepIndex < scenario.steps.length - 1) {
        setActiveStepIndex(prev => prev + 1);
      } else {
        setActiveStepIndex(scenario.steps.length);
      }
    } else {
      setErrorMsg("Incorrect spelling. Please copy the expected phrase from the prompt.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      {/* Sandbox Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <button className="btn btn-secondary" onClick={onExit} style={{ padding: "0.4rem 1rem", marginRight: "1rem" }}>
            ✕ Exit Sandbox
          </button>
          <button className="btn btn-secondary" style={{ padding: "0.4rem 1rem" }} onClick={() => setShowTranslations(!showTranslations)}>
            {showTranslations ? "👁️ Hide Translations" : "👁️ Show Translations"}
          </button>
        </div>
        <div style={{ fontWeight: "700", color: "#06b6d4" }}>
          Sandbox Mode: {scenario.title}
        </div>
      </div>

      {activeStepIndex >= scenario.steps.length ? (
        /* Scenario Completed Celebration */
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "5rem", marginBottom: "1.5rem" }}>🗣️🎉</div>
          <h2 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }} className="gradient-text">
            Scenario Complete!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.1rem" }}>
            You completed the conversation flow successfully and spoke with confidence! 
            You earned **+40 Speaking Confidence XP**.
          </p>
          <button className="btn btn-primary" onClick={() => onCompleteScenario(scenario.id)}>
            Finish & Return to Track
          </button>
        </div>
      ) : (
        /* Sandbox Interactive Split Screen */
        <div className="speech-sandbox">
          
          {/* LEFT COLUMN: Dialogue Chat History */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "480px" }}>
            <h4 style={{ padding: "1rem", borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}>
              Scenario Conversation Log
            </h4>
            <div className="chat-history" style={{ flexGrow: 1, height: "auto" }}>
              {chatHistory.map((chat) => (
                <div key={chat.id} className={`chat-bubble ${chat.sender}`}>
                  <div className="speaker-label">{chat.speakerName}</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{chat.text}</span>
                    <button
                      onClick={() => handleSpeakText(chat.text, chat.sender === "user" ? languageId : languageId)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem" }}
                      title="Play audio"
                    >
                      🔊
                    </button>
                  </div>
                  {showTranslations && (
                    <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.2rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.2rem" }}>
                      {chat.translation}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
          </div>

          {/* RIGHT COLUMN: Speech Practice Control Center */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            
            {/* Context details */}
            <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Active Scenario Step</span>
              <h3 style={{ fontSize: "1.3rem", marginTop: "0.2rem", color: "#f8fafc" }}>
                Practice Dialogue
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                Listen to the host speak, read the suggestion, then tap the mic to reply.
              </p>
            </div>

            {/* Prompt Helper Box */}
            <div className="glass-panel" style={{ background: "rgba(124,58,237,0.05)", borderLeft: "4px solid #7c3aed", padding: "1.2rem", margin: "1rem 0" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#a78bfa", marginBottom: "0.4rem" }}>
                What you should say:
              </div>
              <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.2rem" }}>
                {currentStep.expectedResponses[0]}
              </h4>
              <div style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                ({currentStep.hint})
              </div>
              <div style={{ fontSize: "0.85rem", color: "#22d3ee", background: "rgba(6,182,212,0.06)", padding: "0.3rem 0.6rem", borderRadius: "6px", display: "inline-block" }}>
                Phonetic Guide: {currentStep.phonetics}
              </div>
            </div>

            {/* Speaking Actions */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {/* Play audio of expected user response */}
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: "45px", height: "45px" }}
                  onClick={() => handleSpeakText(currentStep.expectedResponses[0])}
                  title="Listen to pronunciation"
                >
                  🔊
                </button>

                {/* Microphone toggle */}
                {isListening ? (
                  <button
                    className="btn btn-danger btn-icon"
                    style={{ width: "65px", height: "65px", fontSize: "1.6rem" }}
                    onClick={() => setIsListening(false)}
                  >
                    ⏹️
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-icon"
                    style={{ width: "65px", height: "65px", fontSize: "1.8rem" }}
                    onClick={handleStartListening}
                  >
                    🎙️
                  </button>
                )}
              </div>

              {/* Speech waves */}
              {isListening && (
                <div style={{ textAlign: "center" }}>
                  <div className="waveform-container" style={{ margin: "0.5rem 0" }}>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#06b6d4" }}>Microphone active. Speak now!</span>
                </div>
              )}

              {/* Feedback results */}
              {spokenText && (
                <div style={{ width: "100%", textAlign: "center", background: "rgba(255,255,255,0.02)", padding: "0.8rem", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Heard:</div>
                  <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>"{spokenText}"</div>
                  {successRate !== null && (
                    <div style={{ fontSize: "0.85rem", color: successRate >= 65 ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                      Score: {successRate}%
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div style={{ color: "#f87171", fontSize: "0.85rem", textAlign: "center", maxWidth: "100%" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Manual keyboard fallback */}
              {(!showManualInput) ? (
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem", marginTop: "0.5rem" }}
                  onClick={() => setShowManualInput(true)}
                >
                  Type response instead
                </button>
              ) : (
                <div style={{ width: "100%", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="phrasebook-search-bar"
                      style={{ margin: 0, padding: "0.5rem 0.8rem", fontSize: "0.85rem" }}
                      placeholder="Type the exact target response..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                    />
                    <button className="btn btn-secondary" style={{ padding: "0 1rem", fontSize: "0.85rem" }} onClick={handleManualSubmit}>
                      Send
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
