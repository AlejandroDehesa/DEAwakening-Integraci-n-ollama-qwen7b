import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getEvents } from "../services/eventsService";

const labels = {
  en: {
    pageTitle: "Events",
    eyebrow: "Events",
    title: "Upcoming DEAwakening experiences",
    intro:
      "Explore live gatherings created to support personal expansion, emotional depth and meaningful human connection.",
    loading: "Loading events...",
    empty: "No events are available right now.",
    details: "View details",
    scheduled: "scheduled events"
  },
  es: {
    pageTitle: "Eventos",
    eyebrow: "Eventos",
    title: "Proximas experiencias DEAwakening",
    intro:
      "Explora encuentros en vivo creados para apoyar expansion personal, profundidad emocional y una conexion humana real.",
    loading: "Cargando eventos...",
    empty: "No hay eventos disponibles ahora mismo.",
    details: "Ver detalles",
    scheduled: "eventos programados"
  }
};

const specialEventOverrides = {
  "deawakening-valencia": {
    title: "ResoFusion Basic - Findhorn",
    subtitle: "Findhorn, Scotland",
    dateLabel: "viernes 30 de mayo",
    image: "/resofusion-findhorn.jpg",
    alt: "ResoFusion Basic retreat visual"
  },
  "deawakening-madrid": {
    title: "ResoFusion Basic - Doha",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 27 de febrero",
    image: "/resofusion-doha.avif",
    alt: "ResoFusion Basic Doha visual"
  },
  "deawakening-barcelona": {
    title: "ResoFusion Basico - Doha",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-doha-oct.avif",
    alt: "ResoFusion Basico Doha visual"
  },
  "deawakening-malaga": {
    title: "Degustacion de ResoFusion",
    subtitle: "Niya Honor Air, Doha",
    dateLabel: "jueves 17 de octubre",
    image: "/resofusion-tasting-doha.avif",
    alt: "Degustacion de ResoFusion Doha visual"
  },
  "deawakening-sevilla": {
    title: "ResoFusion Basico",
    subtitle: "Srithanu, Koh Phangan, Tailandia",
    dateLabel: "viernes 6 de septiembre",
    image: "/resofusion-orion.avif",
    alt: "ResoFusion Basico Orion Healing visual"
  },
  "deawakening-bilbao": {
    title: "Degustador de ResoFusion",
    subtitle: "Sanacion de Orion",
    dateLabel: "jueves 05 de septiembre",
    image: "/resofusion-taster-orion.avif",
    alt: "Degustador de ResoFusion Orion visual"
  },
  "deawakening-zaragoza": {
    title: "ResoFusion Basic en Mallorca",
    subtitle: "Palma",
    dateLabel: "sabado, 29 de junio",
    image: "/resofusion-mallorca.avif",
    alt: "ResoFusion Basic en Mallorca visual"
  },
  "deawakening-alicante": {
    title: "DEA at Casa Wald",
    subtitle: "Illes Balears",
    dateLabel: "domingo, 02 de junio",
    image:
      "https://static.wixstatic.com/media/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_61c43318698a4d149dc78da50d108aee~mv2.jpg",
    alt: "DEA at Casa Wald visual"
  },
  "deawakening-granada": {
    title: "DEA at Orion Healing Center",
    subtitle: "Orion Healing Centre",
    dateLabel: "domingo, 28 de enero",
    image:
      "https://static.wixstatic.com/media/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp/v1/fill/w_960,h_660,al_c,q_85,enc_auto/dd0fe1_6933d50031284995b2357b434febe3f6~mv2.webp",
    alt: "DEA at Orion Healing Center visual"
  },
  "deawakening-palma": {
    title: "DEA at the Sactuary",
    subtitle: "Tambon Ban Tai",
    dateLabel: "miercoles, 10 de enero",
    image:
      "https://static.wixstatic.com/media/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg/v1/fill/w_980,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_0a5e554a65f44b8d9aba1bbecdc65cfb~mv2.jpg",
    alt: "DEA at the Sactuary visual"
  },
  "deawakening-san-sebastian": {
    title: "DEAwakening One Day Intensive",
    subtitle: "Sesimbra",
    dateLabel: "domingo, 25 de junio",
    image:
      "https://static.wixstatic.com/media/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_c6576ba2a50e46a6b7051521052cc2d3~mv2.jpg",
    alt: "DEAwakening One Day Intensive visual"
  },
  "deawakening-murcia": {
    title: "ResoFusion Retreat Portugal",
    subtitle: "Casa Na Ferraria",
    dateLabel: "lunes, 19 de junio",
    image:
      "https://static.wixstatic.com/media/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg/v1/fill/w_980,h_1471,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_b7baee3ac7fa485aafcf3e56fa491548~mv2.jpeg",
    alt: "ResoFusion Retreat Portugal visual"
  },
  "deawakening-santiago-compostela": {
    title: "Harvest Series 7 - Kaplankaya",
    subtitle: "Six Senses Kaplankaya",
    dateLabel: "miercoles, 10 de mayo",
    image:
      "https://static.wixstatic.com/media/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg/v1/fill/w_980,h_551,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/dd0fe1_d1f9d9f97d4c4b0bb12364e24c344304~mv2.jpg",
    alt: "Harvest Series 7 visual"
  },
  "deawakening-las-palmas": {
    title: "ResoFusion",
    subtitle: "Niagara Wellness",
    dateLabel: "sabado, 06 de mayo",
    image:
      "https://static.wixstatic.com/media/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg/v1/fill/w_980,h_1431,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/nsplsh_fdcbd4bf1e4c4981a7039c98ba125628~mv2.jpg",
    alt: "ResoFusion event visual"
  }
};

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Events() {
  const { currentLanguage } = useLanguage();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const copy = labels[currentLanguage];
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoading(true);
        setError("");
        const eventsData = await getEvents(currentLanguage);
        setEvents(eventsData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
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
                const override = specialEventOverrides[event.slug];
                const cardTitle = override?.title || event.title;
                const cardSubtitle = override?.subtitle || event.location;
                const cardDateLabel =
                  override?.dateLabel || formatDate(event.date, currentLanguage);
                const cardImage = override?.image || "/resofusion-findhorn.jpg";
                const cardImageAlt = override?.alt || event.title;

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
