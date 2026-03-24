import { all, get, run } from "../database/database.js";

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    date: row.date,
    location: row.location,
    description: row.description
    // Reserved for future i18n support, for example a translations JSON column.
  };
}

export async function fetchEvents() {
  const rows = await all(
    `
      SELECT id, title, slug, date, location, description
      FROM events
      ORDER BY date ASC
    `
  );

  return rows.map(mapEvent);
}

export async function fetchEventBySlug(slug) {
  const row = await get(
    `
      SELECT id, title, slug, date, location, description
      FROM events
      WHERE slug = ?
    `,
    [slug]
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
