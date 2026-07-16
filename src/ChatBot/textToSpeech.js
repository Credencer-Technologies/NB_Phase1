let voices = [];

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}

loadVoices();

window.speechSynthesis.onvoiceschanged = loadVoices;

// Remove emojis before speaking
const cleanText = (text) => {
  return text
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
};

export const speak = (text, onEnd) => {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText(text));

  utterance.lang = "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  const femaleVoice =
    voices.find(v =>
      ["Aria", "Jenny", "Sonia", "Samantha", "Zira", "Google"]
        .some(name => v.name.includes(name))
    ) ||
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.lang.startsWith("en"));

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};