import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionContent, parseBodyItems } from "../services/contentService";

const fallbackContent = {
  en: {
    title: "Bring DEAwakening to your venue, retreat or community.",
    subtitle:
      "We collaborate with aligned hosts who want to offer a premium and transformational experience.",
    body:
      "What collaboration looks like: We shape each event with care so it fits the audience, venue and intention while preserving the DEAwakening experience.\nIdeal partners: Retreat centers, conscious communities, studios and facilitators who value depth, professionalism and human connection."
  },
  es: {
    title: "Lleva DEAwakening a tu espacio, retiro o comunidad.",
    subtitle:
      "Colaboramos con anfitriones alineados que desean ofrecer una experiencia premium y transformadora.",
    body:
      "Como es la colaboracion: Damos forma a cada evento con cuidado para que encaje con la audiencia, el espacio y la intencion sin perder la esencia DEAwakening.\nSocios ideales: Centros de retiro, comunidades conscientes, estudios y facilitadores que valoran profundidad, profesionalidad y conexion humana."
  }
};

const labels = {
  en: {
    pageTitle: "Host an Event",
    eyebrow: "Host an Event",
    cta: "Start the Conversation",
    helper:
      "If you would like to explore a collaboration, send us the location, audience and proposed dates."
  },
  es: {
    pageTitle: "Organizar un Evento",
    eyebrow: "Organizar un Evento",
    cta: "Empezar la Conversacion",
    helper:
      "Si quieres explorar una colaboracion, envianos la ubicacion, la audiencia y las fechas propuestas."
  }
};

function HostEvent() {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState(fallbackContent.en);
  const copy = labels[currentLanguage];
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    const nextFallback = fallbackContent[currentLanguage];
    setContent(nextFallback);

    async function loadContent() {
      try {
        const data = await getSectionContent("host.main", currentLanguage);
        setContent(data);
      } catch {
        setContent(nextFallback);
      }
    }

    loadContent();
  }, [currentLanguage]);

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">{copy.eyebrow}</span>
        <div className="section-heading">
          <h1>{content.title}</h1>
          <p className="page-copy">{content.subtitle}</p>
        </div>

        <div className="two-column-grid">
          {parseBodyItems(content.body).map((item) => (
            <article key={item.title} className="card">
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="cta-panel">
          <p>{copy.helper}</p>
          <Link className="btn btn-primary" to="/contact">
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HostEvent;
