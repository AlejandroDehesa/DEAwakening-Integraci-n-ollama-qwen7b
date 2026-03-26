import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionExtra } from "../services/contentService";

const fallbackContent = {
  pageTitle: "Host an Event",
  eyebrow: "",
  title: "",
  subtitle: "",
  intro: "",
  formatText: "",
  programsTitle: "",
  programs: [],
  retreatTitle: "",
  retreatText: "",
  retreatCta: "",
  proofTitle: "",
  proofText: "",
  proofHighlight: "",
  finalCtaText: "",
  finalCtaButton: ""
};

function HostEvent() {
  const { currentLanguage } = useLanguage();
  const [copy, setCopy] = useState(fallbackContent);

  useEffect(() => {
    let ignore = false;

    async function loadContent() {
      try {
        const data = await getSectionExtra("host.page", currentLanguage, fallbackContent);
        if (!ignore) {
          setCopy({
            ...fallbackContent,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setCopy(fallbackContent);
        }
      }
    }

    loadContent();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  usePageTitle(copy.pageTitle || "Host an Event");

  return (
    <section className="section host-page">
      <div className="container host-page-stack">
        <header className="card host-hero-card">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
        </header>

        <section className="host-main-grid">
          <article className="card host-copy-card">
            <h2>{copy.subtitle}</h2>
            <p>{copy.intro}</p>
            <p>{copy.formatText}</p>
          </article>

          <article className="card host-programs-card">
            <h2>{copy.programsTitle}</h2>
            <ul className="host-program-list">
              {copy.programs.map((program) => (
                <li key={program}>{program}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="host-main-grid">
          <article className="card host-proof-card">
            <h2>{copy.proofTitle}</h2>
            <p>{copy.proofText}</p>
            <p className="host-proof-highlight">{copy.proofHighlight}</p>
          </article>

          <article className="card host-retreat-card">
            <h2>{copy.retreatTitle}</h2>
            <p>{copy.retreatText}</p>
            <a
              className="btn btn-outline"
              href="/retreat-program-portugal.pdf"
              target="_blank"
              rel="noreferrer"
            >
              {copy.retreatCta}
            </a>
          </article>
        </section>

        <div className="cta-panel host-cta-panel">
          <p>{copy.finalCtaText}</p>
          <Link className="btn btn-primary" to="/contact">
            {copy.finalCtaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HostEvent;
