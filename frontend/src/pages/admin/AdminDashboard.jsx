import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Admin</span>
        <div className="section-heading">
          <h1>Manage DEAwakening content and events</h1>
          <p className="page-copy">
            Simple admin area for updating the main site copy and maintaining
            multilingual events.
          </p>
        </div>

        <div className="two-column-grid">
          <article className="card admin-card">
            <h2>Manage Events</h2>
            <p>
              Create, edit and delete events with English and Spanish
              translations.
            </p>
            <Link className="btn btn-primary" to="/admin/events">
              Open Events Admin
            </Link>
          </article>

          <article className="card admin-card">
            <h2>Manage Content</h2>
            <p>
              Edit the main public sections used across the site in both
              languages.
            </p>
            <Link className="btn btn-primary" to="/admin/content">
              Open Content Admin
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
