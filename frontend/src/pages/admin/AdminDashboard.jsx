import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Admin</span>
        <div className="section-heading">
          <h1>Manage DEAwakening content and events</h1>
          <p className="page-copy">
            A lightweight workspace for keeping the public site current,
            coherent and ready in both languages.
          </p>
        </div>

        <div className="two-column-grid">
          <article className="card admin-card">
            <h2>Manage Events</h2>
            <p>
              Create, edit and refine event details with clear English and
              Spanish translations.
            </p>
            <Link className="btn btn-primary" to="/admin/events">
              Open Events Admin
            </Link>
          </article>

          <article className="card admin-card">
            <h2>Manage Content</h2>
            <p>
              Update the main public sections used across the site in both
              languages from one place.
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
