
import { useEffect, useState } from "react";
import "./AIExplorer.css";

const STORAGE_KEY = "wildverse-ai-conversations";

const suggestions = [
  "How do eagles hunt their prey?",
  "Why do tigers have stripes?",
  "How do deep-sea creatures glow?",
  "How do birds migrate?",
];

function createConversation() {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [],
    updatedAt: Date.now(),
  };
}

export default function AIExplorer({ onBack, selectedCreature }) {
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId] = useState(null);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  function startConversation() {
    const conversation = createConversation();
    setConversations((previous) => [conversation, ...previous]);
    setActiveId(conversation.id);
    setQuestion("");
    setError("");
  }

  function updateConversation(id, messages) {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              messages,
              title:
                conversation.title === "New conversation" &&
                messages.length > 0
                  ? messages[0].content.slice(0, 36)
                  : conversation.title,
              updatedAt: Date.now(),
            }
          : conversation
      )
    );
  }

  async function sendMessage(text = question) {
    const content = text.trim();
    if (!content || sending) return;

    let conversation = activeConversation;

    if (!conversation) {
      conversation = createConversation();
      setConversations((previous) => [conversation, ...previous]);
      setActiveId(conversation.id);
    }

    const userMessage = { role: "user", content };
    const updatedMessages = [...conversation.messages, userMessage];

    updateConversation(conversation.id, updatedMessages);
    setQuestion("");
    setSending(true);
    setError("");

    try {
      // This endpoint will be provided by the AI backend.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: conversation.messages,
          creature: selectedCreature || null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "The AI backend is not connected yet. We need to set it up before questions can be answered."
            : "The AI could not respond. Please try again."
        );
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error("The AI returned an empty response.");
      }

      updateConversation(conversation.id, [
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the AI. Check your connection and try again."
      );
    } finally {
      setSending(false);
    }
  }

  function deleteConversation(id) {
    setConversations((previous) =>
      previous.filter((conversation) => conversation.id !== id)
    );

    if (activeId === id) {
      setActiveId(null);
    }
  }

  return (
    <main className="ai-explorer">
      <aside className="ai-sidebar">
        <button className="ai-brand" onClick={onBack}>
          {/* <span className="ai-brand-mark">W</span>
          WILD<span>VERSE</span> */}
          <span className="ai-brand-mark">W</span>
          WILD<span className="ai-brand-light">VERSE</span>
        </button>

        <button className="ai-back-link" onClick={onBack}>
          ← Back to the museum
        </button>

        <button className="ai-new-chat" onClick={startConversation}>
          <span>＋</span> New conversation
        </button>

        <p className="ai-history-label">YOUR HISTORY</p>

        <div className="ai-history-list">
          {conversations
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((conversation) => (
              <div
                key={conversation.id}
                className={`ai-history-item ${
                  activeId === conversation.id ? "active" : ""
                }`}
              >
                <button
                  className="ai-history-title"
                  onClick={() => {
                    setActiveId(conversation.id);
                    setError("");
                  }}
                >
                  <span>◷</span>
                  {conversation.title}
                </button>
                <button
                  className="ai-delete-chat"
                  aria-label="Delete conversation"
                  onClick={() => deleteConversation(conversation.id)}
                >
                  ×
                </button>
              </div>
            ))}

          {conversations.length === 0 && (
            <p className="ai-history-empty">
              Your conversations will appear here.
            </p>
          )}
        </div>

        <div className="ai-sidebar-footer">
          A LITTLE CLOSER TO THE NATURAL WORLD.
        </div>
      </aside>

      <section className="ai-main">
        <header className="ai-topbar">
          <div>
            <span className="ai-status-dot" />
            WILDVERSE AI
          </div>
          <span>YOUR WILDLIFE & BIOLOGY GUIDE</span>
        </header>

        <div className="ai-chat-area">
          {!activeConversation ||
          activeConversation.messages.length === 0 ? (
            <div className="ai-welcome">
              <div className="ai-welcome-symbol">✳</div>
              <p className="ai-kicker">A CURIOSITY-DRIVEN EXPLORATION</p>
              <h1>
                The natural world
                <br />
                is full of <em>questions.</em>
              </h1>
              <p className="ai-intro">
                Ask about animal behaviour, evolution, ecosystems, or the
                extraordinary science behind life on Earth.
              </p>

              {selectedCreature && (
                <div className="ai-creature-context">
                  Exploring: <strong>{selectedCreature.name}</strong>
                </div>
              )}

              <div className="ai-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    disabled={sending}
                  >
                    <span>↗</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-messages">
              <p className="ai-kicker">FIELD NOTES / CONVERSATION</p>

              {activeConversation.messages.map((message, index) => (
                <article
                  key={`${activeConversation.id}-${index}`}
                  className={`ai-message ${message.role}`}
                >
                  <span className="ai-message-label">
                    {message.role === "user" ? "YOU" : "WILDVERSE AI"}
                  </span>
                  <p>{message.content}</p>
                </article>
              ))}

              {sending && (
                <div className="ai-thinking">
                  <span className="ai-status-dot" />
                  Exploring the science…
                </div>
              )}

              <div className="ai-bottom-anchor" />
            </div>
          )}

          {error && (
            <div className="ai-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="ai-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask something about the natural world..."
              aria-label="Your question"
              rows={2}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="ai-composer-bottom">
              <span>SCIENCE · WILDLIFE · DISCOVERY</span>
              <button
                type="submit"
                disabled={!question.trim() || sending}
                aria-label="Send question"
              >
                {sending ? "…" : "↑"}
              </button>
            </div>
          </form>
          <p className="ai-disclaimer">
            AI answers can contain errors. Verify important scientific claims
            with reliable sources.
          </p>
        </div>
      </section>
    </main>
  );
}
