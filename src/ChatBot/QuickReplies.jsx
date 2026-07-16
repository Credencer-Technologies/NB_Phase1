import "./ChatBot.css";

function QuickReplies({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="quick-replies">
      {options.map((option, index) => {
        const label = typeof option === "string" ? option : option.label;
        const value = typeof option === "string" ? option : option.value;

        return (
          <button key={index} className="quick-reply-btn" onClick={() => onSelect(value)}>
            {!startsWithEmoji(label) && <span>{getIcon(label)}</span>}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Category chips already carry a leading emoji (e.g. "💄 Beauty & Wellness") —
// avoid stacking a second one on top from getIcon().
function startsWithEmoji(label) {
  return /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(label || "");
}

function getIcon(option) {
  switch (option) {
    case "Find a Service":
      return "🔍";

    case "Become a Provider":
    case "Become Provider":
      return "👩‍💼";

    case "How to Book?":
      return "📅";

    case "Payments":
      return "💳";

    case "FAQs":
      return "❓";

    case "Cancellation Policy":
    case "Cancellation":
      return "↩️";

    case "Start Over":
      return "🔁";

    default:
      return "👉";
  }
}

export default QuickReplies;