import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getSectionExtra } from "../services/contentService";

const emptyFooter = {
  description: "",
  navigate: "",
  home: "",
  events: "",
  about: "",
  host: "",
  contact: "",
  connect: "",
  email: "",
  socials: ""
};

function Footer() {
  const { currentLanguage } = useLanguage();
  const [copy, setCopy] = useState(emptyFooter);

  useEffect(() => {
    let ignore = false;

    async function loadFooter() {
      try {
        const data = await getSectionExtra("ui.footer", currentLanguage, emptyFooter);
        if (!ignore) {
          setCopy({
            ...emptyFooter,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setCopy(emptyFooter);
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
