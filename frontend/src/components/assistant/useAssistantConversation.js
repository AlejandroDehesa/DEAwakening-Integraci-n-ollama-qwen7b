import { useCallback, useEffect, useMemo, useState } from "react";
import { sendAssistantChat } from "../../services/assistantService";
import { SESSION_STORAGE_KEY } from "./assistantConfig";

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

function sanitizeActions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      type: typeof item.type === "string" ? item.type : "route",
      label: typeof item.label === "string" ? item.label : "",
      target: typeof item.target === "string" ? item.target : ""
    }))
    .filter((item) => item.label && item.target);
}

function sanitizeLinks(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      label: typeof item.label === "string" ? item.label : "",
      target: typeof item.target === "string" ? item.target : ""
    }))
    .filter((item) => item.label && item.target);
}

export function useAssistantConversation({
  language,
  pageContext,
  pageSlug,
  userName,
  welcomeMessage
}) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const appendMessages = useCallback((nextMessages) => {
    setMessages((current) => [...current, ...nextMessages].slice(-MAX_HISTORY));
  }, []);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 0) {
        return current;
      }

      const hasRealConversation = current.some((message) => !message.isWelcome);
      if (hasRealConversation) {
        return current;
      }

      let changed = false;
      const next = current.map((message) => {
        if (!message?.isWelcome || message.text === welcomeMessage) {
          return message;
        }

        changed = true;
        return {
          ...message,
          text: welcomeMessage
        };
      });

      return changed ? next : current;
    });
  }, [welcomeMessage]);

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
          recommendedEventSlug: null,
          recommendedEventTitle: null,
          interactionId: null
        }
      ];
    });
  }, [welcomeMessage]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setInputValue("");
    setError("");
  }, []);

  const addAssistantMessage = useCallback(
    (assistantData) => {
      appendMessages([
        {
          id: messageId(),
          role: "assistant",
          text: assistantData.answer,
          pageIntent: assistantData.pageIntent || assistantData.intent || "guidance",
          confidence:
            typeof assistantData.confidence === "number"
              ? assistantData.confidence
              : null,
          suggestedActions: sanitizeActions(assistantData.suggestedActions),
          relatedLinks: sanitizeLinks(assistantData.relatedLinks),
          recommendedEventSlug:
            typeof assistantData.recommendedEventSlug === "string"
              ? assistantData.recommendedEventSlug
              : null,
          recommendedEventTitle:
            typeof assistantData.recommendedEventTitle === "string"
              ? assistantData.recommendedEventTitle
              : null,
          interactionId:
            Number.isInteger(assistantData.interactionId) && assistantData.interactionId > 0
              ? assistantData.interactionId
              : null
        }
      ]);
    },
    [appendMessages]
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
          pageSlug,
          userName
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
      userName,
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
    () => [...messages].reverse().find((message) => message.role === "assistant") || null,
    [messages]
  );

  return {
    messages,
    latestAssistantMessage,
    sessionId,
    inputValue,
    setInputValue,
    isSending,
    error,
    setError,
    ensureWelcomeMessage,
    sendMessage,
    sendInputMessage,
    sendQuickAction,
    resetConversation
  };
}
