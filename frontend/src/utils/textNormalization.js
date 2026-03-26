const spanishReplacements = [
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  [/\banos\b/g, "años"],
  [/\bAno\b/g, "Año"],
  [/\bmas\b/g, "más"],
  [/\bMas\b/g, "Más"],
  [/\bcomo\b/g, "cómo"],
  [/\bComo\b/g, "Cómo"],
  [/\bque\b/g, "qué"],
  [/\bQue\b/g, "Qué"],
  [/\bquien\b/g, "quién"],
  [/\bQuien\b/g, "Quién"],
  [/\bestan\b/g, "están"],
  [/\besta\b/g, "está"],
  [/\bestare\b/g, "estaré"],
  [/\bdisenado\b/g, "diseñado"],
  [/\bdisenada\b/g, "diseñada"],
  [/\bdisenado\b/g, "diseñado"],
  [/\bdisenados\b/g, "diseñados"],
  [/\bdisenadas\b/g, "diseñadas"],
  [/\bconexion\b/g, "conexión"],
  [/\binspiracion\b/g, "inspiración"],
  [/\bintegracion\b/g, "integración"],
  [/\bintegrandose\b/g, "integrándose"],
  [/\bintegra\b/g, "íntegra"],
  [/\bcambiarias\b/g, "cambiarías"],
  [/\bmejorarias\b/g, "mejorarías"],
  [/\bdeberian\b/g, "deberían"],
  [/\btraves\b/g, "través"],
  [/\bsintesis\b/g, "síntesis"],
  [/\btecnicas\b/g, "técnicas"],
  [/\binformacion\b/g, "información"],
  [/\bsanacion\b/g, "sanación"],
  [/\bquiropractico\b/g, "quiropráctico"],
  [/\bacompanandote\b/g, "acompañándote"],
  [/\bacompano\b/g, "acompaño"],
  [/\bacompanar\b/g, "acompañar"],
  [/\bacompanamiento\b/g, "acompañamiento"],
  [/\bfisico\b/g, "físico"],
  [/\bfisicos\b/g, "físicos"],
  [/\bfisica\b/g, "física"],
  [/\bfisicas\b/g, "físicas"],
  [/\benergetico\b/g, "energético"],
  [/\benergeticos\b/g, "energéticos"],
  [/\benergetica\b/g, "energética"],
  [/\benergeticas\b/g, "energéticas"],
  [/\bespecificas\b/g, "específicas"],
  [/\bespecificos\b/g, "específicos"],
  [/\barmonicos\b/g, "armónicos"],
  [/\barmonico\b/g, "armónico"],
  [/\bpractica\b/g, "práctica"],
  [/\bpractico\b/g, "práctico"],
  [/\bpracticos\b/g, "prácticos"],
  [/\bpracticas\b/g, "prácticas"],
  [/\bsesion\b/g, "sesión"],
  [/\bsesiones\b/g, "sesiones"],
  [/\bformacion\b/g, "formación"],
  [/\biniciacion\b/g, "iniciación"],
  [/\bintroduccion\b/g, "introducción"],
  [/\brecepcion\b/g, "recepción"],
  [/\bUbicacion\b/g, "Ubicación"],
  [/\binscripcion\b/g, "inscripción"],
  [/\bpracticos\b/g, "prácticos"],
  [/\bbasico\b/g, "básico"],
  [/\bdias\b/g, "días"],
  [/\baqui\b/g, "aquí"],
  [/\bdebera\b/g, "deberá"],
  [/\bhuespedes\b/g, "huéspedes"],
  [/\bHuespedes\b/g, "Huéspedes"],
  [/\bmiercoles\b/g, "miércoles"],
  [/\bsabado\b/g, "sábado"],
  [/\bholistico\b/g, "holístico"],
  [/\bcercania\b/g, "cercanía"],
  [/\batencion\b/g, "atención"],
  [/\bCuentanos\b/g, "Cuéntanos"],
  [/\bgustaria\b/g, "gustaría"],
  [/\bIntentalo\b/g, "Inténtalo"],
  [/\bminimo\b/g, "mínimo"],
  [/\bMaximo\b/g, "Máximo"],
  [/\bproposito\b/g, "propósito"],
  [/\breflexion\b/g, "reflexión"],
  [/\bexpresion\b/g, "expresión"],
  [/\bdireccion\b/g, "dirección"],
  [/\bautentica\b/g, "auténtica"],
  [/\bestres\b/g, "estrés"],
  [/\brespiracion\b/g, "respiración"],
  [/\bliberacion\b/g, "liberación"],
  [/\btransformacion\b/g, "transformación"],
  [/\bregulacion\b/g, "regulación"],
  [/\bopcion\b/g, "opción"],
  [/\bmodulos\b/g, "módulos"],
  [/\bdia\b/g, "día"],
  [/\bTurquia\b/g, "Turquía"],
  [/\bTu\b/g, "Tú"],
  [/\bMas informacion\b/g, "Más información"],
  [/\bResosense\b/g, "ResoSense"],
  [/\bReosense\b/g, "ResoSense"],
  [/\bsi transferibles\b/g, "sí transferibles"],
  [/\basi\b/g, "así"]
];

const englishReplacements = [
  [/\bWhat would like to\b/g, "What would you like to"],
  [/\bSactuary\b/g, "Sanctuary"],
  [/\blife changing\b/g, "life-changing"],
  [/\bResosense\b/g, "ResoSense"],
  [/\bReosense\b/g, "ResoSense"]
];

function shouldSkipNormalization(value) {
  return /^https?:\/\//i.test(value) || value.startsWith("/api/");
}

function applyReplacements(value, replacements) {
  let nextValue = value;

  for (const [pattern, replacement] of replacements) {
    nextValue = nextValue.replace(pattern, replacement);
  }

  return nextValue;
}

export function normalizeLocalizedText(value, language = "en") {
  if (typeof value !== "string" || shouldSkipNormalization(value)) {
    return value;
  }

  if (language === "es") {
    return applyReplacements(value, spanishReplacements);
  }

  return applyReplacements(value, englishReplacements);
}

export function normalizeLocalizedDeep(value, language = "en") {
  if (typeof value === "string") {
    return normalizeLocalizedText(value, language);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeLocalizedDeep(item, language));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        normalizeLocalizedDeep(entryValue, language)
      ])
    );
  }

  return value;
}
