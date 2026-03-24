import { all, get, run } from "../database/database.js";

function mapAdminEvent(row) {
  return {
    id: row.id,
    slug: row.slug,
    date: row.date,
    translations: {
      en: {
        title: row.title_en || "",
        location: row.location_en || "",
        description: row.description_en || ""
      },
      es: {
        title: row.title_es || "",
        location: row.location_es || "",
        description: row.description_es || ""
      }
    }
  };
}

function normalizeEventPayload(payload) {
  return {
    slug: payload?.slug?.trim(),
    date: payload?.date?.trim(),
    translations: {
      en: {
        title: payload?.translations?.en?.title?.trim() || "",
        location: payload?.translations?.en?.location?.trim() || "",
        description: payload?.translations?.en?.description?.trim() || ""
      },
      es: {
        title: payload?.translations?.es?.title?.trim() || "",
        location: payload?.translations?.es?.location?.trim() || "",
        description: payload?.translations?.es?.description?.trim() || ""
      }
    }
  };
}

function validateEventPayload(payload) {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!payload.slug) {
    return "Slug is required";
  }

  if (!slugPattern.test(payload.slug)) {
    return "Slug must use lowercase letters, numbers and hyphens only";
  }

  if (!payload.date) {
    return "Date is required";
  }

  if (!datePattern.test(payload.date)) {
    return "Date must use YYYY-MM-DD format";
  }

  for (const languageCode of ["en", "es"]) {
    const translation = payload.translations[languageCode];

    if (!translation.title || !translation.location || !translation.description) {
      return `All ${languageCode.toUpperCase()} event fields are required`;
    }

    if (translation.description.length < 20) {
      return `${languageCode.toUpperCase()} description must be at least 20 characters`;
    }
  }

  return null;
}

async function fetchAdminEventById(id) {
  const row = await get(
    `
      SELECT
        e.id,
        e.slug,
        e.date,
        t_en.title AS title_en,
        t_en.location AS location_en,
        t_en.description AS description_en,
        t_es.title AS title_es,
        t_es.location AS location_es,
        t_es.description AS description_es
      FROM events e
      LEFT JOIN event_translations t_en
        ON t_en.event_id = e.id AND t_en.language_code = 'en'
      LEFT JOIN event_translations t_es
        ON t_es.event_id = e.id AND t_es.language_code = 'es'
      WHERE e.id = ?
    `,
    [id]
  );

  return row ? mapAdminEvent(row) : null;
}

async function upsertEventTranslation(eventId, languageCode, translation) {
  const timestamp = new Date().toISOString();

  await run(
    `
      INSERT INTO event_translations (
        event_id,
        language_code,
        title,
        location,
        description,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(event_id, language_code) DO UPDATE SET
        title = excluded.title,
        location = excluded.location,
        description = excluded.description,
        updated_at = excluded.updated_at
    `,
    [
      eventId,
      languageCode,
      translation.title,
      translation.location,
      translation.description,
      timestamp,
      timestamp
    ]
  );
}

export async function fetchAdminEvents() {
  const rows = await all(`
    SELECT
      e.id,
      e.slug,
      e.date,
      t_en.title AS title_en,
      t_en.location AS location_en,
      t_en.description AS description_en,
      t_es.title AS title_es,
      t_es.location AS location_es,
      t_es.description AS description_es
    FROM events e
    LEFT JOIN event_translations t_en
      ON t_en.event_id = e.id AND t_en.language_code = 'en'
    LEFT JOIN event_translations t_es
      ON t_es.event_id = e.id AND t_es.language_code = 'es'
    ORDER BY e.date ASC
  `);

  return rows.map(mapAdminEvent);
}

export async function createAdminEvent(payload) {
  const normalizedPayload = normalizeEventPayload(payload);
  const validationError = validateEventPayload(normalizedPayload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError
    };
  }

  const existingEvent = await get("SELECT id FROM events WHERE slug = ?", [
    normalizedPayload.slug
  ]);

  if (existingEvent) {
    return {
      success: false,
      status: 400,
      message: "Slug already exists"
    };
  }

  const insertResult = await run(
    `
      INSERT INTO events (title, slug, date, location, description)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      normalizedPayload.translations.en.title,
      normalizedPayload.slug,
      normalizedPayload.date,
      normalizedPayload.translations.en.location,
      normalizedPayload.translations.en.description
    ]
  );

  await upsertEventTranslation(
    insertResult.lastID,
    "en",
    normalizedPayload.translations.en
  );
  await upsertEventTranslation(
    insertResult.lastID,
    "es",
    normalizedPayload.translations.es
  );

  return {
    success: true,
    event: await fetchAdminEventById(insertResult.lastID)
  };
}

export async function updateAdminEvent(id, payload) {
  const normalizedPayload = normalizeEventPayload(payload);
  const validationError = validateEventPayload(normalizedPayload);

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      status: 400,
      message: "A valid event id is required"
    };
  }

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError
    };
  }

  const event = await get("SELECT id FROM events WHERE id = ?", [id]);

  if (!event) {
    return {
      success: false,
      status: 404,
      message: "Event not found"
    };
  }

  const existingSlug = await get(
    "SELECT id FROM events WHERE slug = ? AND id != ?",
    [normalizedPayload.slug, id]
  );

  if (existingSlug) {
    return {
      success: false,
      status: 400,
      message: "Slug already exists"
    };
  }

  await run(
    `
      UPDATE events
      SET
        title = ?,
        slug = ?,
        date = ?,
        location = ?,
        description = ?
      WHERE id = ?
    `,
    [
      normalizedPayload.translations.en.title,
      normalizedPayload.slug,
      normalizedPayload.date,
      normalizedPayload.translations.en.location,
      normalizedPayload.translations.en.description,
      id
    ]
  );

  await upsertEventTranslation(id, "en", normalizedPayload.translations.en);
  await upsertEventTranslation(id, "es", normalizedPayload.translations.es);

  return {
    success: true,
    event: await fetchAdminEventById(id)
  };
}

export async function deleteAdminEvent(id) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      status: 400,
      message: "A valid event id is required"
    };
  }

  const event = await get("SELECT id FROM events WHERE id = ?", [id]);

  if (!event) {
    return {
      success: false,
      status: 404,
      message: "Event not found"
    };
  }

  await run("DELETE FROM event_registrations WHERE event_id = ?", [id]);
  await run("DELETE FROM event_translations WHERE event_id = ?", [id]);
  await run("DELETE FROM events WHERE id = ?", [id]);

  return {
    success: true
  };
}
