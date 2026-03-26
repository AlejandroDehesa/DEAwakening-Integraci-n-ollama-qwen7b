import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getEvents } from "../services/eventsService";

const labels = {
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
    title: "Proximas experiencias DEAwakening",
    intro:
      "Explora encuentros en vivo creados para apoyar expansion personal, profundidad emocional y una conexion humana real.",
    loading: "Cargando eventos...",
    empty: "No hay eventos disponibles ahora mismo.",
    details: "Ver detalles",
    scheduled: "eventos programados"
  }
};

const specialEventOverrides = {
  "deawakening-valencia": {
    title: "ResoFusion Basic - Findhorn",
    subtitle: "Findhorn, Scotland",
    dateLabel: "viernes 30 de mayo",
    image: "/resofusion-findhorn.jpg",
    alt: "ResoFusion Basic retreat visual"
  },
  "deawakening-madrid": {
    title: "ResoFusion Basic - Doha",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 27 de febrero",
    image: "/resofusion-doha.avif",
    alt: "ResoFusion Basic Doha visual"
  },
  "deawakening-barcelona": {
    title: "ResoFusion Basico - Doha",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-doha-oct.avif",
    alt: "ResoFusion Basico Doha visual"
  },
  "deawakening-malaga": {
    title: "Degustacion de ResoFusion",
    subtitle: "Souq Waqif, Doha",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-tasting-doha.avif",
    alt: "Degustacion de ResoFusion Doha visual"
  }
};

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Events() {
  const { currentLanguage } = useLanguage();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const copy = labels[currentLanguage];
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoading(true);
        setError("");
        const eventsData = await getEvents(currentLanguage);
        setEvents(eventsData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
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
                const cardTitle = override?.title || event.title;
                const cardSubtitle = override?.subtitle || event.location;
                const cardDateLabel =
                  override?.dateLabel || formatDate(event.date, currentLanguage);
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
