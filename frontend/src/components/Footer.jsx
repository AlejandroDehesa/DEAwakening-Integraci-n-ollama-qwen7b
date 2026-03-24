import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const labels = {
  en: {
    description:
      "A space for transformational events, therapeutic depth and human connection led by David Biddle.",
    navigate: "Navigate",
    home: "Home",
    events: "Events",
    about: "About",
    host: "Host an Event",
    contact: "Contact",
    connect: "Connect"
  },
  es: {
    description:
      "Un espacio para eventos transformadores, profundidad terapeutica y conexion humana guiado por David Biddle.",
    navigate: "Navegacion",
    home: "Inicio",
    events: "Eventos",
    about: "Sobre",
    host: "Organizar un Evento",
    contact: "Contacto",
    connect: "Conectar"
  }
};

function Footer() {
  const { currentLanguage } = useLanguage();
  const copy = labels[currentLanguage];

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-block">
          <p className="footer-brand">DEAwakening</p>
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
          <p className="footer-copy">hello@deawakening.com</p>
          <p className="footer-copy">Instagram / YouTube / Facebook</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
