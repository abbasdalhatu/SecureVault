// Web Speech Synthesis and Recognition Wrappers

// Language code mappings for Speech Synthesis and Recognition
const languageVoiceMapping = {
  hawaiian: { primary: "haw-US", fallback: "it-IT", voiceNameKeywords: ["hawaiian", "italian", "alice"] }, // Italian has identical vowel structure (a, e, i, o, u)
  irish: { primary: "ga-IE", fallback: "en-GB", voiceNameKeywords: ["irish", "gaelge", "scottish", "british", "daniel"] },
  basque: { primary: "eu-ES", fallback: "es-ES", voiceNameKeywords: ["basque", "euskara", "spanish", "helena"] }, // Spanish voice handles Basque spelling perfectly
  quechua: { primary: "qu-PE", fallback: "es-PE", voiceNameKeywords: ["quechua", "spanish", "mexican", "sabin"] }, // Peruvian Spanish voice is a great fit
  spanish: { primary: "es-ES", fallback: "es-MX", voiceNameKeywords: ["spanish", "castilian", "monica"] },
  japanese: { primary: "ja-JP", fallback: "ja", voiceNameKeywords: ["japanese", "haruka"] }
};

export const getAvailableVoices = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
};

export const speakText = (text, languageId) => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this browser.");
      resolve(false);
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    const config = languageVoiceMapping[languageId] || { primary: "en-US", fallback: "en-US", voiceNameKeywords: [] };
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find matching voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    // 1. Try finding primary lang code match
    selectedVoice = voices.find(v => v.lang.toLowerCase() === config.primary.toLowerCase());

    // 2. Try finding fallback lang code match
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.toLowerCase() === config.fallback.toLowerCase() || v.lang.startsWith(config.fallback.split("-")[0]));
    }

    // 3. Try searching by keywords in voice name
    if (!selectedVoice && config.voiceNameKeywords.length > 0) {
      selectedVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        return config.voiceNameKeywords.some(keyword => name.includes(keyword));
      });
    }

    // Assign voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = config.primary; // default to primary code
    }

    // Configure tone & speed (slower for learning)
    utterance.rate = 0.85; 
    utterance.pitch = 1.0;

    utterance.onend = () => resolve(true);
    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
};

// Fuzzy match calculator for speaking validation
// This lowers stress by being generous with accents, punctuation, and slight pronunciation errors.
export const checkSpeechMatch = (spoken, expected) => {
  if (!spoken || !expected) return { match: false, score: 0 };

  const clean = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[ʻ'’‘`´]/g, "") // remove okina/glottal marks and apostrophes
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "") // remove punctuation
      .replace(/\s+/g, " ") // normalize spacing
      .trim();
  };

  const cleanSpoken = clean(spoken);
  const cleanExpected = clean(expected);

  if (cleanSpoken === cleanExpected) {
    return { match: true, score: 100 };
  }

  // Check substring overlap
  if (cleanExpected.includes(cleanSpoken) && cleanSpoken.length > 3) {
    return { match: true, score: 85 };
  }

  // Calculate Levenshtein Distance similarity
  const distance = levenshteinDistance(cleanSpoken, cleanExpected);
  const maxLength = Math.max(cleanSpoken.length, cleanExpected.length);
  const similarity = maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100;

  // If match similarity is 65% or more, count it as correct (to support anxious speakers)
  return {
    match: similarity >= 65,
    score: Math.round(similarity)
  };
};

const levenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return matrix[a.length][b.length];
};

// Web Speech Recognition Wrapper
export class SpeechRecognitionManager {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  start(languageId, onResult, onError, onEnd) {
    if (!this.recognition) {
      onError("Speech Recognition not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    if (this.isListening) {
      this.recognition.abort();
    }

    const config = languageVoiceMapping[languageId] || { primary: "en-US", fallback: "en-US" };
    // Set recognition language. If it's a rare language, the browser might not recognize it, 
    // so we set it to fallback (like es-ES for Basque/Quechua, it-IT for Hawaiian) which increases recognition accuracy significantly!
    this.recognition.lang = config.fallback || config.primary;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      onError(e.message);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}
