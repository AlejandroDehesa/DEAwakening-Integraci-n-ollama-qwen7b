export const SESSION_STORAGE_KEY = "deawakening-assistant-session-id";
export const ASSISTANT_USER_NAME_STORAGE_KEY = "deawakening-assistant-user-name";

export const assistantUiCopy = {
  en: {
    launcher: "Guide",
    heroEyebrow: "AI Guide",
    widgetTitle: "DEAwakening Guide",
    widgetSubtitle: "Ask about events, David's work, or the right next step for you.",
    heroTitle: "Start with your personal guide",
    heroSubtitle:
      "Share what you need and get a clear next step: event, book, deeper context, or contact.",
    portalTitle: "Welcome to your DEAwakening guide",
    portalSubtitle:
      "Open the assistant when you are ready. I can help with events, the book, and your next step.",
    portalAction: "Open guide",
    portalNameTitle: "Before we begin, what is your name?",
    portalNameSubtitle:
      "I will use it to give you a more personal and human guidance experience.",
    portalNamePlaceholder: "Write your name...",
    portalNameAction: "Start guide",
    portalNameRequired: "Please enter your name to continue.",
    welcome:
      "Welcome. I am your DEAwakening guide. I can help you understand the work, discover events, and choose your next step.",
    welcomeNamed:
      "Welcome, {name}. I am your DEAwakening guide. I can help you understand the work, discover events, and choose your next step.",
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
    launcher: "Guia",
    heroEyebrow: "Guia IA",
    widgetTitle: "Guia DEAwakening",
    widgetSubtitle: "Pregunta por eventos, el enfoque de David o tu siguiente paso ideal.",
    heroTitle: "Empieza con tu guia personal",
    heroSubtitle:
      "Cuentame que necesitas y te mostrare un siguiente paso claro: evento, libro, contexto o contacto.",
    portalTitle: "Tu guia IA de DEAwakening",
    portalSubtitle:
      "Cuando quieras, abre el asistente y te ayudo a encontrar tu mejor siguiente paso.",
    portalAction: "Entrar en la guia",
    portalNameTitle: "Antes de empezar, como te gustaria que te llame?",
    portalNameSubtitle:
      "Tu nombre solo se usa para personalizar la experiencia dentro de la guia IA.",
    portalNamePlaceholder: "Escribe tu nombre...",
    portalNameAction: "Entrar a la guia",
    portalNameRequired: "Necesito tu nombre para activar la guia IA.",
    welcome:
      "Bienvenido. Soy tu guia de DEAwakening. Puedo ayudarte a comprender el enfoque, descubrir eventos y elegir tu proximo paso con claridad.",
    welcomeNamed:
      "Bienvenido, {name}. Soy tu guia de DEAwakening. Puedo ayudarte a comprender el enfoque, descubrir eventos y elegir tu proximo paso con claridad.",
    inputLabel: "Mensaje al asistente",
    placeholder: "Escribe tu pregunta...",
    send: "Enviar",
    thinking: "Pensando...",
    close: "Cerrar asistente",
    error: "Ahora mismo no he podido completarlo. Intentalo de nuevo en unos segundos.",
    emptyState: "Elige una accion rapida o escribe tu pregunta.",
    quickActionsTitle: "Inicio rapido",
    recommendationLabel: "Evento recomendado",
    openRecommendation: "Ver evento recomendado",
    intentLabels: {
      general_info: "Orientacion general",
      event_discovery: "Orientacion sobre eventos",
      book_interest: "Orientacion sobre el libro",
      contact_interest: "Orientacion de contacto",
      about_david: "Sobre David",
      guidance: ""
    }
  },
  de: {
    launcher: "Guide",
    heroEyebrow: "KI Guide",
    widgetTitle: "DEAwakening Guide",
    widgetSubtitle: "Frage nach Events, Davids Ansatz oder deinem naechsten klaren Schritt.",
    heroTitle: "Starte mit deinem persoenlichen Guide",
    heroSubtitle: "Sag mir, was du brauchst, und ich zeige dir den naechsten klaren Schritt.",
    portalTitle: "Dein DEAwakening Guide",
    portalSubtitle:
      "Wenn du bereit bist, oeffne den Assistenten. Ich begleite dich mit einem klaren naechsten Schritt.",
    portalAction: "Guide starten",
    portalNameTitle: "Bevor wir starten: Wie darf ich dich nennen?",
    portalNameSubtitle:
      "Dein Name wird nur verwendet, um die Begleitung persoenlicher zu gestalten.",
    portalNamePlaceholder: "Schreibe deinen Namen...",
    portalNameAction: "Guide betreten",
    portalNameRequired: "Bitte gib deinen Namen ein, um fortzufahren.",
    welcome:
      "Willkommen. Ich bin dein DEAwakening Guide. Ich helfe dir, den Ansatz zu verstehen, passende Events zu finden und den naechsten Schritt mit Klarheit zu waehlen.",
    welcomeNamed:
      "Willkommen, {name}. Ich bin dein DEAwakening Guide. Ich helfe dir, den Ansatz zu verstehen, passende Events zu finden und den naechsten Schritt mit Klarheit zu waehlen.",
    inputLabel: "Nachricht an den Assistenten",
    placeholder: "Stelle deine Frage...",
    send: "Senden",
    thinking: "Wird vorbereitet...",
    close: "Assistent schliessen",
    error: "Ich konnte das gerade nicht abschliessen. Bitte versuche es gleich erneut.",
    emptyState: "Waehle eine Schnellaktion oder stelle deine Frage.",
    quickActionsTitle: "Schnellstart",
    recommendationLabel: "Empfohlenes Event",
    openRecommendation: "Empfohlenes Event ansehen",
    intentLabels: {
      general_info: "Allgemeine Orientierung",
      event_discovery: "Event Orientierung",
      book_interest: "Buch Orientierung",
      contact_interest: "Kontakt Orientierung",
      about_david: "Ueber David",
      guidance: "Naechster Schritt"
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
    { id: "choose-event", prompt: "Ayudame a elegir el evento adecuado" },
    { id: "where-to-start", prompt: "Por donde deberia empezar hoy?" },
    { id: "about-book", prompt: "Cuentame sobre el libro" },
    { id: "contact-david", prompt: "Quiero contactar con David" }
  ],
  de: [
    { id: "understand-david", prompt: "Ich moechte Davids Ansatz verstehen" },
    { id: "choose-event", prompt: "Hilf mir, das passende Event zu waehlen" },
    { id: "where-to-start", prompt: "Wo sollte ich heute anfangen?" },
    { id: "about-book", prompt: "Erzaehl mir vom Buch" },
    { id: "contact-david", prompt: "Ich moechte David kontaktieren" }
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
