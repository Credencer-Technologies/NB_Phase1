// speech.js

let currentUtterance = null;

// Clean text before speaking
const cleanSpeechText = (text) => {
  return text
    // Remove emojis
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")

    // Remove markdown
    .replace(/[*_`>#-]/g, "")

    // Remove bullets
    .replace(/•/g, "")

    // Remove extra spaces
    .replace(/\n+/g, ". ")

    // Replace symbols
    .replace(/&/g, "and")
    .replace(/\//g, " or ")

    // Remove URLs
    .replace(/https?:\/\/\S+/g, "")

    // Remove multiple spaces
    .replace(/\s+/g, " ")

    .trim();
};

// Pick best available voice
const getBestVoice = () => {
  const voices = window.speechSynthesis.getVoices();

  if (!voices.length) return null;

  // Female voices priority
  const femaleKeywords = [
    "female",
    "zira",
    "heera",
    "samantha",
    "aria",
    "jenny",
    "neerja",
    "veena",
    "hazel",
    "susan"
  ];

  // English India Female
  let voice = voices.find(
    (v) =>
      v.lang === "en-IN" &&
      femaleKeywords.some((name) =>
        v.name.toLowerCase().includes(name)
      )
  );

  // Any English Female
  if (!voice) {
    voice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        femaleKeywords.some((name) =>
          v.name.toLowerCase().includes(name)
        )
    );
  }

  // Fallback
  if (!voice) {
    voice = voices.find((v) => v.lang === "en-IN");
  }

  return voice;
};

export const speakText = (text) => {
  if (!text) return;

  // Stop previous speech
  window.speechSynthesis.cancel();

  const cleanText = cleanSpeechText(text);

  currentUtterance = new SpeechSynthesisUtterance(cleanText);

  currentUtterance.lang = "en-IN";
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;

  const applyVoice = () => {
    const voice = getBestVoice();

    if (voice) {
      currentUtterance.voice = voice;
    }

    window.speechSynthesis.speak(currentUtterance);
  };

  // Chrome loads voices asynchronously
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = applyVoice;
  } else {
    applyVoice();
  }
};

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

export const isSpeaking = () => {
  return window.speechSynthesis.speaking;
};

export const toggleSpeech = (text) => {
  if (window.speechSynthesis.speaking) {
    stopSpeaking();
  } else {
    speakText(text);
  }
};