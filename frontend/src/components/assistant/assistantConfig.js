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
    error:
      "I could not complete that right now. Please try again in a moment.",
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
    widgetSubtitle: "Pregunta sobre eventos, el enfoque de David o tu mejor siguiente paso.",
    heroTitle: "Empieza con tu guía personal",
    heroSubtitle:
      "Cuéntame qué necesitas y te doy un siguiente paso claro: evento, libro, contexto o contacto.",
    welcome:
      "Bienvenido. Soy tu guía de DEAwakening. Puedo ayudarte a entender el enfoque, descubrir eventos y elegir tu siguiente paso.",
    inputLabel: "Mensaje al asistente",
    placeholder: "Escribe tu pregunta...",
    send: "Enviar",
    thinking: "Pensando...",
    close: "Cerrar asistente",
    error:
      "Ahora mismo no he podido completarlo. Inténtalo de nuevo en unos segundos.",
    emptyState: "Elige una acción rápida o escribe tu pregunta.",
    quickActionsTitle: "Inicio rápido",
    recommendationLabel: "Evento recomendado",
    openRecommendation: "Ver evento recomendado",
    intentLabels: {
      general_info: "Orientación general",
      event_discovery: "Orientación de eventos",
      book_interest: "Orientación del libro",
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
    heroSubtitle:
      "Sag mir, was du brauchst, und ich zeige dir den klaren nächsten Schritt.",
    welcome:
      "Willkommen. Ich bin dein DEAwakening Guide. Ich helfe dir, den Ansatz zu verstehen, passende Events zu finden und den nächsten Schritt zu wählen.",
    inputLabel: "Nachricht an den Assistenten",
    placeholder: "Stelle deine Frage...",
    send: "Senden",
    thinking: "Wird vorbereitet...",
    close: "Assistent schließen",
    error:
      "Ich konnte das gerade nicht abschließen. Bitte versuche es gleich erneut.",
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
    "I want to understand David's approach",
    "Help me choose the right event",
    "Where should I start today?",
    "Tell me about the book",
    "I want to contact David"
  ],
  es: [
    "Quiero entender el enfoque de David",
    "Ayúdame a elegir el evento adecuado",
    "¿Por dónde debería empezar hoy?",
    "Cuéntame sobre el libro",
    "Quiero contactar con David"
  ],
  de: [
    "Ich möchte Davids Ansatz verstehen",
    "Hilf mir, das passende Event zu wählen",
    "Wo sollte ich heute anfangen?",
    "Erzähl mir vom Buch",
    "Ich möchte David kontaktieren"
  ]
};

export function getAssistantUiCopy(language) {
  return assistantUiCopy[language] || assistantUiCopy.en;
}

export function getAssistantQuickActions(language) {
  return assistantQuickActionsByLanguage[language] || assistantQuickActionsByLanguage.en;
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
