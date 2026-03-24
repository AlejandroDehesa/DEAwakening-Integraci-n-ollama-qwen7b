import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const labels = {
  en: {
    home: "Home",
    events: "Events",
    about: "About",
    host: "Host an Event",
    contact: "Contact",
    admin: "Admin"
  },
  es: {
    home: "Inicio",
    events: "Eventos",
    about: "Sobre",
    host: "Organizar un Evento",
    contact: "Contacto",
    admin: "Admin"
  }
};

function Navbar() {
  const { currentLanguage, setLanguage } = useLanguage();
  const copy = labels[currentLanguage];
  const links = [
    { to: "/", label: copy.home },
    { to: "/events", label: copy.events },
    { to: "/about", label: copy.about },
    { to: "/host-an-event", label: copy.host },
    { to: "/contact", label: copy.contact },
    { to: "/admin", label: copy.admin }
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand-mark" to="/">
          <span className="brand-kicker">David Biddle</span>
          <span>DEAwakening</span>
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
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
