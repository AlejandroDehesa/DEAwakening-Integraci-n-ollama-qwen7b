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
    book: "My Book",
    host: "Host an Event",
    contact: "Contact",
    connect: "Connect",
    email: "hello@deawakening.com",
    rights: "All rights reserved."
  },
  es: {
    description:
      "Un espacio para eventos transformadores, profundidad terapeutica y conexion humana guiado por David Biddle.",
    navigate: "Navegacion",
    home: "Inicio",
    events: "Eventos",
    about: "Sobre mi",
    book: "Mi Libro",
    host: "Organizar un Evento",
    contact: "Contacto",
    connect: "Conectar",
    email: "hello@deawakening.com",
    rights: "Todos los derechos reservados."
  },
  de: {
    description:
      "Ein Raum fur transformierende Veranstaltungen, therapeutische Tiefe und menschliche Verbindung mit David Biddle.",
    navigate: "Navigation",
    home: "Start",
    events: "Veranstaltungen",
    about: "Uber mich",
    book: "Mein Buch",
    host: "Event ausrichten",
    contact: "Kontakt",
    connect: "Kontakt",
    email: "hello@deawakening.com",
    rights: "Alle Rechte vorbehalten."
  }
};

const socialItems = [
  {
    key: "instagram",
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.8A5.2 5.2 0 1 1 6.8 13 5.2 5.2 0 0 1 12 7.8zm0 2A3.2 3.2 0 1 0 15.2 13 3.2 3.2 0 0 0 12 9.8zm5.5-3.1a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2z" />
      </svg>
    )
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23 12s0-3.1-.4-4.5a3.2 3.2 0 0 0-2.2-2.2C19 4.9 12 4.9 12 4.9s-7 0-8.4.4a3.2 3.2 0 0 0-2.2 2.2C1 8.9 1 12 1 12s0 3.1.4 4.5a3.2 3.2 0 0 0 2.2 2.2C5 19.1 12 19.1 12 19.1s7 0 8.4-.4a3.2 3.2 0 0 0 2.2-2.2c.4-1.4.4-4.5.4-4.5zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    )
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.9-2.1 3.9-2.1 4.2 0 5 2.7 5 6.3V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21H9z" />
      </svg>
    )
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H8v3h2.3v8h3.2z" />
      </svg>
    )
  }
];

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

  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer footer-premium">
      <div className="container footer-premium-shell">
        <section className="footer-premium-brand">
          <Link to="/" className="footer-premium-brand-mark" aria-label="DEAwakening">
            <img
              className="footer-premium-symbol"
              src="/deawakening_symbol.png"
              alt="DEAwakening symbol"
              loading="lazy"
            />
          </Link>
          <p className="footer-premium-title">DEAwakening</p>
          <p className="footer-premium-description">{copy.description}</p>
        </section>

        <section className="footer-premium-nav">
          <p className="footer-premium-heading">{copy.navigate}</p>
          <div className="footer-premium-nav-grid">
            <Link to="/">{copy.home}</Link>
            <Link to="/events">{copy.events}</Link>
            <Link to="/about">{copy.about}</Link>
            <Link to="/mi-libro">{copy.book}</Link>
            <Link to="/host-an-event">{copy.host}</Link>
            <Link to="/contact">{copy.contact}</Link>
          </div>
        </section>

        <section className="footer-premium-connect">
          <p className="footer-premium-heading">{copy.connect}</p>
          <a className="footer-premium-email" href={`mailto:${copy.email}`}>
            {copy.email}
          </a>
          <div className="footer-premium-socials">
            {socialItems.map((item) => (
              <a
                key={item.key}
                className="footer-premium-social-link"
                href={item.href}
                aria-label={item.label}
                title={item.label}
              >
                <span className="footer-premium-social-icon">{item.icon}</span>
                <span className="sr-only">{item.label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="container footer-premium-bottom">
        <p>{`(c) ${currentYear} DEAwakening · ${copy.rights}`}</p>
      </div>
    </footer>
  );
}

export default Footer;
