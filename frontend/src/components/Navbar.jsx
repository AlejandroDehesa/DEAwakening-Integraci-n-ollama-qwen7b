import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/host-an-event", label: "Host an Event" },
  { to: "/contact", label: "Contact" }
];

function Navbar() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand-mark" to="/">
          DEAwakening
        </NavLink>

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
      </div>
    </header>
  );
}

export default Navbar;
