const events = [
  {
    id: 1,
    title: "DEAwakening Valencia",
    slug: "deawakening-valencia",
    date: "2026-05-10",
    location: "Valencia",
    description:
      "Una jornada presencial centrada en crecimiento personal, presencia emocional y reconexión interior a través de dinámicas guiadas por David Biddle."
  },
  {
    id: 2,
    title: "DEAwakening Madrid",
    slug: "deawakening-madrid",
    date: "2026-06-14",
    location: "Madrid",
    description:
      "Encuentro inmersivo para explorar claridad, apertura y relaciones más conscientes en un entorno seguro, humano y transformador."
  },
  {
    id: 3,
    title: "DEAwakening Barcelona",
    slug: "deawakening-barcelona",
    date: "2026-07-05",
    location: "Barcelona",
    description:
      "Experiencia diseñada para quienes desean volver al cuerpo, desbloquear patrones limitantes y vivir una expansión interna con acompañamiento profesional."
  },
  {
    id: 4,
    title: "DEAwakening Málaga",
    slug: "deawakening-malaga",
    date: "2026-09-20",
    location: "Malaga",
    description:
      "Espacio de comunidad, práctica y profundidad terapéutica para integrar herramientas de conciencia en la vida cotidiana."
  }
];

export function fetchEvents() {
  return events;
}

export function fetchEventBySlug(slug) {
  return events.find((event) => event.slug === slug) || null;
}
