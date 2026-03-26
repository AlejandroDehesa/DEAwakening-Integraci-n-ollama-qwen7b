import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionExtra } from "../services/contentService";

const fallbackContent = {
  pageTitle: "About",
  title: "",
  subtitle: "",
  intro: "",
  summary: "",
  logos: [],
  whoTitle: "",
  whoText: "",
  whoText2: "",
  whoPoints: [],
  pillars: [],
  deaTitle: "",
  deaLead: "",
  deaPoints: [],
  howTitle: "",
  howPoints: [],
  resoTitle: "",
  resoLead: "",
  resoPoints: [],
  resoLinkLabel: "",
  resoLinkUrl: "https://www.resosense.com",
  videoTitle: ""
};

function About() {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    let ignore = false;

    async function loadContent() {
      try {
        const data = await getSectionExtra("about.page", currentLanguage, fallbackContent);
        if (!ignore) {
          setContent({
            ...fallbackContent,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setContent(fallbackContent);
        }
      }
    }

    loadContent();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  usePageTitle(content.pageTitle || "About");

  return (
    <section className="section about-premium-section">
      <div className="container">
        <section className="card about-hero-shell">
          <header className="section-heading about-premium-header">
            <h1>{content.title}</h1>
            <p className="page-copy">{content.subtitle}</p>
            <p className="about-premium-intro">{content.intro}</p>
          </header>

          <div className="about-logo-row" aria-label="DEA marks">
            {content.logos.map((logo) => (
              <span key={logo} className="about-logo-pill">
                {logo}
              </span>
            ))}
          </div>
        </section>

        <section className="about-identity-grid">
          <aside className="card about-portrait-card">
            <img src="/david-hero.jpg" alt="David Biddle" className="about-portrait-image" />
          </aside>

          <article className="card about-main-card">
            <h2>{content.whoTitle}</h2>
            <p>{content.whoText}</p>
            <p>{content.whoText2}</p>
            <ul className="about-method-list">
              {content.whoPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="about-summary">{content.summary}</p>
          </article>
        </section>

        <section className="card about-pillars-shell">
          <div className="about-pillars-grid">
            {content.pillars.map((pillar) => (
              <article key={pillar.title} className="about-pillar-card">
                <p className="about-pillar-symbol" aria-hidden="true">
                  {pillar.symbol}
                </p>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-dea-grid">
          <article className="card about-detail-card">
            <h2>{content.deaTitle}</h2>
            <p className="about-detail-lead">{content.deaLead}</p>
            <ul className="about-method-list">
              {content.deaPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <aside className="card about-video-card">
            <p className="detail-label">{content.videoTitle}</p>
            <div className="dea-media-wrap">
              <video
                className="dea-video"
                src="/about-david.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>
          </aside>
        </section>

        <section className="about-reso-grid">
          <article className="card about-detail-card">
            <h2>{content.howTitle}</h2>
            <ul className="about-method-list">
              {content.howPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="card about-detail-card">
            <h2>{content.resoTitle}</h2>
            <p className="about-detail-lead">{content.resoLead}</p>
            <ul className="about-method-list">
              {content.resoPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <a
              href={content.resoLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline about-reso-link"
            >
              {content.resoLinkLabel}
            </a>
          </article>
        </section>
      </div>
    </section>
  );
}

export default About;
