import { SUGGESTIONS } from "./constants";
import {
  FaSearch,
  FaCalendarCheck,
  FaUserTie,
  FaQuestionCircle,
  FaPhoneAlt,
} from "react-icons/fa";

const iconMap = {
  "Find Services": <FaSearch />,
  "Book a Service": <FaCalendarCheck />,
  "Become a Provider": <FaUserTie />,
  "FAQs": <FaQuestionCircle />,
  "Contact Us": <FaPhoneAlt />,
};

export default function SuggestedReplies({ onSelect }) {
  return (
    <div className="suggestions">
      {SUGGESTIONS.map((item, index) => (
        <button
          key={index}
          className="suggestion-btn"
          onClick={() => onSelect(item)}
        >
          <span className="btn-icon">
            {iconMap[item]}
          </span>

          <span>{item}</span>
        </button>
      ))}
    </div>
  );
}