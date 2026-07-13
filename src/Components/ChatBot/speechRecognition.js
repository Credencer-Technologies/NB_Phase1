// speechRecognition.js

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
}

export const startListening = (onResult, onEnd) => {
  if (!recognition) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    if (onEnd) onEnd();
  };
};