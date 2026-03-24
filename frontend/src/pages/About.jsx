import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getSectionContent, parseBodyItems } from "../services/contentService";

const fallbackContent = {
  en: {
    title: "DEAwakening is a space for honest transformation led by David Biddle.",
    subtitle:
      "The work brings together personal growth, therapeutic depth and spiritual openness without losing warmth or humanity.",
    body:
      "What DEAwakening is: In-person experiences where people can slow down, reconnect and move through change with real support.\nMission: Help people access deeper presence, emotional honesty and meaningful transformation.\nExperiences: Guided events that combine reflection, embodied practice and conscious community.\nWho it is for: People ready for growth that feels grounded, safe and deeply human."
  },
  es: {
    title:
      "DEAwakening es un espacio para la transformacion honesta guiado por David Biddle.",
    subtitle:
      "Este trabajo une crecimiento personal, profundidad terapeutica y apertura espiritual sin perder calidez ni humanidad.",
    body:
      "Que es DEAwakening: Experiencias presenciales donde las personas pueden parar, reconectar y atravesar cambios con apoyo real.\nMision: Ayudar a las personas a acceder a mas presencia, honestidad emocional y transformacion con sentido.\nExperiencias: Eventos guiados que combinan reflexion, practica corporal y comunidad consciente.\nPara quien es: Personas listas para un crecimiento con profundidad, seguridad y humanidad."
  }
};

const labels = {
  en: "About",
  es: "About"
};

function About() {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState(fallbackContent.en);

  useEffect(() => {
    const nextFallback = fallbackContent[currentLanguage];
    setContent(nextFallback);

    async function loadContent() {
      try {
        const data = await getSectionContent("about.main", currentLanguage);
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
        <span className="eyebrow">{labels[currentLanguage]}</span>
        <div className="section-heading">
          <h1>{content.title}</h1>
          <p className="page-copy">{content.subtitle}</p>
        </div>

        <div className="stack-grid">
          {parseBodyItems(content.body).map((item) => (
            <article key={item.title} className="card">
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
