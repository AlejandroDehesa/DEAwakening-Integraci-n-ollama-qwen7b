import { Link } from "react-router-dom";

const placeholderEvents = [
  { slug: "deep-awakening-intensive", title: "Deep Awakening Intensive" },
  { slug: "inner-freedom-retreat", title: "Inner Freedom Retreat" }
];

function Events() {
  return (
    <section className="page-section">
      <div className="container">
        <span className="eyebrow">Events</span>
        <h1>Upcoming Experiences</h1>
        <p className="page-copy">
          Placeholder events listing ready to connect to real backend content.
        </p>

        <div className="placeholder-grid">
          {placeholderEvents.map((event) => (
            <article key={event.slug} className="placeholder-card">
              <h2>{event.title}</h2>
              <p>Event content will be connected in a later phase.</p>
              <Link to={`/events/${event.slug}`}>View event</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Events;
