import { useEffect, useState } from "react";
import {
  getAdminContent,
  updateAdminContent
} from "../../services/contentService";

function AdminContent() {
  const [sections, setSections] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadContent() {
    try {
      setIsLoading(true);
      const data = await getAdminContent();
      setSections(data);
      if (!selectedKey && data.length > 0) {
        setSelectedKey(data[0].sectionKey);
        setFormData(data[0]);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  function selectSection(section) {
    setSelectedKey(section.sectionKey);
    setFormData(section);
    setStatusMessage("");
    setErrorMessage("");
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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData) {
      return;
    }

    try {
      setIsSaving(true);
      setStatusMessage("");
      setErrorMessage("");
      const updatedSection = await updateAdminContent(selectedKey, formData);

      setSections((current) =>
        current.map((section) =>
          section.sectionKey === selectedKey ? updatedSection : section
        )
      );
      setFormData(updatedSection);
      setStatusMessage("Content updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Admin Content</span>
        <div className="admin-layout">
          <div className="card admin-panel">
            <div className="admin-panel-header">
              <h2>Sections</h2>
            </div>

            {isLoading ? (
              <p className="status-message loading-message">Loading content...</p>
            ) : (
              <div className="admin-list">
                {sections.map((section) => (
                  <button
                    key={section.sectionKey}
                    className={
                      section.sectionKey === selectedKey
                        ? "admin-list-item admin-list-item-active"
                        : "admin-list-item"
                    }
                    type="button"
                    onClick={() => selectSection(section)}
                  >
                    <strong>{section.sectionKey}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="card admin-panel form-card" onSubmit={handleSubmit}>
            <div className="admin-panel-header">
              <h2>{selectedKey || "Select a section"}</h2>
            </div>

            {formData && (
              <div className="admin-language-grid">
                {["en", "es"].map((languageCode) => (
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
                      <span>Subtitle</span>
                      <textarea
                        rows="3"
                        value={formData.translations[languageCode].subtitle}
                        onChange={(event) =>
                          handleTranslationChange(
                            languageCode,
                            "subtitle",
                            event.target.value
                          )
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Body</span>
                      <textarea
                        rows="7"
                        value={formData.translations[languageCode].body}
                        onChange={(event) =>
                          handleTranslationChange(
                            languageCode,
                            "body",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-actions">
              <button className="btn btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Content"}
              </button>
            </div>

            {statusMessage && <p className="status-message">{statusMessage}</p>}
            {errorMessage && <p className="status-message error-message">{errorMessage}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

export default AdminContent;
