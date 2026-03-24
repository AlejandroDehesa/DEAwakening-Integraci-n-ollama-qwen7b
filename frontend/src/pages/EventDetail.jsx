import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventBySlug } from "../services/eventsService";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEventBySlug(slug);
        setEvent(eventData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [slug]);

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Event Detail</span>

        {isLoading && <p className="status-message">Loading event...</p>}

        {error && <p className="status-message error-message">{error}</p>}

        {event && (
          <article className="detail-layout">
            <div className="detail-content">
              <h1>{event.title}</h1>
              <p className="page-copy detail-copy">{event.description}</p>
            </div>

            <aside className="card detail-sidebar">
              <div>
                <p className="detail-label">Date</p>
                <p>{formatDate(event.date)}</p>
              </div>
              <div>
                <p className="detail-label">Location</p>
                <p>{event.location}</p>
              </div>
            </aside>
          </article>
        )}
      </div>
    </section>
  );
}

export default EventDetail;
