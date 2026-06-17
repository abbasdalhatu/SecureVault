export const WORD_LIST = [
  "about", "above", "actor", "acute", "admit", "adopt", "adult", "agent", "agree", "ahead",
  "alarm", "album", "alert", "alike", "alive", "allow", "alone", "along", "alter", "amber",
  "amuse", "anchor", "angel", "angle", "angry", "animal", "ankle", "answer", "apple", "apron",
  "arctic", "arena", "argue", "arise", "armor", "arrow", "artist", "aspect", "assist", "assume",
  "atlas", "attack", "attend", "attic", "audio", "audit", "autumn", "avoid", "awake", "award",
  "aware", "awful", "backup", "bacon", "badge", "badger", "baker", "ballot", "banana", "banner",
  "barrel", "basket", "battle", "beacon", "beast", "beaver", "beauty", "behave", "behind", "belief",
  "below", "bench", "berry", "beyond", "bible", "bicycle", "binder", "biped", "birth", "biscuit",
  "bison", "bitter", "blade", "blanket", "blast", "blaze", "blend", "blink", "block", "blossom",
  "board", "boast", "body", "boiler", "bold", "bolt", "bonus", "border", "bottle", "bottom",
  "bound", "bounty", "brain", "branch", "brave", "bread", "breeze", "brick", "bridge", "brief",
  "bright", "brisk", "bronze", "brush", "bubble", "bucket", "budget", "buffer", "bugle", "bullet",
  "bundle", "burden", "butter", "cabin", "cable", "cactus", "cage", "cake", "calm", "camel",
  "camera", "camp", "canal", "canary", "candle", "candy", "canyon", "canvas", "cap", "cape",
  "caravan", "carbon", "card", "cargo", "carpet", "carrot", "cart", "carve", "case", "castle",
  "casual", "cat", "catch", "cater", "cattle", "cause", "cave", "caviar", "cedar", "celery",
  "cello", "cement", "census", "center", "cereal", "chain", "chair", "chalk", "chamber", "chance",
  "change", "channel", "chaos", "chapel", "chapter", "charge", "charity", "charm", "chart", "chase",
  "cheap", "cheat", "check", "cheek", "cheer", "cheese", "cherry", "chest", "chief", "child",
  "chime", "chin", "chip", "chirp", "choir", "choose", "chord", "chorus", "chrome", "cider",
  "cigar", "cinema", "circle", "circus", "citizen", "city", "civil", "claim", "clamp", "clan",
  "clash", "clasp", "clay", "clean", "clear", "clever", "click", "client", "cliff", "climate",
  "climb", "clinic", "clip", "clock", "close", "cloth", "cloud", "clover", "clown", "club",
  "clump", "cluster", "coach", "coal", "coast", "cobalt", "cobra", "coconut", "cocoon", "code",
  "coffee", "coffin", "coil", "coin", "cold", "collar", "colony", "color", "column", "combat",
  "comedy", "comet", "comfort", "comic", "commit", "common"
];

/**
 * Selects 10 random words from WORD_LIST
 * @returns {string[]} An array of 10 random words
 */
export const generateRecoveryPhrase = () => {
  const words = [];
  const crypto = window.crypto || window.msCrypto;
  
  if (crypto && crypto.getRandomValues) {
    const randomValues = new Uint32Array(10);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 10; i++) {
      const index = randomValues[i] % WORD_LIST.length;
      words.push(WORD_LIST[index]);
    }
  } else {
    // Fallback if crypto isn't available (should not happen in modern electron/browsers)
    for (let i = 0; i < 10; i++) {
      const index = Math.floor(Math.random() * WORD_LIST.length);
      words.push(WORD_LIST[index]);
    }
  }
  return words;
};
