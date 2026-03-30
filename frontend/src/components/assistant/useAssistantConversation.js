import { useCallback, useMemo, useState } from "react";
import { sendAssistantChat } from "../../services/assistantService";
import {
  SESSION_STORAGE_KEY,
  getFallbackActionByIntent
} from "./assistantConfig";

const MAX_HISTORY = 16;

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

function messageId() {
  return `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function normalizeActions(rawActions) {
  if (!Array.isArray(rawActions)) {
    return [];
  }

  return rawActions
    .filter((action) => action && typeof action === "object")
    .map((action) => ({
      type: typeof action.type === "string" ? action.type : "route",
      label: typeof action.label === "string" ? action.label : "",
      target: typeof action.target === "string" ? action.target : ""
    }))
    .filter((action) => action.label && action.target);
}

function normalizeRelatedLinks(rawLinks) {
  if (!Array.isArray(rawLinks)) {
    return [];
  }

  return rawLinks
    .filter((link) => link && typeof link === "object")
    .map((link) => ({
      label: typeof link.label === "string" ? link.label : "",
      target: typeof link.target === "string" ? link.target : ""
    }))
    .filter((link) => link.label && link.target);
}

function mergeLinksFromActions(links, actions) {
  const items = [
    ...links,
    ...actions.map((action) => ({
      label: action.label,
      target: action.target
    }))
  ];

  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.target)) {
      return false;
    }

    seen.add(item.target);
    return true;
  });
}

function addRecommendedEventIfNeeded(
  actions,
  relatedLinks,
  recommendedEventSlug,
  recommendationLabel
) {
  if (!recommendedEventSlug) {
    return { actions, relatedLinks };
  }

  const target = `/events/${recommendedEventSlug}`;
  const nextActions = [...actions];
  const nextLinks = [...relatedLinks];

  const hasAction = nextActions.some((action) => action.target === target);
  if (!hasAction) {
    nextActions.unshift({
      type: "event",
      label: recommendationLabel,
      target
    });
  }

  const hasLink = nextLinks.some((link) => link.target === target);
  if (!hasLink) {
    nextLinks.unshift({
      label: recommendationLabel,
      target
    });
  }

  return {
    actions: nextActions,
    relatedLinks: nextLinks
  };
}

export function useAssistantConversation({
  language,
  pageContext,
  pageSlug,
  welcomeMessage,
  recommendationLabel
}) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const appendMessages = useCallback((nextMessages) => {
    setMessages((current) => [...current, ...nextMessages].slice(-MAX_HISTORY));
  }, []);

  const ensureWelcomeMessage = useCallback(() => {
    setMessages((current) => {
      if (current.length > 0) {
        return current;
      }

      return [
        {
          id: messageId(),
          role: "assistant",
          text: welcomeMessage,
          isWelcome: true,
          pageIntent: "guidance",
          confidence: null,
          suggestedActions: [],
          relatedLinks: [],
          recommendedEventSlug: null
        }
      ];
    });
  }, [welcomeMessage]);

  const addAssistantMessage = useCallback(
    (assistantData) => {
      const pageIntent = assistantData.pageIntent || assistantData.intent || "guidance";
      const fallbackAction = getFallbackActionByIntent(pageIntent, language);
      const recommendedEventSlug =
        typeof assistantData.recommendedEventSlug === "string"
          ? assistantData.recommendedEventSlug
          : null;

      let actions = normalizeActions(
        assistantData.suggestedActions || assistantData.suggestedCtas || []
      );
      if (actions.length === 0 && fallbackAction) {
        actions = [fallbackAction];
      }

      let relatedLinks = normalizeRelatedLinks(assistantData.relatedLinks || []);
      relatedLinks = mergeLinksFromActions(relatedLinks, actions);

      const recommendation = addRecommendedEventIfNeeded(
        actions,
        relatedLinks,
        recommendedEventSlug,
        recommendationLabel
      );

      appendMessages([
        {
          id: messageId(),
          role: "assistant",
          text: assistantData.answer,
          pageIntent,
          confidence:
            typeof assistantData.confidence === "number"
              ? assistantData.confidence
              : null,
          suggestedActions: recommendation.actions,
          relatedLinks: recommendation.relatedLinks,
          recommendedEventSlug
        }
      ]);
    },
    [appendMessages, language, recommendationLabel]
  );

  const sendMessage = useCallback(
    async (rawMessage, options = {}) => {
      const text = typeof rawMessage === "string" ? rawMessage.trim() : "";
      if (!text || isSending) {
        return null;
      }

      setError("");
      if (!options.skipUserMessage) {
        appendMessages([
          {
            id: messageId(),
            role: "user",
            text
          }
        ]);
      }

      try {
        setIsSending(true);
        const assistantData = await sendAssistantChat({
          message: text,
          language,
          sessionId,
          pageContext,
          pageSlug
        });

        addAssistantMessage(assistantData);
        return assistantData;
      } catch (requestError) {
        const errorMessage =
          requestError?.message || "Assistant request failed. Please try again.";
        setError(errorMessage);
        throw requestError;
      } finally {
        setIsSending(false);
      }
    },
    [
      addAssistantMessage,
      appendMessages,
      isSending,
      language,
      pageContext,
      pageSlug,
      sessionId
    ]
  );

  const sendInputMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) {
      return null;
    }

    setInputValue("");
    return sendMessage(text);
  }, [inputValue, sendMessage]);

  const sendQuickAction = useCallback(
    async (promptText) => sendMessage(promptText),
    [sendMessage]
  );

  const latestAssistantMessage = useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === "assistant") || null,
    [messages]
  );

  return {
    messages,
    latestAssistantMessage,
    inputValue,
    setInputValue,
    isSending,
    error,
    setError,
    ensureWelcomeMessage,
    sendMessage,
    sendInputMessage,
    sendQuickAction
  };
}
