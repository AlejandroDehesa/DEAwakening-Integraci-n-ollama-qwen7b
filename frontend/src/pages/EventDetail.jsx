import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionExtra } from "../services/contentService";
import { getEventBySlug, registerForEvent } from "../services/eventsService";

const initialForm = {
  name: "",
  email: ""
};

const fallbackLabels = {
  eyebrow: "",
  loading: "",
  date: "",
  location: "",
  register: "",
  registerIntro: "",
  name: "",
  email: "",
  submit: "",
  submitting: "",
  success: "",
  nameError: "",
  emailError: "",
  status: "",
  aboutTitle: "",
  overviewHeading: "",
  participationHeading: "",
  participationCopy: ""
};

function formatDate(date, language) {
  const locale =
    language === "es" ? "es-ES" : language === "de" ? "de-DE" : "en-GB";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function getMapEmbedUrl(location) {
  const query = encodeURIComponent(location || "Spain");
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function EventDetail() {
  const { slug } = useParams();
  const { currentLanguage } = useLanguage();
  const [copy, setCopy] = useState(fallbackLabels);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitState, setSubmitState] = useState("idle");

  usePageTitle(event?.title || copy.eyebrow || "Event");

  useEffect(() => {
    let ignore = false;

    async function loadLabels() {
      try {
        const data = await getSectionExtra(
          "event.detail.ui",
          currentLanguage,
          fallbackLabels
        );
        if (!ignore) {
          setCopy({
            ...fallbackLabels,
            ...data
          });
        }
      } catch {
        if (!ignore) {
          setCopy(fallbackLabels);
        }
      }
    }

    loadLabels();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  useEffect(() => {
    let ignore = false;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setError("");
        setEvent(null);
        const eventData = await getEventBySlug(slug, currentLanguage);
        if (!ignore) {
          setEvent(eventData);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      ignore = true;
    };
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
        {isLoading && <p className="status-message loading-message">{copy.loading}</p>}
        {error && <p className="status-message error-message">{error}</p>}

        {event && (
          <article className="detail-layout">
            <div className="detail-content">
              <div className="detail-special-stack">
                <header className="special-detail-header">
                  <h1 className="special-detail-title">{event.title}</h1>
                  <p className="special-detail-subtitle">{event.location}</p>
                </header>

                <p className="page-copy detail-copy special-detail-intro">{event.description}</p>

                <div className="special-detail-image-wrap">
                  <img
                    className="special-detail-image"
                    src="/resofusion-findhorn.jpg"
                    alt={event.title}
                    loading="lazy"
                  />
                </div>

                <section className="card detail-extra-card">
                  <p className="detail-label">{copy.aboutTitle}</p>
                  <div className="detail-about-copy">
                    <h3 className="detail-about-heading">{copy.overviewHeading}</h3>
                    <p>{event.description}</p>
                    <h3 className="detail-about-heading">{copy.participationHeading}</h3>
                    <p>{copy.participationCopy}</p>
                  </div>
                </section>

                <section className="card detail-extra-card detail-map-card">
                  <p className="detail-label">{copy.location}</p>
                  <div className="detail-map-wrap">
                    <iframe
                      className="detail-map-frame"
                      src={getMapEmbedUrl(event.location)}
                      title={`Map ${event.location}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </section>
              </div>
            </div>

            <aside className="card detail-sidebar">
              <div className="detail-sidebar-meta">
                <p className="detail-label">{copy.date}</p>
                <p>{formatDate(event.date, currentLanguage)}</p>
              </div>

              <div className="detail-sidebar-meta">
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
                  {formErrors.name && <small className="field-error">{formErrors.name}</small>}
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

                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
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
