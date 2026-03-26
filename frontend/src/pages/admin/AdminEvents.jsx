import { useEffect, useState } from "react";
import {
  createAdminEvent,
  deleteAdminEvent,
  getAdminEvents,
  updateAdminEvent
} from "../../services/eventsService";
import { usePageTitle } from "../../hooks/usePageTitle";

const initialForm = {
  slug: "",
  date: "",
  translations: {
    en: {
      title: "",
      location: "",
      description: ""
    },
    es: {
      title: "",
      location: "",
      description: ""
    },
    de: {
      title: "",
      location: "",
      description: ""
    }
  }
};

const LANGUAGES = ["en", "es", "de"];

function AdminEvents() {
  usePageTitle("Admin Events");

  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadEvents() {
    try {
      setIsLoading(true);
      const data = await getAdminEvents();
      setEvents(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function resetForm() {
    setEditingId(null);
    setFormData(initialForm);
  }

  function handleBaseChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleTranslationChange(languageCode, field, value) {
    setFormData((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [languageCode]: {
          ...current.translations[languageCode],
          [field]: value
        }
      }
    }));
  }

  function handleEdit(eventItem) {
    setEditingId(eventItem.id);
    setStatusMessage("");
    setErrorMessage("");
    setFormData(eventItem);
  }

  async function handleDelete(eventId) {
    const confirmed = window.confirm("Delete this event?");

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      setStatusMessage("");
      await deleteAdminEvent(eventId);
      if (editingId === eventId) {
        resetForm();
      }
      await loadEvents();
      setStatusMessage("Event deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setStatusMessage("");

      if (editingId) {
        await updateAdminEvent(editingId, formData);
        setStatusMessage("Event updated successfully.");
      } else {
        await createAdminEvent(formData);
        setStatusMessage("Event created successfully.");
      }

      resetForm();
      await loadEvents();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Admin Events</span>
        <div className="section-heading">
          <h1>Events workspace</h1>
          <p className="page-copy">
            Keep the public events list accurate, translated and easy to manage.
          </p>
        </div>
        <div className="admin-layout">
          <div className="card admin-panel">
            <div className="admin-panel-header">
              <h2>Existing Events</h2>
              <button className="btn btn-outline" type="button" onClick={resetForm}>
                New Event
              </button>
            </div>

            {isLoading ? (
              <p className="status-message loading-message">Loading events...</p>
            ) : errorMessage ? (
              <p className="status-message error-message">{errorMessage}</p>
            ) : (
              <div className="admin-list">
                {events.map((eventItem) => (
                  <article key={eventItem.id} className="admin-list-item">
                    <div>
                      <strong>{eventItem.translations.en.title}</strong>
                      <p>{eventItem.slug}</p>
                      <p>{eventItem.date}</p>
                    </div>
                    <div className="admin-actions">
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => handleEdit(eventItem)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => handleDelete(eventItem.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form className="card admin-panel form-card" onSubmit={handleSubmit}>
            <div className="admin-panel-header">
              <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
              <p className="admin-form-note">
                {editingId
                  ? "Update the selected event and save when ready."
                  : "Create a new event with all language versions."}
              </p>
            </div>

            <div className="admin-form-grid">
              <label className="field">
                <span>Slug</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleBaseChange}
                  placeholder="event-slug"
                />
              </label>

              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleBaseChange}
                />
              </label>
            </div>

            <div className="admin-language-grid">
              {LANGUAGES.map((languageCode) => (
                <div key={languageCode} className="admin-language-card">
                  <p className="detail-label">{languageCode.toUpperCase()}</p>
                  <label className="field">
                    <span>Title</span>
                    <input
                      type="text"
                      value={formData.translations[languageCode].title}
                      onChange={(event) =>
                        handleTranslationChange(
                          languageCode,
                          "title",
                          event.target.value
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Location</span>
                    <input
                      type="text"
                      value={formData.translations[languageCode].location}
                      onChange={(event) =>
                        handleTranslationChange(
                          languageCode,
                          "location",
                          event.target.value
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea
                      rows="5"
                      value={formData.translations[languageCode].description}
                      onChange={(event) =>
                        handleTranslationChange(
                          languageCode,
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="admin-actions">
              <button className="btn btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingId ? "Update Event" : "Create Event"}
              </button>
              {editingId && (
                <button className="btn btn-outline" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            {statusMessage && <p className="status-message">{statusMessage}</p>}
            {!isLoading && errorMessage && (
              <p className="status-message error-message">{errorMessage}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default AdminEvents;
