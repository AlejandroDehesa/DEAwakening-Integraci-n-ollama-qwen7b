import { useMemo, useState } from "react";
import { clearAdminKey, getEffectiveAdminKey, saveAdminKey } from "../../services/api";

function AdminKeyAccess({ children }) {
  const initialKey = useMemo(() => getEffectiveAdminKey(), []);
  const [keyValue, setKeyValue] = useState(initialKey);
  const [isUnlocked, setIsUnlocked] = useState(Boolean(initialKey));

  function handleSubmit(event) {
    event.preventDefault();

    const normalized = keyValue.trim();
    if (!normalized) {
      return;
    }

    saveAdminKey(normalized);
    setIsUnlocked(true);
  }

  function handleReset() {
    clearAdminKey();
    setKeyValue("");
    setIsUnlocked(false);
  }

  if (!isUnlocked) {
    return (
      <section className="section">
        <div className="container">
          <div className="card admin-card">
            <div className="section-heading">
              <h1>Admin Access</h1>
              <p className="page-copy">
                Enter your admin key to open the protected admin workspace.
              </p>
            </div>
            <form className="admin-form-grid" onSubmit={handleSubmit}>
              <label className="field">
                <span>Admin Key</span>
                <input
                  autoComplete="off"
                  placeholder="Paste admin key"
                  type="password"
                  value={keyValue}
                  onChange={(event) => setKeyValue(event.target.value)}
                />
              </label>
              <button className="btn btn-primary" type="submit">
                Unlock Admin
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="card admin-card" style={{ padding: "1rem 1.2rem" }}>
            <div className="admin-actions" style={{ justifyContent: "space-between" }}>
              <p className="page-copy" style={{ margin: 0 }}>
                Admin session active.
              </p>
              <button className="btn btn-outline" type="button" onClick={handleReset}>
                Change Admin Key
              </button>
            </div>
          </div>
        </div>
      </section>
      {children}
    </>
  );
}

export default AdminKeyAccess;
