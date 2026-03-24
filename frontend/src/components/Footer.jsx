import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">DEAwakening / David Biddle</p>
          <p className="footer-copy">
            Foundational platform structure for the next DEAwakening experience.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/about">About</Link>
          <Link to="/host-an-event">Host an Event</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div>
          <p className="footer-heading">Social</p>
          <p className="footer-copy">Instagram / YouTube / Facebook</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
