import { all, get } from "../database/database.js";
import { normalizeLanguage } from "./languageUtils.js";

function parseExtra(rawExtra) {
  try {
    return rawExtra ? JSON.parse(rawExtra) : {};
  } catch {
    return {};
  }
}

function mapSection(row, language) {
  return {
    sectionKey: row.section_key,
    language,
    title: row.title || "",
    subtitle: row.subtitle || "",
    body: row.body || "",
    extra: parseExtra(row.extra_json)
  };
}

export async function fetchContent(languageCode) {
  const language = normalizeLanguage(languageCode);
  const rows = await all(
    `
      SELECT
        s.section_key,
        COALESCE(t_lang.title, t_en.title, '') AS title,
        COALESCE(t_lang.subtitle, t_en.subtitle, '') AS subtitle,
        COALESCE(t_lang.body, t_en.body, '') AS body,
        COALESCE(t_lang.extra_json, t_en.extra_json, '{}') AS extra_json
      FROM site_sections s
      LEFT JOIN site_section_translations t_lang
        ON t_lang.section_id = s.id AND t_lang.language_code = ?
      LEFT JOIN site_section_translations t_en
        ON t_en.section_id = s.id AND t_en.language_code = 'en'
      ORDER BY s.section_key ASC
    `,
    [language]
  );

  return rows.map((row) => mapSection(row, language));
}

export async function fetchContentBySectionKey(sectionKey, languageCode) {
  const language = normalizeLanguage(languageCode);
  const row = await get(
    `
      SELECT
        s.section_key,
        COALESCE(t_lang.title, t_en.title, '') AS title,
        COALESCE(t_lang.subtitle, t_en.subtitle, '') AS subtitle,
        COALESCE(t_lang.body, t_en.body, '') AS body,
        COALESCE(t_lang.extra_json, t_en.extra_json, '{}') AS extra_json
      FROM site_sections s
      LEFT JOIN site_section_translations t_lang
        ON t_lang.section_id = s.id AND t_lang.language_code = ?
      LEFT JOIN site_section_translations t_en
        ON t_en.section_id = s.id AND t_en.language_code = 'en'
      WHERE s.section_key = ?
    `,
    [language, sectionKey]
  );

  return row ? mapSection(row, language) : null;
}
