import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import AssistantComposer from "./AssistantComposer";
import AssistantMessageList from "./AssistantMessageList";
import AssistantQuickActions from "./AssistantQuickActions";
import {
  getAssistantQuickActions,
  getAssistantUiCopy,
  getQuickActionPrompt,
  getPageContextFromPath
} from "./assistantConfig";
import { useAssistantActionRouter } from "./useAssistantActionRouter";
import { useAssistantConversation } from "./useAssistantConversation";

function AssistantHero() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const feedRef = useRef(null);
  const { currentLanguage } = useLanguage();
  const uiCopy = getAssistantUiCopy(currentLanguage);
  const quickActions = getAssistantQuickActions(currentLanguage);

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
    source: "hero",
    language: currentLanguage,
    pageContext: context.pageContext,
    pageSlug: context.pageSlug,
    sessionId: conversation.sessionId,
    navigate
  });

  useEffect(() => {
    conversation.ensureWelcomeMessage();
  }, [conversation.ensureWelcomeMessage]);

  useEffect(() => {
    if (!feedRef.current) {
      return;
    }

    const feedNode = feedRef.current;
    if (conversation.messages.length <= 1 && !conversation.isSending) {
      feedNode.scrollTop = 0;
      return;
    }

    feedNode.scrollTop = feedNode.scrollHeight;
  }, [conversation.isSending, conversation.messages]);

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

  return (
    <article className="card assistant-hero-card">
      <div className="assistant-hero-header">
        <span className="eyebrow">{uiCopy.heroEyebrow}</span>
        <h2 className="assistant-hero-title">{uiCopy.heroTitle}</h2>
        <p className="assistant-hero-subtitle">{uiCopy.heroSubtitle}</p>
      </div>

      <AssistantQuickActions
        title={uiCopy.quickActionsTitle}
        actions={quickActions}
        onSelect={handleQuickAction}
        disabled={conversation.isSending}
      />

      <AssistantMessageList
        messages={conversation.messages}
        isSending={conversation.isSending}
        thinkingLabel={uiCopy.thinking}
        intentLabels={uiCopy.intentLabels}
        recommendationLabel={uiCopy.recommendationLabel}
        openRecommendationLabel={uiCopy.openRecommendation}
        onActionClick={actionRouter.handleActionClick}
        emptyState={uiCopy.emptyState}
        className="assistant-feed-hero"
        feedRef={feedRef}
      />

      {conversation.error ? <p className="assistant-error">{conversation.error}</p> : null}

      <AssistantComposer
        inputId="assistant-hero-input"
        inputLabel={uiCopy.inputLabel}
        placeholder={uiCopy.placeholder}
        value={conversation.inputValue}
        onChange={conversation.setInputValue}
        onSubmit={handleSubmit}
        isSending={conversation.isSending}
        sendLabel={uiCopy.send}
        inputRef={inputRef}
        className="assistant-form-hero"
      />
    </article>
  );
}

export default AssistantHero;
