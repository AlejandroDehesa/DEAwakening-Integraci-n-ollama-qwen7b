import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { getSectionContent } from "../services/contentService";
import { sendContactMessage } from "../services/contactService";

const initialForm = {
  name: "",
  email: "",
  message: ""
};

const fallbackContent = {
  en: {
    title: "Get in touch",
    subtitle:
      "Use this space for event enquiries, collaboration ideas or general questions about DEAwakening.",
    body:
      "We read every message with care and aim to respond with clarity, warmth and professionalism."
  },
  es: {
    title: "Ponte en contacto",
    subtitle:
      "Usa este espacio para preguntas sobre eventos, ideas de colaboracion o consultas generales sobre DEAwakening.",
    body:
      "Leemos cada mensaje con atencion y buscamos responder con claridad, calidez y profesionalidad."
  }
};

const labels = {
  en: {
    pageTitle: "Contact",
    eyebrow: "Contact",
    name: "Name",
    email: "Email",
    message: "Message",
    placeholderName: "Your name",
    placeholderMessage: "Tell us how we can help.",
    submit: "Send Message",
    sending: "Sending...",
    success: "Thank you. Your message is on its way and we will reply as soon as we can.",
    nameError: "Please tell us your name so we know how to address you.",
    emailError: "Please add a valid email so we can reply to you.",
    messageError: "Please share a little more detail so we can help properly."
  },
  es: {
    pageTitle: "Contacto",
    eyebrow: "Contacto",
    name: "Nombre",
    email: "Correo",
    message: "Mensaje",
    placeholderName: "Tu nombre",
    placeholderMessage: "Cuentanos como podemos ayudarte.",
    submit: "Enviar Mensaje",
    sending: "Enviando...",
    success: "Gracias. Tu mensaje ya esta en camino y responderemos lo antes posible.",
    nameError: "Por favor, dinos tu nombre para saber como dirigirnos a ti.",
    emailError: "Por favor, escribe un email valido para poder responderte.",
    messageError: "Comparte un poco mas de detalle para poder ayudarte bien."
  }
};

function Contact() {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState(fallbackContent.en);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");
  const copy = labels[currentLanguage];
  usePageTitle(copy.pageTitle);

  useEffect(() => {
    const nextFallback = fallbackContent[currentLanguage];
    setContent(nextFallback);

    async function loadContent() {
      try {
        const data = await getSectionContent("contact.main", currentLanguage);
        setContent(data);
      } catch {
        setContent(nextFallback);
      }
    }

    loadContent();
  }, [currentLanguage]);

  function handleChange(event) {
    const { name, value } = event.target;

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

    if (formData.message.trim().length < 10) {
      nextErrors.message = copy.messageError;
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();

    setErrors(nextErrors);
    setServerMessage("");
    setSubmissionState("idle");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await sendContactMessage(formData);
      setServerMessage(copy.success);
      setSubmissionState("success");
      setFormData(initialForm);
    } catch (error) {
      setServerMessage(error.message);
      setSubmissionState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">{copy.eyebrow}</span>
        <div className="contact-layout">
          <div>
            <h1>{content.title}</h1>
            <p className="page-copy">{content.subtitle}</p>
            <p className="page-copy contact-support-copy">{content.body}</p>
          </div>

          <form className="card form-card" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>{copy.name}</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={copy.placeholderName}
              />
              {errors.name && <small className="field-error">{errors.name}</small>}
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
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            <label className="field">
              <span>{copy.message}</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={copy.placeholderMessage}
                rows="6"
              />
              {errors.message && (
                <small className="field-error">{errors.message}</small>
              )}
            </label>

            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? copy.sending : copy.submit}
            </button>

            {serverMessage && (
              <p
                className={
                  submissionState === "error"
                    ? "status-message error-message"
                    : "status-message"
                }
              >
                {serverMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
