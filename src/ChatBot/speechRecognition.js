// speechRecognition.js

let recognition = null;
let isListening = false;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

/**
 * Start listening for voice input
 * @param {Function} callback Receives recognized text
 */
export const startListening = (callback) => {
  if (!recognition) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  if (isListening) return;

  isListening = true;

  recognition.start();

  recognition.onstart = () => {
    console.log("🎤 Listening...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();

    console.log("User said:", transcript);

    callback(transcript);
  };

  recognition.onerror = (event) => {
    console.log("Speech Recognition Error:", event.error);
    isListening = false;
  };

  recognition.onend = () => {
    console.log("🎤 Listening stopped");
    isListening = false;
  };
};

/**
 * Stop listening manually
 */
export const stopListening = () => {
  if (!recognition) return;

  recognition.stop();
  isListening = false;
};

/**
 * Returns whether recognition is active
 */
export const isRecognitionActive = () => {
  return isListening;
};