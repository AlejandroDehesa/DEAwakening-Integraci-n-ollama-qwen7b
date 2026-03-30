import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import AssistantComposer from "./assistant/AssistantComposer";
import AssistantMessageList from "./assistant/AssistantMessageList";
import AssistantQuickActions from "./assistant/AssistantQuickActions";
import {
  getAssistantQuickActions,
  getAssistantUiCopy,
  getPageContextFromPath,
  normalizeActionTarget
} from "./assistant/assistantConfig";
import { useAssistantConversation } from "./assistant/useAssistantConversation";

function AssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const feedRef = useRef(null);
  const { currentLanguage } = useLanguage();
  const uiCopy = getAssistantUiCopy(currentLanguage);
  const quickActions = getAssistantQuickActions(currentLanguage);
  const [isOpen, setIsOpen] = useState(false);

  const context = useMemo(
    () => getPageContextFromPath(location.pathname),
    [location.pathname]
  );

  const conversation = useAssistantConversation({
    language: currentLanguage,
    pageContext: context.pageContext,
    pageSlug: context.pageSlug,
    welcomeMessage: uiCopy.welcome
  });

  const isAdminArea = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    conversation.ensureWelcomeMessage();
  }, [conversation.ensureWelcomeMessage, isOpen]);

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
  }, [conversation.messages, conversation.isSending, isOpen]);

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

  function handleToggle() {
    setIsOpen((current) => !current);
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

  async function handleQuickAction(promptText) {
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
          aria-label={uiCopy.widgetTitle}
        >
          <header className="assistant-panel-header">
            <div>
              <p className="assistant-panel-title">{uiCopy.widgetTitle}</p>
              <p className="assistant-panel-subtitle">{uiCopy.widgetSubtitle}</p>
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

          <AssistantQuickActions
            title={uiCopy.quickActionsTitle}
            actions={quickActions}
            onSelect={handleQuickAction}
            disabled={conversation.isSending}
            className="assistant-quick-actions-widget"
          />

          <AssistantMessageList
            messages={conversation.messages}
            isSending={conversation.isSending}
            thinkingLabel={uiCopy.thinking}
            intentLabels={uiCopy.intentLabels}
            recommendationLabel={uiCopy.recommendationLabel}
            openRecommendationLabel={uiCopy.openRecommendation}
            onActionClick={handleActionClick}
            emptyState={uiCopy.emptyState}
            feedRef={feedRef}
          />

          {conversation.error ? <p className="assistant-error">{conversation.error}</p> : null}

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
        </section>
      ) : null}
    </div>
  );
}

export default AssistantWidget;
