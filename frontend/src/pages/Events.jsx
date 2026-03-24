import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getEvents } from "../services/eventsService";

const labels = {
  en: {
    eyebrow: "Events",
    title: "Upcoming DEAwakening experiences",
    intro:
      "Explore live gatherings created to support personal expansion, emotional depth and meaningful human connection.",
    loading: "Loading events...",
    empty: "No events are available right now.",
    details: "View details"
  },
  es: {
    eyebrow: "Eventos",
    title: "Proximas experiencias DEAwakening",
    intro:
      "Explora encuentros en vivo creados para apoyar expansion personal, profundidad emocional y una conexion humana real.",
    loading: "Cargando eventos...",
    empty: "No hay eventos disponibles ahora mismo.",
    details: "Ver detalles"
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
          <div className="events-grid">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="card event-card event-card-link"
              >
                <p className="event-meta">{formatDate(event.date, currentLanguage)}</p>
                <h2>{event.title}</h2>
                <p className="event-location">{event.location}</p>
                <p>{event.description}</p>
                <span className="text-link">{copy.details}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Events;
