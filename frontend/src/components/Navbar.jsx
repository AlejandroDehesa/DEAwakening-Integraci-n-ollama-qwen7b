import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getSectionExtra } from "../services/contentService";

const fallbackLabelsByLanguage = {
  en: {
    assistant: "AI GUIDE",
    home: "HOME",
    events: "EVENTS",
    about: "ABOUT",
    book: "MY BOOK",
    host: "HOST AN EVENT",
    contact: "CONTACT"
  },
  es: {
    assistant: "GUÍA IA",
    home: "INICIO",
    events: "EVENTOS",
    about: "SOBRE MI",
    book: "MI LIBRO",
    host: "ORGANIZAR EVENTO",
    contact: "CONTACTO"
  },
  de: {
    assistant: "KI GUIDE",
    home: "START",
    events: "VERANSTALTUNGEN",
    about: "UBER MICH",
    book: "MEIN BUCH",
    host: "EVENT AUSRICHTEN",
    contact: "KONTAKT"
  }
};

function Navbar() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [copy, setCopy] = useState(fallbackLabelsByLanguage.en);

  useEffect(() => {
    let ignore = false;

    async function loadLabels() {
      const nextFallback =
        fallbackLabelsByLanguage[currentLanguage] || fallbackLabelsByLanguage.en;
      if (!ignore) {
        setCopy(nextFallback);
      }

      try {
        const data = await getSectionExtra("ui.navbar", currentLanguage, nextFallback);
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

    loadLabels();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  const links = [
    { to: "/", label: copy.home },
    { to: "/events", label: copy.events },
    { to: "/about", label: copy.about },
    { to: "/mi-libro", label: copy.book },
    { to: "/host-an-event", label: copy.host },
    { to: "/contact", label: copy.contact }
  ];

  function handleOpenAssistant() {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new CustomEvent("assistant:open"));
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand-mark" to="/" aria-label="DEAwakening">
          <img
            className="brand-logo brand-logo-full"
            src="/deawakening_symbol.png"
            alt="DEAwakening"
          />
        </NavLink>

        <button
          type="button"
          className="assistant-navbar-trigger"
          onClick={handleOpenAssistant}
        >
          {copy.assistant}
        </button>

        <div className="header-tools">
          <nav className="main-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="language-switcher" aria-label="Language switcher">
            <button
              className={
                currentLanguage === "en"
                  ? "language-option language-option-active"
                  : "language-option"
              }
              type="button"
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <button
              className={
                currentLanguage === "es"
                  ? "language-option language-option-active"
                  : "language-option"
              }
              type="button"
              onClick={() => setLanguage("es")}
            >
              ES
            </button>
            <button
              className={
                currentLanguage === "de"
                  ? "language-option language-option-active"
                  : "language-option"
              }
              type="button"
              onClick={() => setLanguage("de")}
            >
              DE
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
