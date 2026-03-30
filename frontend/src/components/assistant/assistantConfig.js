export const SESSION_STORAGE_KEY = "deawakening-assistant-session-id";

export const assistantUiCopy = {
  en: {
    launcher: "Guide",
    heroEyebrow: "AI Guide",
    widgetTitle: "DEAwakening Guide",
    widgetSubtitle: "Ask anything about events, David, or the work.",
    heroTitle: "Start with your personal guide",
    heroSubtitle:
      "Tell us what you need and get a clear next step: events, book, about David, or contact.",
    welcome:
      "Hi, I am your DEAwakening guide. I can help you find events, understand the approach, or navigate the site.",
    inputLabel: "Assistant message",
    placeholder: "Ask your question...",
    send: "Send",
    thinking: "Thinking...",
    close: "Close assistant",
    error: "I could not answer right now. Please try again in a moment.",
    emptyState: "Start with a quick action or type your question.",
    quickActionsTitle: "Start quickly",
    recommendationLabel: "Recommended event",
    openRecommendation: "Open recommended event",
    intentLabels: {
      general_info: "General info",
      event_discovery: "Event discovery",
      book_interest: "Book interest",
      contact_interest: "Contact intent",
      about_david: "About David",
      guidance: "Guidance"
    }
  },
  es: {
    launcher: "Guia",
    heroEyebrow: "Guia IA",
    widgetTitle: "Guia DEAwakening",
    widgetSubtitle: "Pregunta sobre eventos, David o el enfoque.",
    heroTitle: "Empieza con tu guia personal",
    heroSubtitle:
      "Cuentame que necesitas y te doy el siguiente paso claro: eventos, libro, sobre David o contacto.",
    welcome:
      "Hola, soy tu guia de DEAwakening. Puedo ayudarte a encontrar eventos, entender el enfoque o navegar la web.",
    inputLabel: "Mensaje al asistente",
    placeholder: "Escribe tu pregunta...",
    send: "Enviar",
    thinking: "Pensando...",
    close: "Cerrar asistente",
    error: "Ahora mismo no he podido responder. Intentalo de nuevo en unos segundos.",
    emptyState: "Empieza con una accion rapida o escribe tu pregunta.",
    quickActionsTitle: "Empieza rapido",
    recommendationLabel: "Evento recomendado",
    openRecommendation: "Abrir evento recomendado",
    intentLabels: {
      general_info: "Info general",
      event_discovery: "Busqueda de eventos",
      book_interest: "Interes por el libro",
      contact_interest: "Interes en contacto",
      about_david: "Sobre David",
      guidance: "Orientacion"
    }
  },
  de: {
    launcher: "Guide",
    heroEyebrow: "KI Guide",
    widgetTitle: "DEAwakening Guide",
    widgetSubtitle: "Frage nach Events, David oder dem Ansatz.",
    heroTitle: "Starte mit deinem persoenlichen Guide",
    heroSubtitle:
      "Sag mir, was du brauchst, und du bekommst den klaren naechsten Schritt.",
    welcome:
      "Hallo, ich bin dein DEAwakening Guide. Ich helfe dir bei Events, dem Ansatz und der Navigation auf der Seite.",
    inputLabel: "Nachricht an den Assistenten",
    placeholder: "Stelle deine Frage...",
    send: "Senden",
    thinking: "Wird vorbereitet...",
    close: "Assistent schliessen",
    error: "Ich konnte gerade nicht antworten. Bitte versuche es gleich erneut.",
    emptyState: "Starte mit einer Schnellaktion oder schreibe deine Frage.",
    quickActionsTitle: "Schnell starten",
    recommendationLabel: "Empfohlenes Event",
    openRecommendation: "Empfohlenes Event oeffnen",
    intentLabels: {
      general_info: "Allgemeine Info",
      event_discovery: "Event Suche",
      book_interest: "Buch Interesse",
      contact_interest: "Kontakt Interesse",
      about_david: "Ueber David",
      guidance: "Orientierung"
    }
  }
};

export const assistantQuickActionsByLanguage = {
  en: [
    "I want to understand David's work",
    "Help me find the right event",
    "Where should I start?",
    "Tell me about the book",
    "I want to contact David"
  ],
  es: [
    "Quiero entender el trabajo de David",
    "Ayudame a encontrar el evento adecuado",
    "Por donde deberia empezar?",
    "Cuentame sobre el libro",
    "Quiero contactar con David"
  ],
  de: [
    "Ich moechte Davids Arbeit verstehen",
    "Hilf mir, das richtige Event zu finden",
    "Wo sollte ich anfangen?",
    "Erzaehl mir vom Buch",
    "Ich moechte David kontaktieren"
  ]
};

const fallbackActionsByIntent = {
  general_info: {
    type: "route",
    target: "/about",
    labels: {
      en: "About David",
      es: "Sobre David",
      de: "Ueber David"
    }
  },
  event_discovery: {
    type: "route",
    target: "/events",
    labels: {
      en: "View events",
      es: "Ver eventos",
      de: "Events ansehen"
    }
  },
  book_interest: {
    type: "book",
    target: "/mi-libro",
    labels: {
      en: "Open my book",
      es: "Ver mi libro",
      de: "Mein Buch oeffnen"
    }
  },
  contact_interest: {
    type: "contact",
    target: "/contact",
    labels: {
      en: "Go to contact",
      es: "Ir a contacto",
      de: "Zu Kontakt"
    }
  },
  about_david: {
    type: "route",
    target: "/about",
    labels: {
      en: "Learn about David",
      es: "Conocer a David",
      de: "Mehr ueber David"
    }
  },
  guidance: {
    type: "route",
    target: "/events",
    labels: {
      en: "See where to start",
      es: "Ver por donde empezar",
      de: "Wo anfangen?"
    }
  }
};

export function getAssistantUiCopy(language) {
  return assistantUiCopy[language] || assistantUiCopy.en;
}

export function getAssistantQuickActions(language) {
  return assistantQuickActionsByLanguage[language] || assistantQuickActionsByLanguage.en;
}

export function getFallbackActionByIntent(intent, language) {
  const selected = fallbackActionsByIntent[intent];
  if (!selected) {
    return null;
  }

  return {
    type: selected.type,
    target: selected.target,
    label: selected.labels[language] || selected.labels.en
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
