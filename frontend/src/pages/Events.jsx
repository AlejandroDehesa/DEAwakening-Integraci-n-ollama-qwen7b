import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionExtra } from "../services/contentService";
import { getEvents } from "../services/eventsService";

const fallbackCopyByLanguage = {
  en: {
    pageTitle: "Events",
    eyebrow: "Events",
    title: "Upcoming DEAwakening experiences",
    intro:
      "Explore live gatherings created to support personal expansion, emotional depth and meaningful human connection.",
    loading: "Loading events...",
    empty: "No events are available right now.",
    details: "View details",
    scheduled: "scheduled events"
  },
  es: {
    pageTitle: "Eventos",
    eyebrow: "Eventos",
    title: "Próximas experiencias DEAwakening",
    intro:
      "Explora encuentros en vivo creados para apoyar expansión personal, profundidad emocional y una conexión humana real.",
    loading: "Cargando eventos...",
    empty: "No hay eventos disponibles ahora mismo.",
    details: "Ver detalles",
    scheduled: "eventos programados"
  },
  de: {
    pageTitle: "Veranstaltungen",
    eyebrow: "Veranstaltungen",
    title: "Kommende DEAwakening Veranstaltungen",
    intro:
      "Entdecke Live Begegnungen fur personliches Wachstum, emotionale Tiefe und echte menschliche Verbindung.",
    loading: "Veranstaltungen werden geladen...",
    empty: "Derzeit sind keine Veranstaltungen verfugbar.",
    details: "Details ansehen",
    scheduled: "geplante Veranstaltungen"
  }
};

const specialEventOverrides = {
  "deawakening-valencia": {
    title: "Findhorn, Scotland",
    subtitle: "ResoFusion Basic",
    dateLabel: "viernes 30 de mayo",
    image: "/resofusion-findhorn.jpg",
    alt: "ResoFusion Basic retreat visual"
  },
  "deawakening-madrid": {
    title: "Niya Honor Air, Doha",
    subtitle: "ResoFusion Basic",
    dateLabel: "jueves 27 de febrero",
    image: "/resofusion-doha.avif",
    alt: "ResoFusion Basic Doha visual"
  },
  "deawakening-barcelona": {
    title: "Niya Honor Air, Doha",
    subtitle: "ResoFusion Básico",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-doha-oct.avif",
    alt: "ResoFusion Básico Doha visual"
  },
  "deawakening-malaga": {
    title: "Niya Honor Air, Doha",
    subtitle: "Degustación de ResoFusion",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-tasting-doha.avif",
    alt: "Degustación de ResoFusion Doha visual"
  },
  "deawakening-sevilla": {
    title: "Srithanu, Koh Phangan, Tailandia",
    subtitle: "ResoFusion Básico",
    dateLabel: "viernes 6 de septiembre",
    image: "/resofusion-orion.avif",
    alt: "ResoFusion Básico Orion visual"
  },
  "deawakening-bilbao": {
    title: "Orion Healing, Koh Phangan",
    subtitle: "Degustador de ResoFusion",
    dateLabel: "jueves 5 de septiembre",
    image: "/resofusion-taster-orion.avif",
    alt: "Degustador de ResoFusion Orion visual"
  },
  "deawakening-zaragoza": {
    title: "Palma, España",
    subtitle: "ResoFusion Basic en Mallorca",
    dateLabel: "sábado 29 de junio",
    image: "/resofusion-mallorca.avif",
    alt: "ResoFusion Basic Mallorca visual"
  },
  "deawakening-alicante": {
    title: "Illes Balears",
    subtitle: "DEA at Casa Wald",
    dateLabel: "domingo 2 de junio",
    image:
      "https://static.wixstatic.com/media/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg",
    alt: "DEA at Casa Wald visual"
  },
  "deawakening-granada": {
    title: "Orion Healing Centre",
    subtitle: "DEA at Orion Healing Center",
    dateLabel: "domingo 28 de enero",
    image:
      "https://static.wixstatic.com/media/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp/v1/fill/w_960,h_660,al_c,q_85,enc_auto/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp",
    alt: "DEA Orion Healing visual"
  },
  "deawakening-palma": {
    title: "Tambon Ban Tai, Tailandia",
    subtitle: "DEA at the Sanctuary",
    dateLabel: "miércoles 10 de enero",
    image:
      "https://static.wixstatic.com/media/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg/v1/fill/w_980,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg",
    alt: "DEA at the Sanctuary visual"
  },
  "deawakening-san-sebastian": {
    title: "Sesimbra, Portugal",
    subtitle: "DEAwakening One Day Intensive",
    dateLabel: "domingo 25 de junio",
    image:
      "https://static.wixstatic.com/media/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg",
    alt: "DEAwakening One Day Intensive visual"
  },
  "deawakening-murcia": {
    title: "Casa Na Ferraria, Portugal",
    subtitle: "ResoFusion Retreat Portugal",
    dateLabel: "lunes 19 de junio",
    image:
      "https://static.wixstatic.com/media/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg/v1/fill/w_980,h_1471,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg",
    alt: "ResoFusion Retreat Portugal visual"
  },
  "deawakening-santiago-compostela": {
    title: "Six Senses Kaplankaya, Turquía",
    subtitle: "Harvest Series 7 - Kaplankaya",
    dateLabel: "miércoles 10 de mayo",
    image:
      "https://static.wixstatic.com/media/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg/v1/fill/w_980,h_551,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg",
    alt: "Harvest Series 7 visual"
  },
  "deawakening-las-palmas": {
    title: "Niagara Wellness, Istanbul",
    subtitle: "ResoFusion",
    dateLabel: "sábado 6 de mayo",
    image:
      "https://static.wixstatic.com/media/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg/v1/fill/w_980,h_1431,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg",
    alt: "ResoFusion event visual"
  }
};

