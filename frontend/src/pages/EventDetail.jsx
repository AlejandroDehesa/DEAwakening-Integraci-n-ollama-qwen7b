import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventBySlug, registerForEvent } from "../services/eventsService";

const initialForm = {
  name: "",
  email: ""
};

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
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitState, setSubmitState] = useState("idle");

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      setError("");
      setEvent(null);

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

  function handleChange(eventTarget) {
    const { name, value } = eventTarget.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (formData.name.trim().length < 2) {
      nextErrors.name = "Please enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email.";
    }

    return nextErrors;
  }

  async function handleSubmit(eventTarget) {
    eventTarget.preventDefault();

    if (!event) {
      return;
    }

    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    setSubmitMessage("");
    setSubmitState("idle");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await registerForEvent(event.id, formData);
      setSubmitMessage("Your registration has been received.");
      setSubmitState("success");
      setFormData(initialForm);
    } catch (requestError) {
      setSubmitMessage(requestError.message);
      setSubmitState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Event Detail</span>

        {isLoading && <p className="status-message loading-message">Loading event...</p>}

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

              <form className="form-card" onSubmit={handleSubmit} noValidate>
                <div>
                  <p className="detail-label">Register</p>
                  <p className="footer-copy">
                    Reserve your place for this DEAwakening event.
                  </p>
                </div>

                <label className="field">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                  {formErrors.name && (
                    <small className="field-error">{formErrors.name}</small>
                  )}
                </label>

                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                  {formErrors.email && (
                    <small className="field-error">{formErrors.email}</small>
                  )}
                </label>

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Register Now"}
                </button>

                {submitMessage && (
                  <p
                    className={
                      submitState === "error"
                        ? "status-message error-message"
                        : "status-message"
                    }
                  >
                    {submitMessage}
                  </p>
                )}
              </form>
            </aside>
          </article>
        )}
      </div>
    </section>
  );
}

export default EventDetail;
