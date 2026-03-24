import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-block">
          <p className="footer-brand">DEAwakening</p>
          <p className="footer-copy">
            A space for transformational events, therapeutic depth and human
            connection led by David Biddle.
          </p>
        </div>

        <div className="footer-block footer-links">
          <p className="footer-heading">Navigate</p>
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/about">About</Link>
          <Link to="/host-an-event">Host an Event</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin">Admin</Link>
        </div>

        <div className="footer-block">
          <p className="footer-heading">Connect</p>
          <p className="footer-copy">hello@deawakening.com</p>
          <p className="footer-copy">Instagram / YouTube / Facebook</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
