import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";

const content = {
  en: {
    pageTitle: "Host an Event",
    eyebrow: "Host an Event",
    title: "Would you like to host a DEAwakening workshop or retreat near you?",
    subtitle: "Tailor-made events",
    intro:
      "What would you like to create? Whether you want a stand-alone event based on my work or you prefer to integrate these possibilities into a multidisciplinary event, I would be happy to explore the options with you.",
    formatText:
      "A wide range of workshops and retreats can be offered, depending on what you want participants to experience and receive, and how actively they want to engage in their own healing process.",
    programsTitle: "Program options",
    programs: [
      "1) Experiential healing with DEA, 1-3 days.",
      "2) Active learning with Resosense PPS, 2-3 days.",
      "3) RESOFUSION program: DEA + Resosense PPS, 3-5 days.",
      "4) For longer and more complete programs, we can add other modalities such as breath practices, focused energetic movement, body-awareness movement and more."
    ],
    retreatTitle: "Sample retreat format",
    retreatText:
      "Here is an example structure from a recent RESOFUSION retreat in Portugal.",
    retreatCta: "Retreat Program",
    proofTitle: "Integration in larger events",
    proofText:
      "DEA can be a valuable addition to group events focused on wellbeing, personal development, awareness and healing.",
    proofHighlight:
      "At the Harvest Series in Turkey (May 2022 and 2023), six DEA sessions with 24 participants each allowed almost half of the attendees to experience DEA, many of them describing life-changing results.",
    finalCtaText:
      "If you would like to explore a collaboration, share your location, audience and possible dates.",
    finalCtaButton: "Start the Conversation"
  },
  es: {
    pageTitle: "Organizar un Evento",
    eyebrow: "Organizar un Evento",
    title: "DEAwakening cerca de ti",
    subtitle: "Te gustaria tener un taller o retiro?",
    intro:
      "Que te gustaria crear? Tanto si deseas crear un evento basado en mi trabajo como si prefieres incorporar estas posibilidades a tu evento multidisciplinar, estare encantado de analizar las opciones contigo.",
    formatText:
      "Se puede ofrecer una amplia gama de talleres y retiros, segun lo que quieras que vivan y reciban los participantes, y segun su interes en tener un papel activo en su propio proceso de sanacion.",
    programsTitle: "Programas disponibles",
    programs: [
      "1) Sanacion experiencial con DEA, 1-3 dias.",
      "2) Aprendizaje activo con Resosense PPS, 2-3 dias.",
      "3) Programa RESOFUSION: DEA + Resosense PPS, 3-5 dias.",
      "4) Para programas mas largos y completos, podemos anadir otras modalidades como ejercicios de respiracion, movimientos energeticos focalizados, movimientos de conciencia corporal y mas."
    ],
    retreatTitle: "Ejemplo de retiro",
    retreatText:
      "Aqui tienes un ejemplo de estructura de un retiro reciente de RESOFUSION en Portugal.",
    retreatCta: "Programa del Retiro",
    proofTitle: "Integracion en eventos mas amplios",
    proofText:
      "La DEA puede ser una incorporacion de gran valor en eventos grupales de bienestar, desarrollo personal, consciencia y sanacion.",
    proofHighlight:
      "En la Serie Cosecha de Turquia (mayo de 2022 y 2023), seis sesiones DEA con 24 personas en cada una permitieron que casi la mitad de los asistentes experimentaran las posibilidades de la DEA, muchas con vivencias que les cambiaron la vida.",
    finalCtaText:
      "Si quieres explorar una colaboracion, comparte ubicacion, tipo de audiencia y fechas aproximadas.",
    finalCtaButton: "Empezar la Conversacion"
  }
};

function HostEvent() {
  const { currentLanguage } = useLanguage();
  const copy = content[currentLanguage];
  usePageTitle(copy.pageTitle);

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
