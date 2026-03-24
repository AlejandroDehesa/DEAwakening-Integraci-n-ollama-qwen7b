import { all, get, run } from "../database/database.js";
import { normalizeLanguage } from "./languageUtils.js";

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    date: row.date,
    location: row.location,
    description: row.description
  };
}

export async function fetchEvents(languageCode) {
  const language = normalizeLanguage(languageCode);
  const rows = await all(
    `
      SELECT
        e.id,
        e.slug,
        e.date,
        COALESCE(t_lang.title, t_en.title, e.title) AS title,
        COALESCE(t_lang.location, t_en.location, e.location) AS location,
        COALESCE(t_lang.description, t_en.description, e.description) AS description
      FROM events e
      LEFT JOIN event_translations t_lang
        ON t_lang.event_id = e.id AND t_lang.language_code = ?
      LEFT JOIN event_translations t_en
        ON t_en.event_id = e.id AND t_en.language_code = 'en'
      ORDER BY e.date ASC
    `,
    [language]
  );

  return rows.map(mapEvent);
}

export async function fetchEventBySlug(slug, languageCode) {
  const language = normalizeLanguage(languageCode);
  const row = await get(
    `
      SELECT
        e.id,
        e.slug,
        e.date,
        COALESCE(t_lang.title, t_en.title, e.title) AS title,
        COALESCE(t_lang.location, t_en.location, e.location) AS location,
        COALESCE(t_lang.description, t_en.description, e.description) AS description
      FROM events e
      LEFT JOIN event_translations t_lang
        ON t_lang.event_id = e.id AND t_lang.language_code = ?
      LEFT JOIN event_translations t_en
        ON t_en.event_id = e.id AND t_en.language_code = 'en'
      WHERE e.slug = ?
    `,
    [language, slug]
  );

  return row ? mapEvent(row) : null;
}

export async function registerForEvent(eventId, payload) {
  const name = payload?.name?.trim();
  const email = payload?.email?.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return {
      success: false,
      status: 400,
      message: "A valid event id is required"
    };
  }

  if (!name || !email) {
    return {
      success: false,
      status: 400,
      message: "Name and email are required"
    };
  }

  if (!emailPattern.test(email)) {
    return {
      success: false,
      status: 400,
      message: "A valid email is required"
    };
  }

  const event = await get("SELECT id FROM events WHERE id = ?", [eventId]);

  if (!event) {
    return {
      success: false,
      status: 404,
      message: "Event not found"
    };
  }

  await run(
    `
      INSERT INTO event_registrations (name, email, event_id, created_at)
      VALUES (?, ?, ?, ?)
    `,
    [name, email, eventId, new Date().toISOString()]
  );

  return {
    success: true
  };
}
