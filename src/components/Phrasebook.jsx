import React, { useState } from "react";
import { speakText } from "../utils/speech";

const CATEGORIES = ["All", "Greetings", "Numbers", "Family", "Food", "Places"];

export default function Phrasebook({ language, onExit }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!language) return null;

  // Extract all vocabulary items from the beginner lessons to build the phrasebook database dynamically
  const phrasebookItems = [];
  const addedWords = new Set();

  const beginnerModules = language.levels.beginner?.modules || [];
  beginnerModules.forEach(mod => {
    // Determine category based on module titles
    let category = "Greetings";
    if (mod.title.toLowerCase().includes("number")) category = "Numbers";
    if (mod.title.toLowerCase().includes("food") || mod.title.toLowerCase().includes("bia")) category = "Food";
    if (mod.title.toLowerCase().includes("ohana") || mod.title.toLowerCase().includes("family")) category = "Family";

    mod.lessons.forEach(lesson => {
      // If the lesson title has more details, override
      if (lesson.title.toLowerCase().includes("number")) category = "Numbers";
      if (lesson.title.toLowerCase().includes("food") || lesson.title.toLowerCase().includes("bia")) category = "Food";
      if (lesson.title.toLowerCase().includes("ohana") || lesson.title.toLowerCase().includes("family")) category = "Family";
      if (lesson.title.toLowerCase().includes("greet") || lesson.title.toLowerCase().includes("kaixo") || lesson.title.toLowerCase().includes("rimay")) category = "Greetings";

      lesson.vocab.forEach(item => {
        if (!addedWords.has(item.word.toLowerCase())) {
          addedWords.add(item.word.toLowerCase());
          phrasebookItems.push({
            ...item,
            category
          });
        }
      });
    });
  });

  // Filter items
  const filteredItems = phrasebookItems.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSpeak = (text) => {
    speakText(text, language.id);
  };

  return (
    <div className="container" style={{ maxWidth: "850px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <button className="btn btn-secondary" onClick={onExit} style={{ padding: "0.4rem 1rem", marginRight: "1rem" }}>
            ← Back to Track
          </button>
        </div>
        <h2 style={{ fontSize: "1.6rem" }}>
          {language.flag} {language.name} Phrasebook
        </h2>
      </div>

      <div className="glass-panel" style={{ padding: "2rem" }}>
        {/* Search */}
        <input
          type="text"
          className="phrasebook-search-bar"
          placeholder="Search phrases or English meanings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Categories */}
        <div className="phrasebook-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List of Phrases */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
              No phrases found matching "{searchQuery}" in category "{selectedCategory}".
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: "1rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.02)"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <h4 style={{ fontSize: "1.25rem", color: "#f8fafc" }}>{item.word}</h4>
                    <span style={{ fontSize: "0.75rem", background: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "0.1rem 0.4rem", borderRadius: "5px" }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    {item.translation}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#22d3ee", marginTop: "0.2rem" }}>
                    Phonetics: <span style={{ fontFamily: "var(--font-heading)" }}>{item.transliteration}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-secondary btn-icon" onClick={() => handleSpeak(item.word)}>
                    🔊
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
