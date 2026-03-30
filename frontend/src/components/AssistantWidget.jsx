import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { sendAssistantChat } from "../services/assistantService";

const SESSION_STORAGE_KEY = "deawakening-assistant-session-id";

const uiCopyByLanguage = {
  en: {
    launcher: "Guide",
    title: "DEAwakening Guide",
    subtitle: "Ask anything about events, David, or the work.",
    welcome:
      "Hi, I am your DEAwakening guide. I can help you find events, understand the approach, or navigate the site.",
    inputLabel: "Assistant message",
    placeholder: "Ask your question...",
    send: "Send",
    thinking: "Thinking...",
    close: "Close assistant",
    error: "I could not answer right now. Please try again in a moment."
  },
  es: {
    launcher: "Guia",
    title: "Guia DEAwakening",
    subtitle: "Pregunta sobre eventos, David o el enfoque.",
    welcome:
      "Hola, soy tu guia de DEAwakening. Puedo ayudarte a encontrar eventos, entender el enfoque o navegar la web.",
    inputLabel: "Mensaje al asistente",
    placeholder: "Escribe tu pregunta...",
    send: "Enviar",
    thinking: "Pensando...",
    close: "Cerrar asistente",
    error: "Ahora mismo no he podido responder. Intentalo de nuevo en unos segundos."
  },
  de: {
    launcher: "Guide",
    title: "DEAwakening Guide",
    subtitle: "Frage nach Events, David oder dem Ansatz.",
    welcome:
      "Hallo, ich bin dein DEAwakening Guide. Ich helfe dir bei Events, dem Ansatz und der Navigation auf der Seite.",
    inputLabel: "Nachricht an den Assistenten",
    placeholder: "Stelle deine Frage...",
    send: "Senden",
    thinking: "Wird vorbereitet...",
    close: "Assistent schliessen",
    error: "Ich konnte gerade nicht antworten. Bitte versuche es gleich erneut."
  }
};

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `assistant-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return createSessionId();
  }

  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const next = createSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
  } catch {
    return createSessionId();
  }
}

function getPageContextFromPath(pathname) {
  if (pathname === "/") {
    return { pageContext: "home", pageSlug: null };
  }

  if (pathname === "/events") {
    return { pageContext: "events", pageSlug: null };
  }

  if (pathname.startsWith("/events/")) {
    const slug = pathname.replace("/events/", "").trim();
    if (!slug) {
      return { pageContext: "events", pageSlug: null };
    }

    return {
      pageContext: "event-detail",
      pageSlug: slug
    };
  }

  if (pathname === "/about") {
    return { pageContext: "about", pageSlug: null };
  }

  if (pathname === "/mi-libro") {
    return { pageContext: "book", pageSlug: null };
  }

  if (pathname === "/contact") {
    return { pageContext: "contact", pageSlug: null };
  }

  if (pathname === "/host-an-event") {
    return { pageContext: "host-event", pageSlug: null };
  }

  return { pageContext: null, pageSlug: null };
}

function messageId() {
  return `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function normalizeActionTarget(action) {
  if (!action?.target || typeof action.target !== "string") {
    return null;
  }

  if (action.type === "event" && !action.target.startsWith("/")) {
    return `/events/${action.target}`;
  }

  return action.target;
}

function AssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const uiCopy = uiCopyByLanguage[currentLanguage] || uiCopyByLanguage.en;
  const [sessionId] = useState(getOrCreateSessionId);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const feedRef = useRef(null);

  const context = useMemo(
    () => getPageContextFromPath(location.pathname),
    [location.pathname]
  );

  const isAdminArea = location.pathname.startsWith("/admin");

  function appendMessages(nextMessages) {
    setMessages((current) => [...current, ...nextMessages].slice(-14));
  }

  function ensureWelcomeMessage() {
    setMessages((current) => {
      if (current.length > 0) {
        return current;
      }

      return [
        {
          id: messageId(),
          role: "assistant",
          text: uiCopy.welcome,
          suggestedActions: [],
          relatedLinks: []
        }
      ];
    });
  }

  function handleToggle() {
    setIsOpen((current) => {
      const next = !current;
      if (next) {
        ensureWelcomeMessage();
      }
      return next;
    });
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleActionClick(action) {
    const target = normalizeActionTarget(action);
    if (!target) {
      return;
    }

    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(target);
    setIsOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSending) {
      return;
    }

    const userMessage = inputValue.trim();
    if (!userMessage) {
      return;
    }

    setInputValue("");
    setError("");

    appendMessages([
      {
        id: messageId(),
        role: "user",
        text: userMessage
      }
    ]);

    try {
      setIsSending(true);
      const assistantData = await sendAssistantChat({
        message: userMessage,
        language: currentLanguage,
        sessionId,
        pageContext: context.pageContext,
        pageSlug: context.pageSlug
      });

      appendMessages([
        {
          id: messageId(),
          role: "assistant",
          text: assistantData.answer,
          pageIntent: assistantData.pageIntent || assistantData.intent || "guidance",
          confidence: assistantData.confidence,
          suggestedActions:
            assistantData.suggestedActions || assistantData.suggestedCtas || [],
          relatedLinks: assistantData.relatedLinks || []
        }
      ]);
    } catch (requestError) {
      setError(requestError.message || uiCopy.error);
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !feedRef.current) {
      return;
    }

    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (isAdminArea) {
    return null;
  }

  return (
    <div className="assistant-widget-shell">
      <button
        type="button"
        className="assistant-launcher"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="assistant-panel"
      >
        {uiCopy.launcher}
      </button>

      {isOpen ? (
        <section
          id="assistant-panel"
          className="assistant-panel"
          role="dialog"
          aria-label={uiCopy.title}
        >
          <header className="assistant-panel-header">
            <div>
              <p className="assistant-panel-title">{uiCopy.title}</p>
              <p className="assistant-panel-subtitle">{uiCopy.subtitle}</p>
            </div>
            <button
              type="button"
              className="assistant-close"
              onClick={handleClose}
              aria-label={uiCopy.close}
            >
              x
            </button>
          </header>

          <div className="assistant-feed" ref={feedRef} aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? "assistant-message assistant-message-user"
                    : "assistant-message assistant-message-assistant"
                }
              >
                <p>{message.text}</p>

                {message.role === "assistant" && message.pageIntent ? (
                  <small className="assistant-meta">
                    {message.pageIntent}
                    {typeof message.confidence === "number"
                      ? ` · ${Math.round(message.confidence * 100)}%`
                      : ""}
                  </small>
                ) : null}

                {Array.isArray(message.suggestedActions) &&
                message.suggestedActions.length > 0 ? (
                  <div className="assistant-actions">
                    {message.suggestedActions.map((action) => (
                      <button
                        key={`${action.type}-${action.target}-${action.label}`}
                        type="button"
                        className="assistant-action"
                        onClick={() => handleActionClick(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {Array.isArray(message.relatedLinks) &&
                message.relatedLinks.length > 0 ? (
                  <div className="assistant-links">
                    {message.relatedLinks.map((link) => {
                      const internal = link.target.startsWith("/");
                      if (internal) {
                        return (
                          <button
                            key={`${link.label}-${link.target}`}
                            type="button"
                            className="assistant-link-button"
                            onClick={() =>
                              handleActionClick({
                                type: "route",
                                label: link.label,
                                target: link.target
                              })
                            }
                          >
                            {link.label}
                          </button>
                        );
                      }

                      return (
                        <a
                          key={`${link.label}-${link.target}`}
                          href={link.target}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            ))}

            {isSending ? (
              <article className="assistant-message assistant-message-assistant">
                <p>{uiCopy.thinking}</p>
              </article>
            ) : null}
          </div>

          {error ? <p className="assistant-error">{error}</p> : null}

          <form className="assistant-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="assistant-input">
              {uiCopy.inputLabel}
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={uiCopy.placeholder}
              maxLength={4000}
            />
            <button type="submit" className="btn btn-primary" disabled={isSending}>
              {uiCopy.send}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

export default AssistantWidget;
