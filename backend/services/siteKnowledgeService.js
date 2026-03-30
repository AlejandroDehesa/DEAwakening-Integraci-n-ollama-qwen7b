import { fetchContactInfo } from "./contactService.js";
import { fetchContentBySectionKey } from "./contentService.js";
import { fetchEventBySlug, fetchEvents } from "./eventsService.js";

const SECTION_KEYS = [
  "home.hero",
  "home.value",
  "home.front",
  "about.main",
  "host.main",
  "contact.main",
  "book.page",
  "events.page",
  "event.detail.ui",
  "ui.navbar"
];

const PAGE_CONTEXT_ROUTES = {
  home: "/",
  events: "/events",
  "event-detail": "/events/:slug",
  about: "/about",
  book: "/mi-libro",
  contact: "/contact",
  "host-event": "/host-an-event"
};

function pickEvent(eventItem) {
  if (!eventItem) {
    return null;
  }

  return {
    id: eventItem.id,
    slug: eventItem.slug,
    title: eventItem.title,
    date: eventItem.date,
    location: eventItem.location,
    description: eventItem.description
  };
}

function toSectionMap(sections) {
  return Object.fromEntries(
    sections
      .filter(Boolean)
      .map((section) => [
        section.sectionKey,
        {
          title: section.title || "",
          subtitle: section.subtitle || "",
          body: section.body || "",
          extra: section.extra || {}
        }
      ])
  );
}

function buildNavigation(sectionMap) {
  const labels = sectionMap["ui.navbar"]?.extra || {};

  return [
    { key: "home", label: labels.home || "Home", path: "/" },
    { key: "events", label: labels.events || "Events", path: "/events" },
    { key: "about", label: labels.about || "About", path: "/about" },
    { key: "book", label: labels.book || "My Book", path: "/mi-libro" },
    { key: "host-event", label: labels.host || "Host an Event", path: "/host-an-event" },
    { key: "contact", label: labels.contact || "Contact", path: "/contact" }
  ];
}

function buildPageContextSummary(pageContext, sectionMap) {
  if (!pageContext) {
    return null;
  }

  const byContext = {
    home: sectionMap["home.hero"],
    events: sectionMap["events.page"],
    "event-detail": sectionMap["event.detail.ui"],
    about: sectionMap["about.main"],
    book: sectionMap["book.page"],
    contact: sectionMap["contact.main"],
    "host-event": sectionMap["host.main"]
  };

  const section = byContext[pageContext];

  if (!section) {
    return null;
  }

  return {
    title: section.title,
    subtitle: section.subtitle,
    body: section.body
  };
}

export async function fetchSiteKnowledge({ language, pageContext, pageSlug }) {
  const [sections, events] = await Promise.all([
    Promise.all(
      SECTION_KEYS.map((sectionKey) =>
        fetchContentBySectionKey(sectionKey, language)
      )
    ),
    fetchEvents(language)
  ]);

  const sectionMap = toSectionMap(sections);

  const listedEvents = events.map(pickEvent);
  const availableEventSlugs = listedEvents.map((eventItem) => eventItem.slug);

  let eventContext = null;
  if (pageContext === "event-detail" && pageSlug) {
    const eventBySlug = await fetchEventBySlug(pageSlug, language);
    eventContext = pickEvent(eventBySlug);
  }

  const navigation = buildNavigation(sectionMap);
  const contactInfo = fetchContactInfo();

  return {
    language,
    content: sectionMap,
    navigation,
    events: {
      total: listedEvents.length,
      upcoming: listedEvents.slice(0, 12)
    },
    contact: {
      ...contactInfo,
      route: "/contact"
    },
    page: {
      context: pageContext || null,
      slug: pageSlug || null,
      route: pageContext ? PAGE_CONTEXT_ROUTES[pageContext] || null : null,
      contextSummary: buildPageContextSummary(pageContext, sectionMap),
      eventContext
    },
    availableEventSlugs
  };
}
