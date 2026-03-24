import { Link } from "react-router-dom";

function HostEvent() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Host an Event</span>
        <div className="section-heading">
          <h1>Bring DEAwakening to your community or venue.</h1>
          <p className="page-copy">
            We collaborate with retreat spaces, wellness communities, studios
            and event hosts who want to offer a premium, human and
            transformational experience.
          </p>
        </div>

        <div className="two-column-grid">
          <article className="card">
            <h2>What collaboration looks like</h2>
            <p>
              We work closely with local hosts to shape an event that fits the
              audience, venue and intention while preserving the DEAwakening
              experience.
            </p>
          </article>

          <article className="card">
            <h2>Ideal partners</h2>
            <p>
              Retreat centres, conscious communities, personal growth spaces and
              aligned facilitators looking to co-create a meaningful event.
            </p>
          </article>
        </div>

        <div className="cta-panel">
          <p>
            If you would like to explore a collaboration, send us the location,
            audience and proposed dates.
          </p>
          <Link className="btn btn-primary" to="/contact">
            Start the Conversation
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HostEvent;
