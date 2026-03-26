import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionExtra } from "../services/contentService";
import { getEvents } from "../services/eventsService";

const fallbackCopy = {
  pageTitle: "Events",
  eyebrow: "",
  title: "",
  intro: "",
  loading: "",
  empty: "",
  details: "",
  scheduled: ""
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
  const [copy, setCopy] = useState(fallbackCopy);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  usePageTitle(copy.pageTitle || "Events");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [copyData, eventsData] = await Promise.all([
          getSectionExtra("events.page", currentLanguage, fallbackCopy),
          getEvents(currentLanguage)
        ]);

        if (!ignore) {
          setCopy({
            ...fallbackCopy,
            ...copyData
          });
          setEvents(eventsData);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
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
                const cardTitle = event.title;
                const cardSubtitle = event.location;
                const cardDateLabel = formatDate(event.date, currentLanguage);

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
                        src="/resofusion-findhorn.jpg"
                        alt={event.title}
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