function formatDate(date, language) {
  const locale =
    language === "es" ? "es-ES" : language === "de" ? "de-DE" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Events() {
  const { currentLanguage } = useLanguage();
  const [events, setEvents] = useState([]);
  const [copy, setCopy] = useState(fallbackCopyByLanguage.en);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const nextFallback =
          fallbackCopyByLanguage[currentLanguage] || fallbackCopyByLanguage.en;
        if (!ignore) {
          setCopy(nextFallback);
        }

        const [copyResult, eventsResult] = await Promise.allSettled([
          getSectionExtra("events.page", currentLanguage, nextFallback),
          getEvents(currentLanguage)
        ]);

        if (!ignore && copyResult.status === "fulfilled") {
          setCopy({
            ...nextFallback,
            ...copyResult.value
          });
        }

        if (!ignore && eventsResult.status === "fulfilled") {
          setEvents(eventsResult.value);
        } else if (!ignore && eventsResult.status === "rejected") {
          setError(eventsResult.reason?.message || "Could not load events");
          setEvents([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p className="page-copy">{copy.intro}</p>

        {isLoading && <p className="status-message loading-message">{copy.loading}</p>}
        {error && <p className="status-message error-message">{error}</p>}

        {!isLoading && !error && events.length === 0 && (
          <p className="status-message">{copy.empty}</p>
        )}

        {!isLoading && !error && events.length > 0 && (
          <>
            <p className="events-count">
              {events.length} {copy.scheduled}
            </p>
            <div className="events-grid">
              {events.map((event) => {
                const override = specialEventOverrides[event.slug];
                const useVisualOverride = Boolean(override);
                const useSpanishDateLabel =
                  currentLanguage === "es" && Boolean(override);
                const cardTitle =
                  (useVisualOverride ? override?.title : null) || event.title;
                const cardSubtitle =
                  (useVisualOverride ? override?.subtitle : null) || event.location;
                const cardDateLabel =
                  (useSpanishDateLabel ? override?.dateLabel : null) ||
                  formatDate(event.date, currentLanguage);
                const cardImage = override?.image || "/resofusion-findhorn.jpg";
                const cardImageAlt = override?.alt || event.title;

                return (
                  <article
                    key={event.id}
                    className="card event-card event-card-special event-card-link"
                  >
                    <h3 className="event-card-special-title">{cardTitle}</h3>
                    <p className="event-card-special-subtitle">{cardSubtitle}</p>
                    <div className="event-card-media">
                      <img
                        className="event-card-image"
                        src={cardImage}
                        alt={cardImageAlt}
                        loading="lazy"
                      />
                    </div>
                    <div className="event-card-special-actions">
                      <p className="event-card-special-date">{cardDateLabel}</p>
                      <Link
                        className="btn btn-outline event-card-special-button"
                        to={`/events/${event.slug}`}
                      >
                        {copy.details}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Events;
