import React, { useState, useEffect, useRef } from "react";
import { speakText, checkSpeechMatch, SpeechRecognitionManager } from "../utils/speech";

const STAGES = {
  INTRO: "INTRO",
  MATCH: "MATCH",
  BUILDER: "BUILDER",
  SPEECH: "SPEECH",
  COMPLETED: "COMPLETED"
};

export default function LessonScreen({ lesson, languageId, onCompleteLesson, onExit }) {
  const [stage, setStage] = useState(STAGES.INTRO);
  
  // Vocabulary Intro State
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [playedWords, setPlayedWords] = useState([]);

  // Matching game state
  const [matchItems, setMatchItems] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [shakeMatch, setShakeMatch] = useState(false);

  // Word builder state
  const [builderSlots, setBuilderSlots] = useState([]);
  const [builderWrong, setBuilderWrong] = useState(false);

  // Speaking state
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [speechSuccess, setSpeechSuccess] = useState(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [manualText, setManualText] = useState("");
  
  const speechRecognitionRef = useRef(null);

  // Initialize matching game items
  useEffect(() => {
    if (stage === STAGES.MATCH && lesson.matchGame) {
      // Create separate blocks for target and english, scramble them
      const targets = lesson.matchGame.map(item => ({ id: `target-${item.id}`, text: item.target, type: "target", rawId: item.id }));
      const englishes = lesson.matchGame.map(item => ({ id: `english-${item.id}`, text: item.english, type: "english", rawId: item.id }));
      const combined = [...targets, ...englishes].sort(() => Math.random() - 0.5);
      setMatchItems(combined);
      setMatchedIds([]);
      setSelectedMatch(null);
    }
  }, [stage, lesson]);

  // Setup Speech recognition
  useEffect(() => {
    speechRecognitionRef.current = new SpeechRecognitionManager();
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Text to speech playback
  const handleSpeak = (text) => {
    speakText(text, languageId);
    if (!playedWords.includes(text)) {
      setPlayedWords([...playedWords, text]);
    }
  };

  // Handle flashcard flipping
  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Move to next vocab card or next stage
  const handleNextVocab = () => {
    setIsFlipped(false);
    if (vocabIndex < lesson.vocab.length - 1) {
      setVocabIndex(vocabIndex + 1);
    } else {
      setStage(STAGES.MATCH);
    }
  };

  const handlePrevVocab = () => {
    setIsFlipped(false);
    if (vocabIndex > 0) {
      setVocabIndex(vocabIndex - 1);
    }
  };

  // Handle click on match item
  const handleMatchClick = (item) => {
    if (matchedIds.includes(item.id)) return; // already solved

    if (!selectedMatch) {
      // First item selected
      setSelectedMatch(item);
      setWrongId(null);
      return;
    }

    if (selectedMatch.id === item.id) {
      // Deselect
      setSelectedMatch(null);
      return;
    }

    // Check match
    if (selectedMatch.type !== item.type && selectedMatch.rawId === item.rawId) {
      // Correct Match!
      setMatchedIds(prev => [...prev, selectedMatch.id, item.id]);
      setSelectedMatch(null);
      // Play brief success audio (optional pitch note)
      speakText("✓", "english");
    } else {
      // Wrong Match
      setWrongId(item.id);
      setShakeMatch(true);
      speakText("✗", "english");
      
      setTimeout(() => {
        setShakeMatch(false);
        setSelectedMatch(null);
        setWrongId(null);
      }, 500);
    }
  };

  // Proceed if matching completes
  useEffect(() => {
    if (stage === STAGES.MATCH && lesson.matchGame && matchedIds.length === lesson.matchGame.length * 2) {
      setTimeout(() => {
        setStage(STAGES.BUILDER);
      }, 800);
    }
  }, [matchedIds, stage, lesson]);

  // Word Builder helpers
  const handleChipClick = (chip) => {
    if (builderSlots.includes(chip)) return;
    setBuilderSlots([...builderSlots, chip]);
  };

  const handleSlotClick = (chip) => {
    setBuilderSlots(builderSlots.filter(s => s !== chip));
  };

  const checkBuilderAnswer = () => {
    const isCorrect = builderSlots.length === lesson.wordBuilder.correct.length &&
      builderSlots.every((val, index) => val === lesson.wordBuilder.correct[index]);

    if (isCorrect) {
      setStage(STAGES.SPEECH);
    } else {
      setBuilderWrong(true);
      speakText("✗", "english");
      setTimeout(() => setBuilderWrong(false), 500);
    }
  };

  // Speaking Microphone Actions
  const handleStartListening = () => {
    setSpokenText("");
    setSpeechError("");
    setSpeechSuccess(null);
    setIsListening(true);

    if (!speechRecognitionRef.current) {
      setSpeechError("Speech recognition not supported in this browser.");
      setIsListening(false);
      return;
    }

    speechRecognitionRef.current.start(
      languageId,
      (result) => {
        setSpokenText(result);
        const { match, score } = checkSpeechMatch(result, lesson.speechChallenge.phrase);
        
        if (match) {
          setSpeechSuccess({ score });
          speakText("Excellent", "english");
          setTimeout(() => {
            setStage(STAGES.COMPLETED);
          }, 1500);
        } else {
          setSpeechSuccess({ score, failed: true });
          setSpeechError(`Pronunciation match is too low (${score}%). Try speaking closer to the microphone, slower, or click the audio button to listen again.`);
        }
      },
      (error) => {
        if (error === "not-allowed") {
          setMicPermissionDenied(true);
          setSpeechError("Microphone access is denied by browser settings. Please unlock permissions, or use the manual text verification option.");
        } else {
          setSpeechError(`Listening timed out or failed (${error}). Click the microphone to try again.`);
        }
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Manual fallback completion
  const handleManualVerify = () => {
    const { match, score } = checkSpeechMatch(manualText, lesson.speechChallenge.phrase);
    if (match) {
      setStage(STAGES.COMPLETED);
    } else {
      setSpeechError("Typing verification incorrect. Please spell the target language phrase exactly as shown above.");
      setBuilderWrong(true);
      setTimeout(() => setBuilderWrong(false), 500);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      {/* Lesson Progress Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button className="btn btn-secondary" onClick={onExit} style={{ padding: "0.4rem 1rem" }}>
          ✕ Quit Lesson
        </button>
        <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>
          {lesson.title}
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Progress: {stage === STAGES.INTRO ? "25%" : stage === STAGES.MATCH ? "50%" : stage === STAGES.BUILDER ? "75%" : stage === STAGES.SPEECH ? "90%" : "100%"}
        </div>
      </div>

      <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", marginBottom: "2.5rem", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            background: "var(--primary-grad)",
            width: stage === STAGES.INTRO ? "25%" : stage === STAGES.MATCH ? "50%" : stage === STAGES.BUILDER ? "75%" : stage === STAGES.SPEECH ? "90%" : "100%",
            transition: "width 0.4s ease"
          }}
        />
      </div>

      {/* STAGE 1: VOCABULARY INTRO */}
      {stage === STAGES.INTRO && (
        <div className="flashcard-arena">
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Meet the Words</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              {lesson.concept}
            </p>
          </div>

          {/* Double sided flipping card */}
          <div className={`flashcard-wrapper ${isFlipped ? "flipped" : ""}`} onClick={handleCardFlip}>
            <div className="flashcard">
              <div className="flashcard-front">
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Target Language Word</span>
                <div className="card-word">{lesson.vocab[vocabIndex].word}</div>
                <div className="card-translit">Pronounced: {lesson.vocab[vocabIndex].transliteration}</div>
                
                <button
                  className="btn btn-primary btn-icon"
                  style={{ marginTop: "1rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(lesson.vocab[vocabIndex].word);
                  }}
                  title="Listen pronunciation"
                >
                  🔊
                </button>

                <div className="card-hint-prompt">Tap Card to reveal English meaning</div>
              </div>

              <div className="flashcard-back">
                <span style={{ fontSize: "0.8rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>English Translation</span>
                <div className="card-translation">{lesson.vocab[vocabIndex].translation}</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Speaking Tip:</span>
                  <p className="card-tip">{lesson.vocab[vocabIndex].tip}</p>
                </div>

                <div className="card-hint-prompt" style={{ marginTop: "2rem" }}>Tap Card to flip back</div>
              </div>
            </div>
          </div>

          {/* Prev / Next controls */}
          <div style={{ display: "flex", gap: "1.5rem", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn btn-secondary" onClick={handlePrevVocab} disabled={vocabIndex === 0}>
              ← Previous
            </button>
            <div style={{ color: "var(--text-secondary)", fontWeight: "600" }}>
              {vocabIndex + 1} of {lesson.vocab.length}
            </div>
            <button className="btn btn-primary" onClick={handleNextVocab}>
              {vocabIndex === lesson.vocab.length - 1 ? "Start Match Game →" : "Next Word →"}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: MATCHING GAME */}
      {stage === STAGES.MATCH && (
        <div className="matching-container">
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Vocabulary Matching</h2>
            <p style={{ color: "var(--text-secondary)" }}>Match the target phrases to their english definitions.</p>
          </div>

          <div className={`matching-grid ${shakeMatch ? "shake-element" : ""}`}>
            {matchItems.map((item) => {
              const isSelected = selectedMatch?.id === item.id;
              const isMatched = matchedIds.includes(item.id);
              const isWrong = wrongId === item.id || (isSelected && wrongId !== null);
              
              let cardClass = "";
              if (isMatched) cardClass = "correct";
              else if (isWrong) cardClass = "wrong";
              else if (isSelected) cardClass = "selected";

              return (
                <div
                  key={item.id}
                  className={`match-item ${cardClass}`}
                  onClick={() => handleMatchClick(item)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Matched: {matchedIds.length / 2} / {lesson.matchGame.length} pairs
          </div>
        </div>
      )}

      {/* STAGE 3: SENTENCE WORD BUILDER */}
      {stage === STAGES.BUILDER && (
        <div className={`matching-container ${builderWrong ? "shake-element" : ""}`}>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Word Builder Challenge</h2>
            <p style={{ color: "var(--text-secondary)" }}>Build the correct sentence by clicking the words in order.</p>
          </div>

          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#a78bfa", marginBottom: "1rem", textAlign: "center" }}>
              {lesson.wordBuilder.prompt}
            </h3>

            {/* Placed word slots */}
            <div className="word-builder-slots">
              {builderSlots.length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Click chips below to arrange translation here...</span>
              ) : (
                builderSlots.map((word, index) => (
                  <span
                    key={`slot-${index}`}
                    className="word-chip"
                    onClick={() => handleSlotClick(word)}
                  >
                    {word}
                  </span>
                ))
              )}
            </div>

            {/* Scrambled selection chips */}
            <div className="word-builder-chips">
              {lesson.wordBuilder.scrambled.map((word, index) => {
                const isPlaced = builderSlots.includes(word);
                return (
                  <span
                    key={`chip-${index}`}
                    className={`word-chip ${isPlaced ? "placed" : ""}`}
                    onClick={() => !isPlaced && handleChipClick(word)}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setBuilderSlots([])}
                disabled={builderSlots.length === 0}
              >
                Clear
              </button>
              <button
                className="btn btn-primary"
                onClick={checkBuilderAnswer}
                disabled={builderSlots.length === 0}
              >
                Check Sentence →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: SPEAKING CHALLENGE */}
      {stage === STAGES.SPEECH && (
        <div className={`matching-container ${builderWrong ? "shake-element" : ""}`}>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Speak Without Fear</h2>
            <p style={{ color: "var(--text-secondary)" }}>Read the phrase aloud. The system will rate your speaking confidence.</p>
          </div>

          <div className="glass-panel" style={{ padding: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#22d3ee", fontWeight: "700", textTransform: "uppercase" }}>Challenge Phrase</span>
              <h2 style={{ fontSize: "2.4rem", margin: "0.5rem 0", color: "#f8fafc" }}>
                {lesson.speechChallenge.phrase}
              </h2>
              <div style={{ fontStyle: "italic", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                "{lesson.speechChallenge.translation}"
              </div>
              <div style={{ fontSize: "0.95rem", color: "#a78bfa", background: "rgba(139,92,246,0.06)", padding: "0.3rem 1rem", borderRadius: "10px", display: "inline-block" }}>
                Phonetic Guide: {lesson.speechChallenge.phonetic}
              </div>
            </div>

            {/* Speaking actions */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                {/* Speaker playback */}
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: "50px", height: "50px", fontSize: "1.2rem" }}
                  onClick={() => handleSpeak(lesson.speechChallenge.phrase)}
                  title="Listen to phrase"
                >
                  🔊
                </button>

                {/* Microphone trigger */}
                {isListening ? (
                  <button
                    className="btn btn-danger btn-icon"
                    style={{ width: "80px", height: "80px", fontSize: "2rem", borderRadius: "50%" }}
                    onClick={handleStopListening}
                    title="Stop recording"
                  >
                    ⏹️
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-icon"
                    style={{ width: "80px", height: "80px", fontSize: "2.2rem", borderRadius: "50%" }}
                    onClick={handleStartListening}
                    title="Start speaking"
                  >
                    🎙️
                  </button>
                )}
              </div>

              {/* Speech recognition waves */}
              {isListening && (
                <div style={{ textAlign: "center" }}>
                  <div className="waveform-container">
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#22d3ee" }}>Listening... Speak now!</span>
                </div>
              )}

              {/* Spoken result details */}
              {spokenText && (
                <div style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", width: "100%" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>We Heard:</div>
                  <div style={{ fontWeight: "700", color: "#f8fafc", margin: "0.3rem 0" }}>"{spokenText}"</div>
                  {speechSuccess && (
                    <div style={{ fontSize: "0.9rem", color: speechSuccess.failed ? "#ef4444" : "#10b981", fontWeight: "700" }}>
                      Confidence Score: {speechSuccess.score}% {speechSuccess.failed ? "(Try again)" : "(Passed!)"}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Errors */}
              {speechError && (
                <div style={{ color: "#f87171", fontSize: "0.88rem", textAlign: "center", maxWidth: "450px" }}>
                  ⚠️ {speechError}
                </div>
              )}

              {/* Skip / Permission Denied Fallback */}
              {(micPermissionDenied || !speechRecognitionRef.current) && (
                <div style={{ width: "100%", borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem", marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.8rem", textAlign: "center" }}>
                    No microphone? Spell the phrase in target language to complete:
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="phrasebook-search-bar"
                      style={{ margin: 0, padding: "0.6rem 1rem", fontSize: "0.9rem" }}
                      placeholder={`Type: ${lesson.speechChallenge.phrase}`}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                    />
                    <button className="btn btn-secondary" style={{ padding: "0 1.2rem" }} onClick={handleManualVerify}>
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: CELEBRATION MODAL */}
      {stage === STAGES.COMPLETED && (
        <div className="celebration-screen">
          <div className="badge-reward">🏆</div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }} className="gradient-text">
            Lesson Completed!
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "450px" }}>
            Amazing work! You spoke the phrases, solved the builder challenges, and earned **+20 Confidence Points** in {lesson.title}!
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-primary" onClick={() => onCompleteLesson(lesson.id)}>
              Finish & Return to Track
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
