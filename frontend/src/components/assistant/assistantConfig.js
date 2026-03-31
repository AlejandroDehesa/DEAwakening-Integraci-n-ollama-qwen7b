export const SESSION_STORAGE_KEY = "deawakening-assistant-session-id";

export const assistantUiCopy = {
  en: {
    launcher: "Guide",
    heroEyebrow: "AI Guide",
    widgetTitle: "DEAwakening Guide",
    widgetSubtitle: "Ask about events, David's work, or the right next step for you.",
    heroTitle: "Start with your personal guide",
    heroSubtitle:
      "Share what you need and get a clear next step: event, book, deeper context, or contact.",
    welcome:
      "Welcome. I am your DEAwakening guide. I can help you understand the work, discover events, and choose your next step.",
    inputLabel: "Assistant message",
    placeholder: "Write your question...",
    send: "Send",
    thinking: "Thinking...",
    close: "Close assistant",
    error: "I could not complete that right now. Please try again in a moment.",
    emptyState: "Choose a quick action or ask your question.",
    quickActionsTitle: "Quick start",
    recommendationLabel: "Recommended event",
    openRecommendation: "View recommended event",
    intentLabels: {
      general_info: "General guidance",
      event_discovery: "Event guidance",
      book_interest: "Book guidance",
      contact_interest: "Contact guidance",
      about_david: "About David",
      guidance: "Next step"
    }
  },
  es: {
    launcher: "Guía",
    heroEyebrow: "Guía IA",
    widgetTitle: "Guía DEAwakening",
    widgetSubtitle: "Pregunta por eventos, el enfoque de David o tu siguiente paso ideal.",
    heroTitle: "Empieza con tu guía personal",
    heroSubtitle:
      "Cuéntame qué necesitas y te mostraré un siguiente paso claro: evento, libro, contexto o contacto.",
    welcome:
      "Bienvenido. Soy tu guía de DEAwakening. Puedo ayudarte a comprender el enfoque, descubrir eventos y elegir tu próximo paso con claridad.",
    inputLabel: "Mensaje al asistente",
    placeholder: "Escribe tu pregunta...",
    send: "Enviar",
    thinking: "Pensando...",
    close: "Cerrar asistente",
    error: "Ahora mismo no he podido completarlo. Inténtalo de nuevo en unos segundos.",
    emptyState: "Elige una acción rápida o escribe tu pregunta.",
    quickActionsTitle: "Inicio rápido",
    recommendationLabel: "Evento recomendado",
    openRecommendation: "Ver evento recomendado",
    intentLabels: {
      general_info: "Orientación general",
      event_discovery: "Orientación sobre eventos",
      book_interest: "Orientación sobre el libro",
      contact_interest: "Orientación de contacto",
      about_david: "Sobre David",
      guidance: "Siguiente paso"
    }
  },
  de: {
    launcher: "Guide",
    heroEyebrow: "KI Guide",
    widgetTitle: "DEAwakening Guide",
    widgetSubtitle: "Frage nach Events, Davids Ansatz oder deinem nächsten klaren Schritt.",
    heroTitle: "Starte mit deinem persönlichen Guide",
    heroSubtitle: "Sag mir, was du brauchst, und ich zeige dir den nächsten klaren Schritt.",
    welcome:
      "Willkommen. Ich bin dein DEAwakening Guide. Ich helfe dir, den Ansatz zu verstehen, passende Events zu finden und den nächsten Schritt mit Klarheit zu wählen.",
    inputLabel: "Nachricht an den Assistenten",
    placeholder: "Stelle deine Frage...",
    send: "Senden",
    thinking: "Wird vorbereitet...",
    close: "Assistent schließen",
    error: "Ich konnte das gerade nicht abschließen. Bitte versuche es gleich erneut.",
    emptyState: "Wähle eine Schnellaktion oder stelle deine Frage.",
    quickActionsTitle: "Schnellstart",
    recommendationLabel: "Empfohlenes Event",
    openRecommendation: "Empfohlenes Event ansehen",
    intentLabels: {
      general_info: "Allgemeine Orientierung",
      event_discovery: "Event Orientierung",
      book_interest: "Buch Orientierung",
      contact_interest: "Kontakt Orientierung",
      about_david: "Über David",
      guidance: "Nächster Schritt"
    }
  }
};

export const assistantQuickActionsByLanguage = {
  en: [
    { id: "understand-david", prompt: "I want to understand David's approach" },
    { id: "choose-event", prompt: "Help me choose the right event" },
    { id: "where-to-start", prompt: "Where should I start today?" },
    { id: "about-book", prompt: "Tell me about the book" },
    { id: "contact-david", prompt: "I want to contact David" }
  ],
  es: [
    { id: "understand-david", prompt: "Quiero entender el enfoque de David" },
    { id: "choose-event", prompt: "Ayúdame a elegir el evento adecuado" },
    { id: "where-to-start", prompt: "¿Por dónde debería empezar hoy?" },
    { id: "about-book", prompt: "Cuéntame sobre el libro" },
    { id: "contact-david", prompt: "Quiero contactar con David" }
  ],
  de: [
    { id: "understand-david", prompt: "Ich möchte Davids Ansatz verstehen" },
    { id: "choose-event", prompt: "Hilf mir, das passende Event zu wählen" },
    { id: "where-to-start", prompt: "Wo sollte ich heute anfangen?" },
    { id: "about-book", prompt: "Erzähl mir vom Buch" },
    { id: "contact-david", prompt: "Ich möchte David kontaktieren" }
  ]
};

export function getAssistantUiCopy(language) {
  return assistantUiCopy[language] || assistantUiCopy.en;
}

export function getAssistantQuickActions(language) {
  return assistantQuickActionsByLanguage[language] || assistantQuickActionsByLanguage.en;
}

export function getQuickActionPrompt(item) {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object" && typeof item.prompt === "string") {
    return item.prompt;
  }

  return "";
}

export function getQuickActionTelemetry(item) {
  const prompt = getQuickActionPrompt(item);
  if (!prompt) {
    return null;
  }

  if (item && typeof item === "object") {
    const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : "custom";
    return {
      id,
      label: prompt,
      target: `qa:${id}`
    };
  }

  return {
    id: "custom",
    label: prompt,
    target: "qa:custom"
  };
}

export function getPageContextFromPath(pathname) {
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

export function normalizeActionTarget(action) {
  if (!action?.target || typeof action.target !== "string") {
    return null;
  }

  if (action.type === "event" && !action.target.startsWith("/")) {
    return `/events/${action.target}`;
  }

  return action.target;
}
