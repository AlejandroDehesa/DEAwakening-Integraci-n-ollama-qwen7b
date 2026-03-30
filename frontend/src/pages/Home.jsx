import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AssistantHero from "../components/assistant/AssistantHero";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  getSectionContent,
  getSectionExtra,
  parseBodyItems
} from "../services/contentService";
import { getEvents } from "../services/eventsService";

const fallbackValue = {
  title: "",
  subtitle: "",
  body: ""
};

const fallbackFront = {
  pageTitle: "Home",
  eyebrow: "",
  heroTitle: "",
  heroIntroLead: "",
  heroQuestionLineOne: "",
  heroQuestionLineTwo: "",
  heroWhoTitle: "",
  heroWhoText: "",
  deaTitle: "",
  deaText: "",
  deaFeatureTitle: "",
  deaFeatureLead: "",
  deaFeatureQuestion: "",
  deaFeatureFooter: "",
  featuredEyebrow: "",
  featuredTitle: "",
  allEvents: "",
  viewMore: "",
  loading: "",
  noEvents: "",
  portraitAlt: "",
  featuredOverrides: {}
};

const heroPortraitUrl = "/david-hero.jpg";
const deaVideoUrl = "/dea-intro.mp4";

function formatDate(date, language) {
  const locale =
    language === "es" ? "es-ES" : language === "de" ? "de-DE" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Home() {
  const { currentLanguage } = useLanguage();
  const [frontContent, setFrontContent] = useState(fallbackFront);
  const [valueContent, setValueContent] = useState(fallbackValue);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [portraitError, setPortraitError] = useState(false);

  usePageTitle(frontContent.pageTitle || fallbackFront.pageTitle);

  useEffect(() => {
    let ignore = false;

    async function loadHomeData() {
      try {
        setIsLoading(true);
        setEventsError("");

        const [frontResult, valueResult, eventsResult] = await Promise.allSettled([
          getSectionExtra("home.front", currentLanguage, fallbackFront),
          getSectionContent("home.value", currentLanguage),
          getEvents(currentLanguage)
        ]);

        if (!ignore && frontResult.status === "fulfilled") {
          setFrontContent({
            ...fallbackFront,
            ...frontResult.value
          });
        }

        if (!ignore && valueResult.status === "fulfilled") {
          setValueContent(valueResult.value);
        }

        if (!ignore && eventsResult.status === "fulfilled") {
          setFeaturedEvents(eventsResult.value.slice(0, 3));
        } else if (!ignore && eventsResult.status === "rejected") {
          setEventsError(eventsResult.reason.message);
          setFeaturedEvents([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  return (
    <>
      <section className="section hero-section">
        <div className="container hero-stack">
          <AssistantHero />

          <div className="hero-top-row">
            <div className="hero-panel">
              <div className="hero-portrait-wrap">
                {!portraitError ? (
                  <img
                    className="hero-portrait"
                    src={heroPortraitUrl}
                    alt={frontContent.portraitAlt}
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
              <span className="eyebrow">{frontContent.eyebrow}</span>
              <h1 className="hero-title">{frontContent.heroTitle}</h1>
              <p className="hero-intro-text">{frontContent.heroIntroLead}</p>
              <div className="hero-question-block">
                <p>{frontContent.heroQuestionLineOne}</p>
                <p>{frontContent.heroQuestionLineTwo}</p>
              </div>
            </article>
          </div>

          <article className="hero-bottom-message">
            <h2 className="hero-bottom-title">{frontContent.heroWhoTitle}</h2>
            <p className="hero-bottom-text">{frontContent.heroWhoText}</p>
          </article>

          <article className="card dea-origin-card">
            <h2 className="dea-origin-title">{frontContent.deaTitle}</h2>
            <p className="dea-origin-text">{frontContent.deaText}</p>
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
                <h2 className="dea-title">{frontContent.deaFeatureTitle}</h2>
                <p className="dea-copy-text dea-copy-lead">{frontContent.deaFeatureLead}</p>
                <p className="dea-question">{frontContent.deaFeatureQuestion}</p>
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
            <p className="dea-footer-text">{frontContent.deaFeatureFooter}</p>
          </article>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading section-heading-row">
            <div>
              <span className="eyebrow">{frontContent.featuredEyebrow}</span>
              <h2>{frontContent.featuredTitle}</h2>
            </div>
            <Link className="btn btn-outline" to="/events">
              {frontContent.allEvents}
            </Link>
          </div>

          {isLoading ? (
            <p className="status-message loading-message">{frontContent.loading}</p>
          ) : eventsError ? (
            <p className="status-message error-message">{eventsError}</p>
          ) : featuredEvents.length === 0 ? (
            <p className="status-message">{frontContent.noEvents}</p>
          ) : (
            <div className="three-column-grid">
              {featuredEvents.map((event) => {
                const override = frontContent.featuredOverrides?.[event.slug];
                const cardTitle = override?.title || event.title;
                const cardSubtitle = override?.subtitle || event.location;
                const cardDateLabel =
                  override?.dateLabel || formatDate(event.date, currentLanguage);
                const cardImage = override?.image || "/resofusion-findhorn.jpg";
                const cardImageAlt = override?.alt || event.title;
                const detailsLabel = override?.detailsLabel || frontContent.viewMore;

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
