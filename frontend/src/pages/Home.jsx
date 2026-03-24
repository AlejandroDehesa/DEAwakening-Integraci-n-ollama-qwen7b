import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionContent, parseBodyItems } from "../services/contentService";
import { getEvents } from "../services/eventsService";

const fallbackContent = {
  en: {
    hero: {
      title:
        "Awaken through live experiences that feel grounded, intimate and transformational.",
      subtitle: "DEAwakening with David Biddle",
      body:
        "A premium space for personal growth, therapeutic depth and conscious community, created for people ready to meet themselves more honestly."
    },
    value: {
      title: "DEAwakening is built on presence, depth and human connection.",
      subtitle:
        "Each gathering is designed to create a felt experience rather than surface inspiration.",
      body:
        "Community: Honest spaces where people can connect with warmth and presence.\nEvents: Guided gatherings that blend insight, embodiment and human depth.\nExperiences: Transformational moments designed for lasting integration."
    }
  },
  es: {
    hero: {
      title:
        "Despierta a traves de experiencias en vivo intimas, profundas y transformadoras.",
      subtitle: "DEAwakening con David Biddle",
      body:
        "Un espacio premium para crecimiento personal, profundidad terapeutica y comunidad consciente, creado para personas listas para encontrarse con mas verdad."
    },
    value: {
      title: "DEAwakening se construye sobre presencia, profundidad y conexion humana.",
      subtitle:
        "Cada encuentro esta disenado para generar una experiencia vivida, no solo inspiracion superficial.",
      body:
        "Comunidad: Espacios honestos donde las personas pueden encontrarse con calidez y presencia.\nEventos: Encuentros guiados que unen claridad, cuerpo y profundidad humana.\nExperiencias: Momentos transformadores pensados para una integracion real."
    }
  }
};

const labels = {
  en: {
    pageTitle: "Home",
    featured: "Featured Events",
    featuredTitle: "Upcoming gatherings across Spain.",
    browse: "Explore Events",
    host: "Host an Event",
    allEvents: "View All Events",
    viewMore: "View more",
    loading: "Loading featured events...",
    noEvents: "No events are available right now."
  },
  es: {
    pageTitle: "Inicio",
    featured: "Eventos Destacados",
    featuredTitle: "Proximos encuentros en Espana.",
    browse: "Explorar Eventos",
    host: "Organizar un Evento",
    allEvents: "Ver Todos los Eventos",
    viewMore: "Ver mas",
    loading: "Cargando eventos destacados...",
    noEvents: "No hay eventos disponibles ahora mismo."
  }
};

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Home() {
  const { currentLanguage } = useLanguage();
  const [heroContent, setHeroContent] = useState(fallbackContent.en.hero);
  const [valueContent, setValueContent] = useState(fallbackContent.en.value);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const copy = labels[currentLanguage];
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    const nextFallback = fallbackContent[currentLanguage];

    setHeroContent(nextFallback.hero);
    setValueContent(nextFallback.value);

    async function loadHomeData() {
      try {
        setIsLoading(true);
        setEventsError("");
        const [heroResult, valueResult, eventsResult] = await Promise.allSettled([
          getSectionContent("home.hero", currentLanguage),
          getSectionContent("home.value", currentLanguage),
          getEvents(currentLanguage)
        ]);

        if (heroResult.status === "fulfilled") {
          setHeroContent(heroResult.value);
        }

        if (valueResult.status === "fulfilled") {
          setValueContent(valueResult.value);
        }

        if (eventsResult.status === "fulfilled") {
          setFeaturedEvents(eventsResult.value.slice(0, 3));
        } else {
          setEventsError(eventsResult.reason.message);
          setFeaturedEvents([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, [currentLanguage]);

  return (
    <>
      <section className="section hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{heroContent.subtitle}</span>
            <h1>{heroContent.title}</h1>
            <p className="lead">{heroContent.body}</p>
            <div className="button-row">
              <Link className="btn btn-primary" to="/events">
                {copy.browse}
              </Link>
              <Link className="btn btn-outline" to="/host-an-event">
                {copy.host}
              </Link>
            </div>
          </div>

          <div className="card hero-panel">
            <p className="panel-label">DEAwakening</p>
            <ul className="feature-list">
              {parseBodyItems(valueContent.body).map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <br />
                  {item.body}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">DEAwakening</span>
            <h2>{valueContent.title}</h2>
            <p className="page-copy">{valueContent.subtitle}</p>
          </div>

          <div className="three-column-grid">
            {parseBodyItems(valueContent.body).map((item) => (
              <article key={item.title} className="card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading section-heading-row">
            <div>
              <span className="eyebrow">{copy.featured}</span>
              <h2>{copy.featuredTitle}</h2>
            </div>
            <Link className="btn btn-outline" to="/events">
              {copy.allEvents}
            </Link>
          </div>

          {isLoading ? (
            <p className="status-message loading-message">{copy.loading}</p>
          ) : eventsError ? (
            <p className="status-message error-message">{eventsError}</p>
          ) : featuredEvents.length === 0 ? (
            <p className="status-message">{copy.noEvents}</p>
          ) : (
            <div className="three-column-grid">
              {featuredEvents.map((event) => (
                <article key={event.id} className="card event-card">
                  <p className="event-meta">{formatDate(event.date, currentLanguage)}</p>
                  <h3>{event.title}</h3>
                  <p className="event-location">{event.location}</p>
                  <Link className="text-link" to={`/events/${event.slug}`}>
                    {copy.viewMore}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
