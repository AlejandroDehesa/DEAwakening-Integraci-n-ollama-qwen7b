import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getSectionExtra } from "../services/contentService";

const fallbackFooterByLanguage = {
  en: {
    description:
      "A space for transformational events, therapeutic depth and human connection led by David Biddle.",
    navigate: "Navigate",
    home: "Home",
    events: "Events",
    about: "About",
    host: "Host an Event",
    contact: "Contact",
    connect: "Connect",
    email: "hello@deawakening.com",
    socials: "Instagram / YouTube / Facebook"
  },
  es: {
    description:
      "Un espacio para eventos transformadores, profundidad terapeutica y conexion humana guiado por David Biddle.",
    navigate: "Navegacion",
    home: "Inicio",
    events: "Eventos",
    about: "Sobre mi",
    host: "Organizar un Evento",
    contact: "Contacto",
    connect: "Conectar",
    email: "hello@deawakening.com",
    socials: "Instagram / YouTube / Facebook"
  },
  de: {
    description:
      "Ein Raum fur transformierende Veranstaltungen, therapeutische Tiefe und menschliche Verbindung mit David Biddle.",
    navigate: "Navigation",
    home: "Start",
    events: "Veranstaltungen",
    about: "Uber mich",
    host: "Event ausrichten",
    contact: "Kontakt",
    connect: "Kontakt",
    email: "hello@deawakening.com",
    socials: "Instagram / YouTube / Facebook"
  }
};

function Footer() {
  const { currentLanguage } = useLanguage();
  const [copy, setCopy] = useState(fallbackFooterByLanguage.en);

  useEffect(() => {
    let ignore = false;

    async function loadFooter() {
      const nextFallback =
        fallbackFooterByLanguage[currentLanguage] || fallbackFooterByLanguage.en;
      if (!ignore) {
        setCopy(nextFallback);
      }

      try {
        const data = await getSectionExtra("ui.footer", currentLanguage, nextFallback);
        if (!ignore) {
          setCopy({
            ...nextFallback,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setCopy(nextFallback);
        }
      }
    }

    loadFooter();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-block">
          <Link to="/" className="footer-brand-link" aria-label="DEAwakening">
            <img
              className="footer-logo"
              src="/deawakening_symbol.png"
              alt="DEAwakening"
              loading="lazy"
            />
          </Link>
          <p className="footer-copy">{copy.description}</p>
        </div>

        <div className="footer-block footer-links">
          <p className="footer-heading">{copy.navigate}</p>
          <Link to="/">{copy.home}</Link>
          <Link to="/events">{copy.events}</Link>
          <Link to="/about">{copy.about}</Link>
          <Link to="/host-an-event">{copy.host}</Link>
          <Link to="/contact">{copy.contact}</Link>
        </div>

        <div className="footer-block">
          <p className="footer-heading">{copy.connect}</p>
          <p className="footer-copy">{copy.email}</p>
          <p className="footer-copy">{copy.socials}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
