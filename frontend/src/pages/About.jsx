import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";

const marks = {
  circle: "\u25CC",
  triangle: "\u25B3",
  star: "\u2726"
};

const aboutContent = {
  en: {
    pageTitle: "About",
    eyebrow: "About David",
    title: "Body. Life. Awakening.",
    subtitle: "I work in the space where your body and your life meet.",
    intro:
      "As a chiropractor with more than 25 years of experience, I support physical, emotional, mental and energetic change through precise and gentle work.",
    summary:
      "DEAwakening and ResoSense are practical paths to reconnect with your true nature and activate your innate capacity to heal.",
    logos: [
      `${marks.circle} DEA`,
      `${marks.triangle} ResoSense`,
      `${marks.star} Deep Energetic Awakening`
    ],
    whoTitle: "Who I am",
    whoText:
      "I am David Biddle. My focus is simple: helping you create real change in your body and in your life, with depth, clarity and human warmth.",
    pillars: [
      {
        symbol: marks.circle,
        title: "Body",
        text: "Restore coherence, mobility and natural regulation."
      },
      {
        symbol: marks.triangle,
        title: "Life",
        text: "Release patterns that keep you stuck in old cycles."
      },
      {
        symbol: marks.star,
        title: "Awakening",
        text: "Open a deeper state of awareness and integration."
      }
    ],
    deaTitle: "Deep Energetic Awakening",
    deaLead:
      "Since discovering energetic healing in 1997, David has developed a unique way of supporting personal transformation through light, precise contact.",
    deaPoints: [
      "The body stores unresolved stress as tension and distortion.",
      "DEA helps awaken physical and energetic resources for change.",
      "People often report relief, clearer perspective and renewed vitality."
    ],
    howTitle: "How DEA works",
    howPoints: [
      "Group format (10-24 people) to amplify the collective field.",
      "Rotating receive/hold-the-space dynamics for everyone.",
      "A first block opens regulation, awareness and energetic contact.",
      "A deeper second block supports release, integration and new perspective.",
      "The process begins on the table and keeps integrating for hours or days after."
    ],
    resoTitle: "ResoSense",
    resoLead:
      "In 2006, David identified frequency-based body oscillations and developed ResoSense as a gentle personal practice.",
    resoPoints: [
      "Uses your own muscles to generate standing waves of resonance.",
      "Supports physical, emotional and energetic regulation.",
      "Taught in Basic and Advanced modules, with professional training options."
    ],
    resoLinkLabel: "More information",
    resoLinkUrl: "https://www.resosense.com",
    videoTitle: "Watch the experience"
  },
  es: {
    pageTitle: "Sobre",
    eyebrow: "Sobre mi",
    title: "Cuerpo. Vida. Despertar.",
    subtitle: "Trabajo en el espacio donde tu cuerpo y tu vida se encuentran.",
    intro:
      "Como quiropractico con mas de 25 anos de experiencia, acompano procesos de cambio fisico, emocional, mental y energetico mediante un trabajo suave y preciso.",
    summary:
      "DEAwakening y ResoSense son vias practicas para reconectar con tu naturaleza y activar tu capacidad innata de sanacion.",
    logos: [
      `${marks.circle} DEA`,
      `${marks.triangle} ResoSense`,
      `${marks.star} Deep Energetic Awakening`
    ],
    whoTitle: "Quien soy",
    whoText:
      "Soy David Biddle. Mi enfoque es claro: ayudarte a generar cambios reales en tu cuerpo y en tu vida, con profundidad, claridad y cercania humana.",
    pillars: [
      {
        symbol: marks.circle,
        title: "Cuerpo",
        text: "Recuperar coherencia, movilidad y regulacion natural."
      },
      {
        symbol: marks.triangle,
        title: "Vida",
        text: "Soltar patrones que te mantienen en ciclos repetidos."
      },
      {
        symbol: marks.star,
        title: "Despertar",
        text: "Abrir un estado mas profundo de conciencia e integracion."
      }
    ],
    deaTitle: "Despertar energetico profundo",
    deaLead:
      "Desde que descubrio la sanacion energetica en 1997, David ha desarrollado una forma unica de facilitar transformacion personal con contactos suaves y precisos.",
    deaPoints: [
      "El cuerpo acumula tension y distorsiones por experiencias no resueltas.",
      "DEA despierta recursos fisicos y energeticos para generar cambio real.",
      "Muchas personas reportan alivio, mas claridad y nuevas perspectivas."
    ],
    howTitle: "Como funciona DEA",
    howPoints: [
      "Formato grupal (10-24 personas) para amplificar el campo colectivo.",
      "Rotacion entre recibir y sostener el espacio para todo el grupo.",
      "Un primer bloque abre regulacion, presencia y contacto energetico.",
      "Un segundo bloque mas profundo facilita liberacion e integracion.",
      "El proceso empieza en camilla y sigue integrandose durante horas o dias."
    ],
    resoTitle: "ResoSense",
    resoLead:
      "En 2006, David identifico frecuencias de oscilacion del cuerpo y desarrollo ResoSense como practica personal suave y profunda.",
    resoPoints: [
      "Usa tus propios musculos para crear ondas estacionarias de resonancia.",
      "Favorece regulacion fisica, emocional y energetica.",
      "Se ensena en modulos Basico y Avanzado, con opcion de formacion profesional."
    ],
    resoLinkLabel: "Mas informacion",
    resoLinkUrl: "https://www.resosense.com",
    videoTitle: "Ver experiencia"
  }
};

function About() {
  const { currentLanguage } = useLanguage();
  const content = aboutContent[currentLanguage];
  usePageTitle(content.pageTitle);

  return (
    <section className="section about-premium-section">
      <div className="container">
        <span className="eyebrow">{content.eyebrow}</span>
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

        <div className="about-premium-grid">
          <article className="card about-main-card">
            <h2>{content.whoTitle}</h2>
            <p>{content.whoText}</p>
            <p className="about-summary">{content.summary}</p>
          </article>

          <aside className="card about-portrait-card">
            <img src="/david-hero.jpg" alt="David Biddle" className="about-portrait-image" />
          </aside>
        </div>

        <div className="about-pillars-grid">
          {content.pillars.map((pillar) => (
            <article key={pillar.title} className="card about-pillar-card">
              <p className="about-pillar-symbol" aria-hidden="true">
                {pillar.symbol}
              </p>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>

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

        <div className="about-symbol-line" aria-hidden="true">
          <span>{marks.circle}</span>
          <span>{marks.triangle}</span>
          <span>{marks.star}</span>
        </div>
      </div>
    </section>
  );
}

export default About;
