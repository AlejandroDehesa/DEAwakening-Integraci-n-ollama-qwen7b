import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionContent, getSectionExtra } from "../services/contentService";
import { sendContactMessage } from "../services/contactService";

const DRAFT_KEY = "deawakening-contact-draft-v1";
const SUBMIT_COOLDOWN_SECONDS = 12;
const MESSAGE_MIN_LENGTH = 20;
const MESSAGE_MAX_LENGTH = 1200;

const emptyForm = {
  name: "",
  email: "",
  message: "",
  website: ""
};

const fallbackMain = {
  title: "",
  subtitle: "",
  body: ""
};

const fallbackUi = {
  pageTitle: "Contact",
  supportTitle: "",
  supportItems: [],
  expectedReply: "",
  name: "",
  email: "",
  message: "",
  placeholderName: "",
  placeholderMessage: "",
  submit: "",
  sending: "",
  clear: "",
  draftSaved: "",
  success: "",
  nameError: "",
  emailError: "",
  messageShortError: "",
  messageLongError: "",
  genericError: "",
  charCount: "",
  canSendIn: "",
  secondsShort: "",
  completionLabel: ""
};

function validateField(name, value, copy) {
  if (name === "name") {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      return copy.nameError;
    }
  }

  if (name === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value.trim())) {
      return copy.emailError;
    }
  }

  if (name === "message") {
    const length = value.trim().length;

    if (length < MESSAGE_MIN_LENGTH) {
      return copy.messageShortError;
    }

    if (length > MESSAGE_MAX_LENGTH) {
      return copy.messageLongError;
    }
  }

  return "";
}

function mapServerError(message, copy) {
  if (!message) {
    return copy.genericError;
  }

  if (message.includes("Name must be at least 2")) {
    return copy.nameError;
  }

  if (message.includes("valid email")) {
    return copy.emailError;
  }

  if (message.includes("at least 10")) {
    return copy.messageShortError;
  }

  if (message.includes("too long")) {
    return copy.messageLongError;
  }

  return message;
}

