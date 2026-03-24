import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEvents } from "../services/eventsService";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    async function loadFeaturedEvents() {
      try {
        const events = await getEvents();
        setFeaturedEvents(events.slice(0, 3));
      } catch (error) {
        setEventsError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeaturedEvents();
  }, []);

  return (
    <>
      <section className="section hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">David Biddle</span>
            <h1>Transformational experiences for deeper human awakening.</h1>
            <p className="lead">
              DEAwakening brings together personal growth, embodied healing and
              meaningful community through immersive live events guided with
              clarity, care and presence.
            </p>
            <div className="button-row">
              <Link className="btn btn-primary" to="/events">
                Explore Events
              </Link>
              <Link className="btn btn-outline" to="/host-an-event">
                Host an Event
              </Link>
            </div>
          </div>

          <div className="card hero-panel">
            <p className="panel-label">What people come for</p>
            <ul className="feature-list">
              <li>Real-world events with therapeutic depth</li>
              <li>Safe, grounded spaces for inner transformation</li>
              <li>Community-led experiences that continue beyond the room</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">The Experience</span>
            <h2>DEAwakening is built around connection, presence and lived transformation.</h2>
          </div>

          <div className="three-column-grid">
            <article className="card">
              <h3>Community</h3>
              <p>
                A welcoming space where people can meet with honesty, openness
                and a shared intention to grow.
              </p>
            </article>
            <article className="card">
              <h3>Events</h3>
              <p>
                Carefully guided in-person gatherings that combine insight,
                reflection and embodied practice.
              </p>
            </article>
            <article className="card">
              <h3>Experiences</h3>
              <p>
                Transformational moments designed to create lasting shifts in
                awareness, relationships and self-understanding.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading section-heading-row">
            <div>
              <span className="eyebrow">Featured Events</span>
              <h2>Upcoming gatherings across Spain.</h2>
            </div>
            <Link className="btn btn-outline" to="/events">
              View All Events
            </Link>
          </div>

          {isLoading ? (
            <p className="status-message loading-message">Loading featured events...</p>
          ) : eventsError ? (
            <p className="status-message error-message">{eventsError}</p>
          ) : featuredEvents.length === 0 ? (
            <p className="status-message">No events are available right now.</p>
          ) : (
            <div className="three-column-grid">
              {featuredEvents.map((event) => (
                <article key={event.id} className="card event-card">
                  <p className="event-meta">{formatDate(event.date)}</p>
                  <h3>{event.title}</h3>
                  <p className="event-location">{event.location}</p>
                  <Link className="text-link" to={`/events/${event.slug}`}>
                    Ver mas
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
