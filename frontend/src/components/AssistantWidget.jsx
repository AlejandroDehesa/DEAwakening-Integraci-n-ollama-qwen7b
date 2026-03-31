import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import AssistantComposer from "./assistant/AssistantComposer";
import AssistantMessageList from "./assistant/AssistantMessageList";
import AssistantQuickActions from "./assistant/AssistantQuickActions";
import {
  getAssistantQuickActions,
  getAssistantUiCopy,
  getQuickActionPrompt,
  getPageContextFromPath
} from "./assistant/assistantConfig";
import { useAssistantActionRouter } from "./assistant/useAssistantActionRouter";
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
  const assistantAvatarSrc = "/david-hero.jpg";
  const assistantName = "David";
  const assistantTagline =
    currentLanguage === "es"
      ? "Asistente de bienestar, eventos y primera visita"
      : currentLanguage === "de"
        ? "Assistent für Wohlbefinden, Events und den ersten Besuch"
        : "Wellbeing assistant for events and first-time guidance";

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

  useEffect(() => {
    function onOpenRequest() {
      setIsOpen(true);
    }

    window.addEventListener("assistant:open", onOpenRequest);
    return () => window.removeEventListener("assistant:open", onOpenRequest);
  }, []);

  function handleClose() {
    setIsOpen(false);
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
                ×
              </button>
            </header>

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
          </section>
        </>
      ) : null}
    </div>
  );
}

export default AssistantWidget;
