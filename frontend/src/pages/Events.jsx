import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../services/eventsService";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Events</span>
        <h1>Upcoming DEAwakening experiences</h1>
        <p className="page-copy">
          Explore live gatherings created to support personal expansion,
          emotional depth and meaningful human connection.
        </p>

        {isLoading && <p className="status-message">Loading events...</p>}

        {error && <p className="status-message error-message">{error}</p>}

        {!isLoading && !error && (
          <div className="events-grid">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="card event-card event-card-link"
              >
                <p className="event-meta">{formatDate(event.date)}</p>
                <h2>{event.title}</h2>
                <p className="event-location">{event.location}</p>
                <p>{event.description}</p>
                <span className="text-link">View details</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Events;
