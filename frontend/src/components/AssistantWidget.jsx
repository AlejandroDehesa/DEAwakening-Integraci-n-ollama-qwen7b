import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import AssistantComposer from "./assistant/AssistantComposer";
import AssistantMessageList from "./assistant/AssistantMessageList";
import AssistantQuickActions from "./assistant/AssistantQuickActions";
import {
  ASSISTANT_USER_NAME_STORAGE_KEY,
  getAssistantQuickActions,
  getAssistantUiCopy,
  getQuickActionPrompt,
  getPageContextFromPath
} from "./assistant/assistantConfig";
import { useAssistantActionRouter } from "./assistant/useAssistantActionRouter";
import { useAssistantConversation } from "./assistant/useAssistantConversation";

const MAX_USER_NAME_LENGTH = 60;
const ASSISTANT_NAME_RESET_ONCE_KEY = "deawakening-assistant-name-reset-once-v3";
const REMOVED_ASSISTANT_USER_NAMES = new Set(["maricarmen"]);

function sanitizeUserName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_USER_NAME_LENGTH);
}

function shouldRemoveStoredUserName(value) {
  return REMOVED_ASSISTANT_USER_NAMES.has(String(value || "").trim().toLowerCase());
}

function loadStoredUserName() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const resetDone = window.localStorage.getItem(ASSISTANT_NAME_RESET_ONCE_KEY) === "1";
    if (!resetDone) {
      window.localStorage.removeItem(ASSISTANT_USER_NAME_STORAGE_KEY);
      window.localStorage.setItem(ASSISTANT_NAME_RESET_ONCE_KEY, "1");
    }

    const storedUserName = sanitizeUserName(
      window.localStorage.getItem(ASSISTANT_USER_NAME_STORAGE_KEY) || ""
    );
    if (shouldRemoveStoredUserName(storedUserName)) {
      window.localStorage.removeItem(ASSISTANT_USER_NAME_STORAGE_KEY);
      return "";
    }

    return storedUserName;
  } catch {
    return "";
  }
}

function saveStoredUserName(name) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(ASSISTANT_USER_NAME_STORAGE_KEY, name);
    window.dispatchEvent(
      new CustomEvent("assistant:user-name-updated", {
        detail: { userName: name }
      })
    );
  } catch {
    // Keep UX working even if localStorage is unavailable.
  }
}

function buildWelcomeMessage(uiCopy, userName) {
  if (uiCopy.welcomeNamed && userName) {
    return uiCopy.welcomeNamed.replace("{name}", userName);
  }

  return uiCopy.welcome;
}

function AssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const portalInputRef = useRef(null);
  const feedRef = useRef(null);
  const { currentLanguage, setLanguage } = useLanguage();
  const uiCopy = getAssistantUiCopy(currentLanguage);
  const quickActions = getAssistantQuickActions(currentLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalUnlocked, setIsPortalUnlocked] = useState(false);
  const [storedUserName, setStoredUserName] = useState(loadStoredUserName);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const assistantAvatarSrc = "/david-hero.jpg";
  const assistantName = "David";
  const assistantTagline =
    currentLanguage === "es"
      ? "Asistente de bienestar, eventos y primera visita"
      : currentLanguage === "de"
        ? "Assistent fuer Wohlbefinden, Events und den ersten Besuch"
        : "Wellbeing assistant for events and first-time guidance";

  const context = useMemo(
    () => getPageContextFromPath(location.pathname),
    [location.pathname]
  );

  const welcomeMessage = useMemo(
    () => buildWelcomeMessage(uiCopy, storedUserName),
    [storedUserName, uiCopy]
  );

  const conversation = useAssistantConversation({
    language: currentLanguage,
    pageContext: context.pageContext,
    pageSlug: context.pageSlug,
    userName: storedUserName,
    welcomeMessage
  });

  const actionRouter = useAssistantActionRouter({
    source: "widget",
    language: currentLanguage,
    pageContext: context.pageContext,
    pageSlug: context.pageSlug,
    sessionId: conversation.sessionId,
    navigate,
    onAfterInternalNavigate: () => setIsOpen(false)
  });

  const isAdminArea = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isOpen || !isPortalUnlocked) {
      return;
    }

    conversation.ensureWelcomeMessage();
  }, [conversation.ensureWelcomeMessage, isOpen, isPortalUnlocked]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        if (isPortalUnlocked) {
          inputRef.current?.focus();
          return;
        }

        portalInputRef.current?.focus();
      },
      isPortalUnlocked ? 30 : 20
    );

    return () => window.clearTimeout(timer);
  }, [isOpen, isPortalUnlocked]);

  useEffect(() => {
    if (!isOpen || !isPortalUnlocked || !feedRef.current) {
      return;
    }

    feedRef.current.scrollTop = 0;
  }, [isOpen, isPortalUnlocked]);

  useEffect(() => {
    if (!isOpen || !isPortalUnlocked || !feedRef.current) {
      return;
    }

    const feedNode = feedRef.current;
    if (conversation.messages.length <= 1 && !conversation.isSending) {
      feedNode.scrollTop = 0;
      return;
    }

    feedNode.scrollTop = feedNode.scrollHeight;
  }, [conversation.isSending, conversation.messages, isOpen, isPortalUnlocked]);

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

  useEffect(() => {
    function onOpenRequest() {
      const nextStoredName = loadStoredUserName();
      setIsOpen(true);
      setStoredUserName(nextStoredName);
      setNameInput(nextStoredName);
      setNameError("");
      setIsPortalUnlocked(Boolean(nextStoredName));
    }

    window.addEventListener("assistant:open", onOpenRequest);
    return () => window.removeEventListener("assistant:open", onOpenRequest);
  }, []);

  function handleClose() {
    setIsOpen(false);
    setIsPortalUnlocked(false);
    setNameError("");
  }

  function handlePortalUnlock(event) {
    event.preventDefault();

    const nextName = sanitizeUserName(nameInput);
    if (!nextName) {
      setNameError(uiCopy.portalNameRequired);
      return;
    }

    saveStoredUserName(nextName);
    setStoredUserName(nextName);
    setNameInput(nextName);
    setNameError("");
    setIsPortalUnlocked(true);
  }

  async function handleQuickAction(actionItem) {
    const promptText = getQuickActionPrompt(actionItem);
    if (!promptText) {
      return;
    }

    actionRouter.handleQuickActionClick(actionItem);
    try {
      await conversation.sendQuickAction(promptText);
    } catch {
      // Error is already handled in local state.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await conversation.sendInputMessage();
    } catch {
      // Error is already handled in local state.
    }
  }

  if (isAdminArea) {
    return null;
  }

  return (
    <div className="assistant-widget-shell">
      {isOpen ? (
        <>
          <button
            type="button"
            className="assistant-backdrop"
            onClick={handleClose}
            aria-label={uiCopy.close}
          />
          <section
            id="assistant-panel"
            className="assistant-panel"
            role="dialog"
            aria-modal="true"
            aria-label={uiCopy.widgetTitle}
          >
            <header className="assistant-panel-header">
              <div className="assistant-agent">
                <img
                  className="assistant-agent-avatar"
                  src={assistantAvatarSrc}
                  alt={assistantName}
                />
                <div className="assistant-agent-meta">
                  <p className="assistant-panel-title">{assistantName}</p>
                  <p className="assistant-panel-subtitle">{assistantTagline}</p>
                </div>
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

            {!isPortalUnlocked ? (
              <section className="assistant-portal" aria-live="polite">
                <h3 className="assistant-portal-title">{uiCopy.portalNameTitle}</h3>
                <p className="assistant-portal-subtitle">{uiCopy.portalNameSubtitle}</p>
                <div
                  className="language-switcher assistant-portal-language-switcher"
                  aria-label="Language switcher"
                >
                  <button
                    className={
                      currentLanguage === "en"
                        ? "language-option language-option-active"
                        : "language-option"
                    }
                    type="button"
                    onClick={() => setLanguage("en")}
                  >
                    EN
                  </button>
                  <button
                    className={
                      currentLanguage === "es"
                        ? "language-option language-option-active"
                        : "language-option"
                    }
                    type="button"
                    onClick={() => setLanguage("es")}
                  >
                    ES
                  </button>
                  <button
                    className={
                      currentLanguage === "de"
                        ? "language-option language-option-active"
                        : "language-option"
                    }
                    type="button"
                    onClick={() => setLanguage("de")}
                  >
                    DE
                  </button>
                </div>
                <form className="assistant-portal-form" onSubmit={handlePortalUnlock}>
                  <label className="sr-only" htmlFor="assistant-user-name">
                    {uiCopy.portalNameTitle}
                  </label>
                  <input
                    id="assistant-user-name"
                    ref={portalInputRef}
                    type="text"
                    value={nameInput}
                    onChange={(event) => {
                      setNameInput(event.target.value);
                      if (nameError) {
                        setNameError("");
                      }
                    }}
                    placeholder={uiCopy.portalNamePlaceholder}
                    maxLength={MAX_USER_NAME_LENGTH}
                  />
                  {nameError ? (
                    <p className="assistant-error assistant-portal-error">{nameError}</p>
                  ) : null}
                  <div className="assistant-portal-actions">
                    <button type="submit" className="btn btn-primary">
                      {uiCopy.portalNameAction}
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <>
                <AssistantMessageList
                  messages={conversation.messages}
                  isSending={conversation.isSending}
                  thinkingLabel={uiCopy.thinking}
                  intentLabels={uiCopy.intentLabels}
                  recommendationLabel={uiCopy.recommendationLabel}
                  openRecommendationLabel={uiCopy.openRecommendation}
                  onActionClick={actionRouter.handleActionClick}
                  emptyState={uiCopy.emptyState}
                  feedRef={feedRef}
                  showAssistantAvatar
                  assistantAvatarSrc={assistantAvatarSrc}
                  assistantAvatarAlt={assistantName}
                />

                {conversation.error ? <p className="assistant-error">{conversation.error}</p> : null}

                <AssistantQuickActions
                  title={null}
                  actions={quickActions}
                  onSelect={handleQuickAction}
                  disabled={conversation.isSending}
                  className="assistant-quick-actions-widget assistant-quick-actions-widget-bottom"
                />

                <AssistantComposer
                  inputId="assistant-input"
                  inputLabel={uiCopy.inputLabel}
                  placeholder={uiCopy.placeholder}
                  value={conversation.inputValue}
                  onChange={conversation.setInputValue}
                  onSubmit={handleSubmit}
                  isSending={conversation.isSending}
                  sendLabel={uiCopy.send}
                  inputRef={inputRef}
                />
              </>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default AssistantWidget;
