import React from "react";

export default function Dashboard({
  languages,
  selectedLanguage,
  onSelectLanguage,
  onBackToLanguages,
  selectedLevel,
  onSelectLevel,
  completedLessons,
  onStartLesson,
  onStartScenario,
  onStartAdvanced
}) {
  if (!selectedLanguage) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }} className="gradient-text">
            Speak Without Fear
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
            AuraLingo helps you learn and speak endangered, rare, and worldwide languages through low-stress interactive challenges and conversational play.
          </p>
        </div>

        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Choose a Language Sanctuary</h2>
        <div className="language-grid">
          {languages.map((lang) => {
            const isEndangered = lang.endangered;
            return (
              <div
                key={lang.id}
                className={`glass-panel language-card ${isEndangered ? "endangered" : ""}`}
                onClick={() => onSelectLanguage(lang)}
              >
                <div className="language-header">
                  <span className="language-flag">{lang.flag}</span>
                  {isEndangered ? (
                    <span className="badge-endangered">Endangered Status: {lang.status}</span>
                  ) : (
                    <span className="badge-global">Global Language</span>
                  )}
                </div>
                <h3>{lang.name}</h3>
                <div className="native-name">{lang.nativeName}</div>
                <p>{lang.history}</p>
                <div className="language-footer">
                  <span>Beginner to Advanced</span>
                  <button className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                    Enter Sanctuary
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Language is selected - display the structured pathway
  const levels = selectedLanguage.levels;
  const activeLevelData = levels[selectedLevel];

  // Helper to determine lock status for lessons
  // Lesson is unlocked if it is the first lesson, or if the previous lesson in the array is completed
  const checkLessonStatus = (lesson, moduleIndex, lessonIndex, allModules) => {
    // Check if previous lessons are completed
    let isUnlocked = true;

    // Flatten all lessons up to this point
    const flatLessonsBefore = [];
    for (let m = 0; m < allModules.length; m++) {
      const mod = allModules[m];
      for (let l = 0; l < mod.lessons.length; l++) {
        if (m < moduleIndex || (m === moduleIndex && l < lessonIndex)) {
          flatLessonsBefore.push(mod.lessons[l].id);
        }
      }
    }

    // Must have completed all flat lessons before
    for (const prevId of flatLessonsBefore) {
      if (!completedLessons.includes(prevId)) {
        isUnlocked = false;
        break;
      }
    }

    const isCompleted = completedLessons.includes(lesson.id);

    return {
      isCompleted,
      isUnlocked: isUnlocked || isCompleted // Completed lessons are always unlocked
    };
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <button className="btn btn-secondary" onClick={onBackToLanguages}>
          ← Change Language
        </button>
        <div>
          <h1 style={{ fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{selectedLanguage.flag}</span>
            <span>{selectedLanguage.name}</span>
            <span style={{ fontSize: "1.1rem", fontStyle: "italic", fontWeight: "normal", color: "var(--text-secondary)" }}>
              ({selectedLanguage.nativeName})
            </span>
          </h1>
        </div>
      </div>

      {/* Level Selection Tabs */}
      <div className="level-tabs">
        <button
          className={`level-tab ${selectedLevel === "beginner" ? "active" : ""}`}
          onClick={() => onSelectLevel("beginner")}
        >
          🔰 Beginner Tracks
        </button>
        <button
          className={`level-tab ${selectedLevel === "intermediate" ? "active" : ""}`}
          onClick={() => onSelectLevel("intermediate")}
        >
          🗣️ Intermediate Roleplay
        </button>
        <button
          className={`level-tab ${selectedLevel === "advanced" ? "active" : ""}`}
          onClick={() => onSelectLevel("advanced")}
        >
          📜 Advanced Legends
        </button>
      </div>

      {/* LEVEL CONTENT VIEW */}
      {selectedLevel === "beginner" && (
        <div className="pathway-container">
          {activeLevelData.modules.map((mod, modIdx, allMods) => (
            <div key={mod.id} className="glass-panel module-section" style={{ padding: "1.5rem" }}>
              <div className="module-header">
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
              </div>

              <div className="lesson-trail">
                {mod.lessons.map((lesson, lesIdx) => {
                  const status = checkLessonStatus(lesson, modIdx, lesIdx, allMods);
                  return (
                    <React.Fragment key={lesson.id}>
                      <div className="lesson-node-wrapper">
                        <div
                          className={`lesson-node ${
                            status.isCompleted ? "completed" : status.isUnlocked ? "unlocked" : "locked"
                          }`}
                          onClick={() => {
                            if (status.isUnlocked) {
                              onStartLesson(lesson);
                            }
                          }}
                        >
                          {status.isCompleted ? "✓" : status.isUnlocked ? "▶" : "🔒"}
                        </div>
                        <span className="lesson-node-title">{lesson.title}</span>
                      </div>
                      
                      {/* Trail connection lines between nodes within the same module */}
                      {lesIdx < mod.lessons.length - 1 && (
                        <div
                          className={`trail-connector ${
                            checkLessonStatus(mod.lessons[lesIdx + 1], modIdx, lesIdx + 1, allMods).isCompleted
                              ? "completed"
                              : status.isCompleted
                              ? "unlocked"
                              : ""
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLevel === "intermediate" && (
        <div className="pathway-container">
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Speak Without Fear Sandbox</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Practice speaking real-world dialogues. Our conversational engine listens to your pronunciation and provides stress-free feedback. Speak at your own pace!
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {activeLevelData.scenarios.map((scen) => (
                <div key={scen.id} className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #06b6d4" }}>
                  <h4 style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>{scen.title}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                    {scen.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#22d3ee", fontWeight: "700" }}>{scen.difficulty}</span>
                    <button className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={() => onStartScenario(scen)}>
                      Start Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedLevel === "advanced" && (
        <div className="pathway-container">
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Cultural Lore & Advanced Reading</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Explore the rich cultural history of this language. Read the narratives, hear pronunciation styles, and test your understanding with comprehension quizzes.
            </p>

            <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #10b981" }}>
              <h4 style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>{activeLevelData.cultureText.title}</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                {activeLevelData.cultureText.text.substring(0, 200)}...
              </p>
              <button className="btn btn-primary" onClick={() => onStartAdvanced(activeLevelData.cultureText)}>
                Read Myth & Play Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
