import "./ChatBot.css";

function QuickReplies({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="quick-replies">
      {options.map((option, index) => (
        <button
          key={index}
          className="quick-reply-btn"
          onClick={() => onSelect(option)}
        >
          {getIcon(option)}
          <span>{option}</span>
        </button>
      ))}
    </div>
  );
}

function getIcon(option) {
  switch (option) {
    case "Find a Service":
      return "🔍";

    case "Become a Provider":
      return "👩‍💼";

    case "Booking Help":
      return "📅";

   

    case "FAQs":
      return "❓";

    case "Beauty & Wellness":
      return "💄";

    case "Mehndi & Bridal":
      return "💍";

    case "Fashion":
      return "👗";

    case "Education":
      return "📚";

    case "Yoga & Fitness":
      return "🧘";

    case "Photography":
      return "📸";

    case "Home Services":
      return "🏠";

    default:
      return "👉";
  }
}

export default QuickReplies;