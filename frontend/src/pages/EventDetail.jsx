import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getEventBySlug, registerForEvent } from "../services/eventsService";

const initialForm = {
  name: "",
  email: ""
};

const labels = {
  en: {
    eyebrow: "Event Detail",
    loading: "Loading event...",
    date: "Date",
    location: "Location",
    register: "Register",
    registerIntro: "Reserve your place for this DEAwakening event.",
    name: "Name",
    email: "Email",
    submit: "Register Now",
    submitting: "Submitting...",
    success: "Your registration has been received.",
    nameError: "Please enter your name.",
    emailError: "Please enter a valid email."
  },
  es: {
    eyebrow: "Detalle del Evento",
    loading: "Cargando evento...",
    date: "Fecha",
    location: "Ubicacion",
    register: "Inscripcion",
    registerIntro: "Reserva tu plaza para este evento DEAwakening.",
    name: "Nombre",
    email: "Email",
    submit: "Reservar Plaza",
    submitting: "Enviando...",
    success: "Tu inscripcion ha sido recibida.",
    nameError: "Por favor, introduce tu nombre.",
    emailError: "Por favor, introduce un email valido."
  }
};

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function EventDetail() {
  const { slug } = useParams();
  const { currentLanguage } = useLanguage();
  const copy = labels[currentLanguage];
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
        const eventData = await getEventBySlug(slug, currentLanguage);
        setEvent(eventData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [slug, currentLanguage]);

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
      nextErrors.name = copy.nameError;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = copy.emailError;
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
      setSubmitMessage(copy.success);
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
        <span className="eyebrow">{copy.eyebrow}</span>

        {isLoading && <p className="status-message loading-message">{copy.loading}</p>}

        {error && <p className="status-message error-message">{error}</p>}

        {event && (
          <article className="detail-layout">
            <div className="detail-content">
              <h1>{event.title}</h1>
              <p className="page-copy detail-copy">{event.description}</p>
            </div>

            <aside className="card detail-sidebar">
              <div>
                <p className="detail-label">{copy.date}</p>
                <p>{formatDate(event.date, currentLanguage)}</p>
              </div>

              <div>
                <p className="detail-label">{copy.location}</p>
                <p>{event.location}</p>
              </div>

              <form className="form-card" onSubmit={handleSubmit} noValidate>
                <div>
                  <p className="detail-label">{copy.register}</p>
                  <p className="footer-copy">{copy.registerIntro}</p>
                </div>

                <label className="field">
                  <span>{copy.name}</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={copy.name}
                  />
                  {formErrors.name && (
                    <small className="field-error">{formErrors.name}</small>
                  )}
                </label>

                <label className="field">
                  <span>{copy.email}</span>
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
                  {isSubmitting ? copy.submitting : copy.submit}
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
