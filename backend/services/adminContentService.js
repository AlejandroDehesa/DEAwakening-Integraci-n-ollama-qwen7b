import { all, get, run } from "../database/database.js";

const SUPPORTED_LANGUAGES = ["en", "es", "de"];

function mapAdminSection(row) {
  return {
    sectionKey: row.section_key,
    translations: {
      en: {
        title: row.title_en || "",
        subtitle: row.subtitle_en || "",
        body: row.body_en || ""
      },
      es: {
        title: row.title_es || "",
        subtitle: row.subtitle_es || "",
        body: row.body_es || ""
      },
      de: {
        title: row.title_de || "",
        subtitle: row.subtitle_de || "",
        body: row.body_de || ""
      }
    }
  };
}

function normalizeSectionPayload(payload) {
  const fallbackEn = {
    title: payload?.translations?.en?.title?.trim() || "",
    subtitle: payload?.translations?.en?.subtitle?.trim() || "",
    body: payload?.translations?.en?.body?.trim() || ""
  };

  const translations = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((languageCode) => {
      const source = payload?.translations?.[languageCode] || {};

      return [
        languageCode,
        {
          title: source.title?.trim() || fallbackEn.title,
          subtitle: source.subtitle?.trim() || fallbackEn.subtitle,
          body: source.body?.trim() || fallbackEn.body
        }
      ];
    })
  );

  return {
    translations
  };
}

function validateSectionPayload(payload) {
  for (const languageCode of SUPPORTED_LANGUAGES) {
    const translation = payload.translations[languageCode];

    if (!translation.title || !translation.body) {
      return `Title and body are required for ${languageCode.toUpperCase()}`;
    }

    if (translation.body.length < 20) {
      return `${languageCode.toUpperCase()} body must be at least 20 characters`;
    }
  }

  return null;
}

async function fetchAdminSectionByKey(sectionKey) {
  const row = await get(
    `
      SELECT
        s.section_key,
        t_en.title AS title_en,
        t_en.subtitle AS subtitle_en,
        t_en.body AS body_en,
        t_es.title AS title_es,
        t_es.subtitle AS subtitle_es,
        t_es.body AS body_es,
        t_de.title AS title_de,
        t_de.subtitle AS subtitle_de,
        t_de.body AS body_de
      FROM site_sections s
      LEFT JOIN site_section_translations t_en
        ON t_en.section_id = s.id AND t_en.language_code = 'en'
      LEFT JOIN site_section_translations t_es
        ON t_es.section_id = s.id AND t_es.language_code = 'es'
      LEFT JOIN site_section_translations t_de
        ON t_de.section_id = s.id AND t_de.language_code = 'de'
      WHERE s.section_key = ?
    `,
    [sectionKey]
  );

  return row ? mapAdminSection(row) : null;
}

async function upsertSectionTranslation(sectionId, languageCode, translation) {
  const timestamp = new Date().toISOString();

  await run(
    `
      INSERT INTO site_section_translations (
        section_id,
        language_code,
        title,
        subtitle,
        body,
        extra_json,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(section_id, language_code) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        body = excluded.body,
        updated_at = excluded.updated_at
    `,
    [
      sectionId,
      languageCode,
      translation.title,
      translation.subtitle,
      translation.body,
      "{}",
      timestamp,
      timestamp
    ]
  );
}

export async function fetchAdminContent() {
  const rows = await all(`
    SELECT
      s.section_key,
      t_en.title AS title_en,
      t_en.subtitle AS subtitle_en,
      t_en.body AS body_en,
      t_es.title AS title_es,
      t_es.subtitle AS subtitle_es,
      t_es.body AS body_es,
      t_de.title AS title_de,
      t_de.subtitle AS subtitle_de,
      t_de.body AS body_de
    FROM site_sections s
    LEFT JOIN site_section_translations t_en
      ON t_en.section_id = s.id AND t_en.language_code = 'en'
    LEFT JOIN site_section_translations t_es
      ON t_es.section_id = s.id AND t_es.language_code = 'es'
    LEFT JOIN site_section_translations t_de
      ON t_de.section_id = s.id AND t_de.language_code = 'de'
    ORDER BY s.section_key ASC
  `);

  return rows.map(mapAdminSection);
}

export async function updateAdminContent(sectionKey, payload) {
  const normalizedPayload = normalizeSectionPayload(payload);
  const validationError = validateSectionPayload(normalizedPayload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError
    };
  }

  const section = await get(
    `
      SELECT id
      FROM site_sections
      WHERE section_key = ?
    `,
    [sectionKey]
  );

  if (!section) {
    return {
      success: false,
      status: 404,
      message: "Content section not found"
    };
  }

  await upsertSectionTranslation(section.id, "en", normalizedPayload.translations.en);
  await upsertSectionTranslation(section.id, "es", normalizedPayload.translations.es);
  await upsertSectionTranslation(section.id, "de", normalizedPayload.translations.de);
  await run(
    `
      UPDATE site_sections
      SET updated_at = ?
      WHERE id = ?
    `,
    [new Date().toISOString(), section.id]
  );

  return {
    success: true,
    section: await fetchAdminSectionByKey(sectionKey)
  };
}
