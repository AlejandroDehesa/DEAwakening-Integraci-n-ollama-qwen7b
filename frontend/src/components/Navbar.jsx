import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getSectionExtra } from "../services/contentService";

const emptyLabels = {
  home: "",
  events: "",
  about: "",
  book: "",
  host: "",
  contact: ""
};

function Navbar() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [copy, setCopy] = useState(emptyLabels);

  useEffect(() => {
    let ignore = false;

    async function loadLabels() {
      try {
        const data = await getSectionExtra("ui.navbar", currentLanguage, emptyLabels);
        if (!ignore) {
          setCopy({
            ...emptyLabels,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setCopy(emptyLabels);
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
