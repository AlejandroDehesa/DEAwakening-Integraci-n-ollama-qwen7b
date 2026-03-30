import { fetchContactInfo } from "./contactService.js";
import { fetchContentBySectionKey } from "./contentService.js";
import { fetchEventBySlug, fetchEvents } from "./eventsService.js";

const CORE_SECTION_KEYS = [
  "home.hero",
  "home.value",
  "about.main",
  "host.main",
  "contact.main",
  "book.page"
];

function pickSection(section) {
  if (!section) {
    return null;
  }

  return {
    sectionKey: section.sectionKey,
    title: section.title,
    subtitle: section.subtitle,
    body: section.body,
    extra: section.extra
  };
}

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

export async function fetchSiteKnowledge({ language, pageContext, pageSlug }) {
  const [sections, events] = await Promise.all([
    Promise.all(
      CORE_SECTION_KEYS.map((sectionKey) =>
        fetchContentBySectionKey(sectionKey, language)
      )
    ),
    fetchEvents(language)
  ]);

  const sectionMap = Object.fromEntries(
    sections.filter(Boolean).map((section) => [section.sectionKey, pickSection(section)])
  );

  const listedEvents = events.map(pickEvent);
  const availableEventSlugs = listedEvents.map((eventItem) => eventItem.slug);

  let eventContext = null;
  if (pageContext === "event-detail" && pageSlug) {
    const eventBySlug = await fetchEventBySlug(pageSlug, language);
    eventContext = pickEvent(eventBySlug);
  }

  return {
    sections: sectionMap,
    events: listedEvents,
    contact: fetchContactInfo(),
    pageContext: pageContext || null,
    pageSlug: pageSlug || null,
    eventContext,
    availableEventSlugs
  };
}
