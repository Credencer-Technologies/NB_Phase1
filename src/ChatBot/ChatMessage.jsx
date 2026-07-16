import "./ChatBot.css";

function ChatMessage({ sender, text, actions, providers, onAction }) {
  const isBot = sender === "bot";

  return (
    <div className={`message-wrapper ${isBot ? "bot" : "user"}`}>
      <div className={`message-bubble ${isBot ? "bot-message" : "user-message"}`}>
        <div className="message-content">
          {text.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        {providers && providers.length > 0 && (
          <div className="provider-cards-list">
            {providers.map((p) => (
              <div className="provider-mini-card" key={p.id}>
                <div className="provider-mini-avatar">{p.name.charAt(0)}</div>
                <div className="provider-mini-info">
                  <strong>{p.name}</strong>
                  <span>{p.city} • ⭐ {p.rating} • {p.experience}</span>
                  <span className="provider-mini-price">{p.price}</span>
                </div>
                <button
                  type="button"
                  className="provider-mini-view-btn"
                  onClick={() => onAction && onAction({ type: "navigate", value: `/provider-profile/${p.id}` })}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="message-actions-row">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className="message-action-btn"
                onClick={() => onAction && onAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <span className="message-time">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export default ChatMessage;