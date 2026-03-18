import { useEffect, useMemo, useState } from "react";

/**
 * QueueSmart - Service Management Screen (Admin)
 * Connected to backend APIs
 */
export default function ServiceManagement() {
  const [services, setServices] = useState([]);

  const emptyForm = useMemo(
    () => ({
      id: null,
      name: "",
      description: "",
      durationMinutes: "",
      priority: "medium",
      active: true,
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("create"); // create | edit
  const [errors, setErrors] = useState({});
  const [flash, setFlash] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(
          data.map((service) => ({
            ...service,
            updatedAt: new Date(service.updatedAt),
          }))
        );
      })
      .catch(() => {
        setFlash("Failed to load services from backend.");
      });
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFlash("");
  }

  function validate(nextForm) {
    const e = {};
    const name = (nextForm.name || "").trim();
    const desc = (nextForm.description || "").trim();

    if (!name) e.name = "Service name is required.";
    if (name.length > 100) e.name = "Service name must be 100 characters or less.";

    if (!desc) e.description = "Description is required.";

    const durRaw = nextForm.durationMinutes;
    const durNum = Number(durRaw);
    if (durRaw === "" || durRaw === null || Number.isNaN(durNum)) {
      e.durationMinutes = "Expected duration (minutes) is required.";
    } else if (!Number.isFinite(durNum) || durNum <= 0) {
      e.durationMinutes = "Duration must be greater than 0 minutes.";
    } else if (!Number.isInteger(durNum)) {
      e.durationMinutes = "Duration must be a whole number (minutes).";
    } else if (durNum > 600) {
      e.durationMinutes = "Duration seems too large (max 600 minutes).";
    }

    if (!["low", "medium", "high"].includes(nextForm.priority)) {
      e.priority = "Priority must be low, medium, or high.";
    }

    return e;
  }

  function startCreate() {
    setMode("create");
    setForm(emptyForm);
    setErrors({});
    setFlash("");
  }

  function startEdit(service) {
    setMode("edit");
    setForm({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      priority: service.priority,
      active: service.active,
    });
    setErrors({});
    setFlash("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const isEdit = mode === "edit";
    const url = isEdit
      ? `http://localhost:3001/api/services/${form.id}`
      : "http://localhost:3001/api/services";

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        setFlash(data.message || "Unable to save service.");
        return;
      }

      const refreshRes = await fetch("http://localhost:3001/api/services");
      const refreshData = await refreshRes.json();

      setServices(
        refreshData.map((service) => ({
          ...service,
          updatedAt: new Date(service.updatedAt),
        }))
      );

      setFlash(
        isEdit ? "Service updated successfully." : "Service created successfully."
      );
      startCreate();
    } catch (error) {
      setFlash("Server error while saving service.");
    }
  }

  async function toggleActive(id) {
    try {
      const res = await fetch(
        `http://localhost:3001/api/services/${id}/toggle-active`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        setFlash("Failed to update service status.");
        return;
      }

      const refreshRes = await fetch("http://localhost:3001/api/services");
      const refreshData = await refreshRes.json();

      setServices(
        refreshData.map((service) => ({
          ...service,
          updatedAt: new Date(service.updatedAt),
        }))
      );

      setFlash("Service status updated.");
    } catch (error) {
      setFlash("Server error while updating status.");
    }
  }

  async function removeService(id) {
    try {
      const res = await fetch(`http://localhost:3001/api/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setFlash("Failed to remove service.");
        return;
      }

      setServices((prev) => prev.filter((service) => service.id !== id));
      setFlash("Service removed.");
      if (form.id === id) startCreate();
    } catch (error) {
      setFlash("Server error while removing service.");
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Service Management</h1>
          <p style={styles.subtitle}>
            Create and edit grooming services (admin). Connected to backend API.
          </p>
        </div>
        <button style={styles.ghostBtn} onClick={startCreate}>
          + New Service
        </button>
      </header>

      <div style={styles.card}>
        <div style={styles.cardTop}>
          <h2 style={styles.cardTitle}>
            {mode === "create" ? "Create Service" : "Edit Service"}
          </h2>
          {flash ? <span style={styles.flash}>{flash}</span> : null}
        </div>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Service Name *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : {}),
              }}
              type="text"
              value={form.name}
              maxLength={120}
              placeholder="e.g., Full Groom"
              onChange={(e) => setField("name", e.target.value)}
            />
            <div style={styles.helpRow}>
              <span style={styles.errorText}>{errors.name || ""}</span>
              <span style={styles.counter}>{(form.name || "").length}/100</span>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Expected Duration (minutes) *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.durationMinutes ? styles.inputError : {}),
              }}
              type="number"
              inputMode="numeric"
              min={1}
              max={600}
              value={form.durationMinutes}
              placeholder="e.g., 45"
              onChange={(e) => setField("durationMinutes", e.target.value)}
            />
            <div style={styles.errorText}>{errors.durationMinutes || ""}</div>
          </div>

          <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
            <label style={styles.label}>Description *</label>
            <textarea
              style={{
                ...styles.textarea,
                ...(errors.description ? styles.inputError : {}),
              }}
              rows={3}
              value={form.description}
              placeholder="Describe what’s included in this service..."
              onChange={(e) => setField("description", e.target.value)}
            />
            <div style={styles.errorText}>{errors.description || ""}</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Priority Level</label>
            <select
              style={{ ...styles.input, ...(errors.priority ? styles.inputError : {}) }}
              value={form.priority}
              onChange={(e) => setField("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div style={styles.errorText}>{errors.priority || ""}</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Active</label>
            <div style={styles.toggleRow}>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  background: form.active ? "#111827" : "transparent",
                  color: form.active ? "white" : "#111827",
                }}
                onClick={() => setField("active", true)}
              >
                Active
              </button>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  background: !form.active ? "#111827" : "transparent",
                  color: !form.active ? "white" : "#111827",
                }}
                onClick={() => setField("active", false)}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={handleSave}>
            {mode === "create" ? "Create Service" : "Save Changes"}
          </button>
          {mode === "edit" ? (
            <button style={styles.ghostBtn} onClick={startCreate}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Services</h2>
        <p style={styles.cardText}>
          This list is now loaded from the backend API.
        </p>

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {services.length === 0 ? (
            <div style={styles.empty}>No services yet. Create one above.</div>
          ) : (
            services.map((s) => (
              <div key={s.id} style={styles.serviceRow}>
                <div style={{ flex: 1 }}>
                  <div style={styles.serviceTop}>
                    <div style={styles.serviceName}>
                      {s.name} <span style={styles.pill(s.priority)}>{s.priority}</span>
                      {!s.active ? <span style={styles.inactiveTag}>Inactive</span> : null}
                    </div>
                    <div style={styles.serviceMeta}>
                      {s.durationMinutes} min • Updated{" "}
                      {s.updatedAt instanceof Date
                        ? s.updatedAt.toLocaleTimeString()
                        : new Date(s.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={styles.serviceDesc}>{s.description}</div>
                </div>

                <div style={styles.serviceActions}>
                  <button style={styles.smallBtn} onClick={() => startEdit(s)}>
                    Edit
                  </button>
                  <button style={styles.smallGhostBtn} onClick={() => toggleActive(s.id)}>
                    {s.active ? "Deactivate" : "Activate"}
                  </button>
                  <button style={styles.smallDangerBtn} onClick={() => removeService(s.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    maxWidth: 980,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 28 },
  subtitle: { margin: "6px 0 0", color: "#4b5563" },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    marginBottom: 16,
  },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { margin: 0, fontSize: 18 },
  cardText: { margin: "6px 0 0", color: "#4b5563", fontSize: 14 },

  flash: {
    fontSize: 13,
    fontWeight: 650,
    color: "#065f46",
    background: "#ecfdf5",
    border: "1px solid #10b981",
    padding: "6px 10px",
    borderRadius: 999,
  },

  formGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#374151", fontWeight: 650 },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  textarea: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    resize: "vertical",
  },
  inputError: { borderColor: "#ef4444", background: "#fff5f5" },
  errorText: { minHeight: 16, fontSize: 12, color: "#b91c1c" },
  helpRow: { display: "flex", justifyContent: "space-between", gap: 10 },
  counter: { fontSize: 12, color: "#6b7280" },

  toggleRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  toggleBtn: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 650,
  },

  actions: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  primaryBtn: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 650,
  },
  ghostBtn: {
    background: "transparent",
    color: "#111827",
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 650,
  },

  empty: { color: "#6b7280", fontSize: 14, padding: 10 },

  serviceRow: {
    border: "1px solid #f3f4f6",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  serviceTop: { display: "flex", flexDirection: "column", gap: 2 },
  serviceName: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  serviceMeta: { fontSize: 12, color: "#6b7280" },
  serviceDesc: { marginTop: 6, fontSize: 13, color: "#374151" },

  pill: (p) => ({
    fontSize: 11,
    fontWeight: 800,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: p === "high" ? "#fff1f2" : p === "low" ? "#eff6ff" : "#fefce8",
    color: p === "high" ? "#9f1239" : p === "low" ? "#1e40af" : "#854d0e",
  }),
  inactiveTag: {
    fontSize: 11,
    fontWeight: 800,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    color: "#374151",
  },

  serviceActions: { display: "flex", flexDirection: "column", gap: 8, minWidth: 120 },
  smallBtn: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
  smallGhostBtn: {
    background: "transparent",
    color: "#111827",
    border: "1px solid #e5e7eb",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
  smallDangerBtn: {
    background: "#fff1f2",
    color: "#9f1239",
    border: "1px solid #fecdd3",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },
};