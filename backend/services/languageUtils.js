export function normalizeLanguage(languageCode) {
  if (languageCode === "es" || languageCode === "de") {
    return languageCode;
  }

  return "en";
}