function Contact() {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState(fallbackMain);
  const [copy, setCopy] = useState(fallbackUi);
  const [formData, setFormData] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  usePageTitle(copy.pageTitle || "Contact");

  const messageLength = formData.message.trim().length;

  const completion = useMemo(() => {
    const checks = [
      !validateField("name", formData.name, copy),
      !validateField("email", formData.email, copy),
      !validateField("message", formData.message, copy)
    ];

    const okCount = checks.filter(Boolean).length;
    return Math.round((okCount / checks.length) * 100);
  }, [copy, formData.email, formData.message, formData.name]);

  useEffect(() => {
    let ignore = false;

    async function loadContent() {
      try {
        const [mainData, uiData] = await Promise.all([
          getSectionContent("contact.main", currentLanguage),
          getSectionExtra("contact.ui", currentLanguage, fallbackUi)
        ]);

        if (!ignore) {
          setContent(mainData);
          setCopy({
            ...fallbackUi,
            ...uiData
          });
        }
      } catch {
        if (!ignore) {
          setContent(fallbackMain);
          setCopy(fallbackUi);
        }
      }
    }

    loadContent();

    return () => {
      ignore = true;
    };
  }, [currentLanguage]);

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_KEY);

      if (!rawDraft) {
        return;
      }

      const parsed = JSON.parse(rawDraft);

      setFormData((current) => ({
        ...current,
        name: parsed?.name || "",
        email: parsed?.email || "",
        message: parsed?.message || ""
      }));
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const draft = {
      name: formData.name,
      email: formData.email,
      message: formData.message
    };

    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [formData.email, formData.message, formData.name]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  function setField(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validateField(name, value, copy)
      }));
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setField(name, value);
  }

  function handleBlur(event) {
    const { name, value } = event.target;

    setTouched((current) => ({
      ...current,
      [name]: true
    }));

    setErrors((current) => ({
      ...current,
      [name]: validateField(name, value, copy)
    }));
  }

  function validateForm() {
    const nextErrors = {
      name: validateField("name", formData.name, copy),
      email: validateField("email", formData.email, copy),
      message: validateField("message", formData.message, copy)
    };

    return nextErrors;
  }

  function handleReset() {
    setFormData(emptyForm);
    setTouched({});
    setErrors({});
    setServerMessage("");
    setSubmissionState("idle");
    window.localStorage.removeItem(DRAFT_KEY);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || cooldownSeconds > 0) {
      return;
    }

    const nextErrors = validateForm();

    setTouched({
      name: true,
      email: true,
      message: true
    });
    setErrors(nextErrors);
    setServerMessage("");
    setSubmissionState("idle");

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (formData.website.trim()) {
      setServerMessage(copy.success);
      setSubmissionState("success");
      setCooldownSeconds(SUBMIT_COOLDOWN_SECONDS);
      setFormData(emptyForm);
      return;
    }

    try {
      setIsSubmitting(true);
      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      });
      setServerMessage(copy.success);
      setSubmissionState("success");
      setCooldownSeconds(SUBMIT_COOLDOWN_SECONDS);
      setFormData(emptyForm);
      setTouched({});
      setErrors({});
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      setServerMessage(mapServerError(error.message, copy));
      setSubmissionState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section contact-advanced-section">
      <div className="container contact-advanced-stack">
        <header className="card contact-hero-card">
          <h1>{content.title}</h1>
          <p className="page-copy">{content.subtitle}</p>
        </header>

        <div className="contact-advanced-layout">
          <aside className="card contact-intro-card">
            <h2>{copy.supportTitle}</h2>
            <p className="contact-support-copy">{content.body}</p>

            <ul className="contact-support-list">
              {copy.supportItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="contact-reply-time">{copy.expectedReply}</p>
          </aside>

          <form className="card contact-form-card" onSubmit={handleSubmit} noValidate>
            <div className="contact-form-progress-wrap">
              <div className="contact-form-progress-head">
                <span>{copy.completionLabel}</span>
                <strong>{completion}%</strong>
              </div>
              <div className="contact-form-progress-bar" aria-hidden="true">
                <span style={{ width: `${completion}%` }} />
              </div>
            </div>

            <label className="field">
              <span>{copy.name}</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={copy.placeholderName}
                maxLength={80}
                autoComplete="name"
              />
              {touched.name && errors.name ? (
                <small className="field-error">{errors.name}</small>
              ) : null}
            </label>

            <label className="field">
              <span>{copy.email}</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                maxLength={160}
                autoComplete="email"
              />
              {touched.email && errors.email ? (
                <small className="field-error">{errors.email}</small>
              ) : null}
            </label>

            <label className="field field-honeypot" aria-hidden="true">
              <span>Website</span>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>

            <label className="field">
              <div className="field-row">
                <span>{copy.message}</span>
                <small
                  className={
                    messageLength > MESSAGE_MAX_LENGTH
                      ? "field-counter field-counter-error"
                      : "field-counter"
                  }
                >
                  {messageLength} / {MESSAGE_MAX_LENGTH} {copy.charCount}
                </small>
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={copy.placeholderMessage}
                rows="8"
              />
              {touched.message && errors.message ? (
                <small className="field-error">{errors.message}</small>
              ) : null}
            </label>

            <div className="contact-form-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting || cooldownSeconds > 0}
              >
                {isSubmitting ? copy.sending : copy.submit}
              </button>

              <button
                className="btn btn-outline"
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                {copy.clear}
              </button>
            </div>

            <div className="contact-form-meta">
              <small>{copy.draftSaved}</small>
              {cooldownSeconds > 0 ? (
                <small>
                  {copy.canSendIn} {cooldownSeconds}
                  {copy.secondsShort}
                </small>
              ) : null}
            </div>

            {serverMessage ? (
              <p
                className={
                  submissionState === "error"
                    ? "status-message error-message"
                    : "status-message"
                }
              >
                {serverMessage}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
