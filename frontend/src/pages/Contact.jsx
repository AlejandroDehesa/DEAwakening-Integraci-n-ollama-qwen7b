import { useState } from "react";
import { sendContactMessage } from "../services/contactService";

const initialForm = {
  name: "",
  email: "",
  message: ""
};

function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");

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
      nextErrors.name = "Please enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email.";
    }

    if (formData.message.trim().length < 10) {
      nextErrors.message = "Please write a message of at least 10 characters.";
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
      setServerMessage("Your message has been sent successfully.");
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
        <span className="eyebrow">Contact</span>
        <div className="contact-layout">
          <div>
            <h1>Get in touch</h1>
            <p className="page-copy">
              Use this form for event enquiries, collaboration opportunities or
              general questions about DEAwakening.
            </p>
          </div>

          <form className="card form-card" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
              {errors.name && <small className="field-error">{errors.name}</small>}
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
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help."
                rows="6"
              />
              {errors.message && (
                <small className="field-error">{errors.message}</small>
              )}
            </label>

            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
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
