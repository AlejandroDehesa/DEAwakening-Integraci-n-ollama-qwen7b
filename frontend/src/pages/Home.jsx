import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionContent, parseBodyItems } from "../services/contentService";
import { getEvents } from "../services/eventsService";

const fallbackContent = {
  en: {
    value: {
      title: "DEAwakening is built on presence, depth and human connection.",
      subtitle:
        "Each gathering is designed to create a felt experience rather than surface inspiration.",
      body:
        "Community: Honest spaces where people can connect with warmth and presence.\nEvents: Guided gatherings that blend insight, embodiment and human depth.\nExperiences: Transformational moments designed for lasting integration."
    }
  },
  es: {
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
    allEvents: "View All Events",
    viewMore: "View more",
    portraitAlt: "David Biddle portrait",
    loading: "Loading featured events...",
    noEvents: "No events are available right now."
  },
  es: {
    pageTitle: "Inicio",
    featured: "\u00faltimos eventos",
    featuredTitle: "\u00faltimos eventos",
    allEvents: "Ver Todos los Eventos",
    viewMore: "Ver mas",
    portraitAlt: "Retrato de David Biddle",
    loading: "Cargando eventos destacados...",
    noEvents: "No hay eventos disponibles ahora mismo."
  }
};

const heroIntroLead =
  "Todos tenemos un cuerpo y todos tenemos una vida, pero pocas veces nos detenemos a observar como ambos estan profundamente conectados. Ahi es donde trabajo yo, en el punto exacto donde tu cuerpo y tu vida se encuentran.";

const heroQuestionLineOne = "\u00bfQue cambiarias si realmente pudieras hacerlo?";
const heroQuestionLineTwo = "\u00bfQue mejorarias en tu cuerpo o en tu forma de vivir?";

const heroDavidParagraphOne =
  "Mi nombre es David Biddle, soy quiropractico con mas de 25 anos de experiencia, he dedicado mi vida a comprender esa conexion. Mi enfoque no se limita a lo fisico, trabajo contigo a nivel corporal, emocional, mental y energetico, acompanandote hacia un equilibrio mas profundo y real.";

const heroDavidParagraphTwo =
  "DEA nace de esa experiencia, es una sintesis de tecnicas, intuicion y una forma distinta de percibir la informacion mas alla de lo evidente. A traves de contactos suaves y precisos, te ayudo a reconectar con tu propia naturaleza, a escuchar tu cuerpo y a activar una capacidad que ya esta en ti: tu poder de sanacion.";

const heroPortraitUrl = "/david-hero.jpg";
const deaVideoUrl = "/dea-intro.mp4";
const deaLead =
  "We all have bodies and we all have lives. I work in that space where your body and your life meet.";
const deaQuestion =
  "What would like to change or improve in your body or in your life?";
const deaParagraphThree =
  'Working with groups of 10-24 people, we are able to harness the collective consciousness for a more profound experience. While a part of the group is receiving on the tables, the rest are seated around them, "holding the space" with their focused attention. This combination facilitates states of consciousness that promote healing and release more easily and more deeply than working alone.';

const featuredEventOverrides = {
  "deawakening-valencia": {
    title: "ResoFusion Basic - Findhorn",
    subtitle: "Findhorn, Scotland",
    dateLabel: "viernes 30 de mayo",
    image: "/resofusion-findhorn.jpg",
    alt: "ResoFusion Basic retreat visual",
    detailsLabel: "detalles"
  },
  "deawakening-madrid": {
    title: "ResoFusion Basic - Doha",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 27 de febrero",
    image: "/resofusion-doha.avif",
    alt: "ResoFusion Basic Doha visual",
    detailsLabel: "detalles"
  },
  "deawakening-barcelona": {
    title: "ResoFusion Basico - Doha",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-doha-oct.avif",
    alt: "ResoFusion Basico Doha visual",
    detailsLabel: "detalles"
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
  const [valueContent, setValueContent] = useState(fallbackContent.en.value);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [portraitError, setPortraitError] = useState(false);
  const copy = labels[currentLanguage];
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    const nextFallback = fallbackContent[currentLanguage];
    setValueContent(nextFallback.value);

    async function loadHomeData() {
      try {
        setIsLoading(true);
        setEventsError("");
        const [valueResult, eventsResult] = await Promise.allSettled([
          getSectionContent("home.value", currentLanguage),
          getEvents(currentLanguage)
        ]);

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
        <div className="container hero-stack">
          <div className="hero-top-row">
            <div className="hero-panel">
              <div className="hero-portrait-wrap">
                {!portraitError ? (
                  <img
                    className="hero-portrait"
                    src={heroPortraitUrl}
                    alt={copy.portraitAlt}
                    loading="eager"
                    onError={() => setPortraitError(true)}
                  />
                ) : (
                  <div className="hero-portrait-fallback" aria-hidden="true">
                    DB
                  </div>
                )}
              </div>
            </div>

            <article className="card hero-intro-card">
              <span className="eyebrow">David Biddle</span>
              <h1 className="hero-title">Cuerpo y vida en coherencia</h1>
              <p className="hero-intro-text">{heroIntroLead}</p>
              <div className="hero-question-block">
                <p>{heroQuestionLineOne}</p>
                <p>{heroQuestionLineTwo}</p>
              </div>
            </article>
          </div>

          <article className="hero-bottom-message">
            <h2 className="hero-bottom-title">¿Quien soy?</h2>
            <p className="hero-bottom-text">{heroDavidParagraphOne}</p>
          </article>

          <article className="card dea-origin-card">
            <h2 className="dea-origin-title">DEA</h2>
            <p className="dea-origin-text">{heroDavidParagraphTwo}</p>
          </article>

          <article className="card deawakening-values-card">
            <div className="dea-integration-block">
              <span className="eyebrow">DEAwakening</span>
              <h3 className="dea-integration-title">{valueContent.title}</h3>
              <p className="dea-integration-subtitle">{valueContent.subtitle}</p>

              <div className="dea-pillars-grid">
                {parseBodyItems(valueContent.body).map((item) => (
                  <article key={item.title} className="dea-pillar">
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <article className="card dea-feature-card">
            <div className="dea-feature-grid">
              <div className="dea-copy">
                <h2 className="dea-title">Body. Life. Awakening.</h2>
                <p className="dea-copy-text dea-copy-lead">{deaLead}</p>
                <p className="dea-question">{deaQuestion}</p>
              </div>

              <div className="dea-media-wrap">
                <video
                  className="dea-video"
                  src={deaVideoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  preload="metadata"
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <p className="dea-footer-text">{deaParagraphThree}</p>
          </article>
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
              {featuredEvents.map((event) => {
                const override = featuredEventOverrides[event.slug];
                const cardTitle = override?.title || event.title;
                const cardSubtitle = override?.subtitle || event.location;
                const cardDateLabel =
                  override?.dateLabel || formatDate(event.date, currentLanguage);
                const cardImage = override?.image || "/resofusion-findhorn.jpg";
                const cardImageAlt = override?.alt || event.title;
                const detailsLabel = override?.detailsLabel || copy.viewMore;

                return (
                  <article
                    key={event.id}
                    className="card event-card event-card-special"
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
                        {detailsLabel}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
