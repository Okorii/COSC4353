import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../lib/api.js";

function normalizeService(service) {
  const rawName = service.service_name ?? service.serviceName ?? service.name ?? "Unknown Service";
  const cleanedName = rawName.replace(/\s+\d{6,}$/, "");
  return {
    serviceId: service.service_id ?? service.serviceId ?? service.id,
    serviceName: cleanedName,
    expectedDuration:
      Number(service.expected_duration ?? service.expectedDuration ?? service.durationMinutes) || 0,
    active: service.active,
  };
}

function normalizeQueueEntry(entry) {
  return {
    id: entry.id ?? entry.entry_id,
    petName: entry.petName ?? entry.pet_name ?? "",
    ownerName: entry.ownerName ?? entry.owner_name ?? "",
    serviceId: entry.serviceId ?? entry.service_id ?? null,
    status: entry.status ?? "",
  };
}

export default function JoinQueue({ goToStatus }) {
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [petName, setPetName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [message, setMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    async function loadPageData() {
      setLoadingMessage("");

      try {
        const [servicesResponse, queueResponse] = await Promise.all([
          fetch(apiUrl("/api/services")),
          fetch(apiUrl("/api/queue-management")),
        ]);

        const servicesData = await servicesResponse.json();
        const queueData = await queueResponse.json();

        const normalizedServices = Array.isArray(servicesData)
          ? servicesData
            .map(normalizeService)
            .filter(
              (service) =>
                service.active == 1 &&
                service.serviceName !== "Updated Haircut" &&
                service.serviceName !== "Temp Service"
            )
            .filter(
              (service, index, self) =>
                index === self.findIndex((s) => s.serviceName === service.serviceName)
            )
          : [];

        const normalizedQueue = Array.isArray(queueData)
          ? queueData.map(normalizeQueueEntry)
          : [];

        setServices(normalizedServices);
        setQueue(normalizedQueue);

        if (normalizedServices.length > 0) {
          setServiceId(String(normalizedServices[0].serviceId));
        } else {
          setServiceId("");
        }

        if (!servicesResponse.ok || !queueResponse.ok) {
          setLoadingMessage("Some queue data could not be loaded.");
        }
      } catch (error) {
        console.error("Error loading Join Queue page:", error);
        setServices([]);
        setQueue([]);
        setLoadingMessage("Could not load queue data from the backend.");
      }
    }

    loadPageData();
  }, []);

  const uniqueServices = services.filter(
    (service, index, self) =>
    index === self.findIndex(
      (s) => s.serviceName === service.serviceName
    )
  );

  const selected = useMemo(
    () => services.find((service) => String(service.serviceId) === String(serviceId)),
    [services, serviceId],
  );

  const queueForService = useMemo(
    () => queue.filter((entry) => String(entry.serviceId) === String(serviceId)),
    [queue, serviceId],
  );

  const estWaitMinutes = selected ? queueForService.length * selected.expectedDuration : 0;

  function validate() {
    if (!ownerName.trim()) return "Email is required.";
    if (ownerName.trim().length > 100) return "Email must be 100 characters or less.";
    if (!ownerName.includes("@")) return "Enter a valid email address.";
    if (!petName.trim()) return "Pet name is required.";
    if (petName.trim().length > 30) return "Pet name must be 30 characters or less.";
    if (!serviceId) return "Please select a service.";
    return "";
  }

  async function reloadQueue() {
    try {
      const response = await fetch(apiUrl("/api/queue-management"));
      const data = await response.json();
      setQueue(Array.isArray(data) ? data.map(normalizeQueueEntry) : []);
    } catch (error) {
      console.error("Error reloading queue:", error);
    }
  }

  async function joining() {
    setMessage("");
    const validationError = validate();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/queue-management/join"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petName: petName.trim(),
          ownerName: ownerName.trim(),
          serviceId: Number(serviceId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to join queue.");
        return;
      }
      localStorage.setItem("queueEntryId", data.id || data.entry_id);
      localStorage.setItem("ownerName", ownerName.trim());

      setMessage(
        `Joined ${selected?.serviceName || "the queue"}. Estimated wait: ${estWaitMinutes} minutes.`,
      );
      await reloadQueue();
    } catch (error) {
      console.error("Error joining queue:", error);
      setMessage("Failed to join queue.");
    }
  }

  async function leaving() {
    setMessage("");

    if (!ownerName.trim()) {
      setMessage("Enter your email first.");
      return;
    }

    if (!petName.trim()) {
      setMessage("Enter your pet name first.");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/queue-management/leave"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petName: petName.trim(),
          ownerName: ownerName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to leave queue.");
        return;
      }

      setMessage("Left the queue.");
      await reloadQueue();
    } catch (error) {
      console.error("Error leaving queue:", error);
      setMessage("Failed to leave queue.");
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Join Queue</h1>
          <p style={styles.subtitle}>
            Join or leave a service queue.
          </p>
        </div>
      </header>

      {/* join/leave form */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <label style={styles.label}>Email*</label>
          <input
            style={styles.input}
            type="email"
            value={ownerName}
            maxLength={100}
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="you@email.com"
          />

          <label style={styles.label}>Pet Name*</label>
          <input
            style={styles.input}
            type="text"
            value={petName}
            maxLength={30}
            onChange={(event) => setPetName(event.target.value)}
            placeholder="First name as it appears on file (ex: Luna)"
          />

          <label style={styles.label}>Service*</label>
          <select
            style={styles.input}
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            disabled={uniqueServices.length === 0}
          >
            {uniqueServices.length === 0 ? (
              <option value="">No services available</option>
            ) : (
              uniqueServices.map((service) => (
                <option key={service.serviceId} value={service.serviceId}>
                  {service.serviceName}
                </option>
              ))
            )}
          </select>

          <div style={styles.infoRow}>
            <span><b>Estimated wait:</b></span>
            <span>{estWaitMinutes} min</span>
          </div>

          {loadingMessage ? <div style={styles.messageBox}>{loadingMessage}</div> : null}
          {message ? <div style={styles.messageBox}>{message}</div> : null}

          <div style={styles.btnRow}>
            <button style={styles.joinBtn} onClick={joining}>
              Join Queue
            </button>

            <button style={styles.leaveBtn} onClick={leaving}>
              Leave Queue
            </button>
          </div>
        </div>
        
        {/* view current joined queue btns */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Already joined a queue?</h2>
          <p style={styles.cardText}>
            Track your pet's place in line and estimated wait time in the Queue Status page.
          </p>

          <button style={styles.statusBtn} onClick={goToStatus}>
            Go to Queue Status
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: 20,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#14532d",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#787b80",
  },

  grid: {
    display: "block",
    gap: 16,
    marginTop: 16,
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    textAlign: "left",
    marginBottom: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  },

  cardTitle: {
    margin: "0",
    fontSize: 20,
  },

  cardText: {
    marginTop: 10,
    color: "#606976",
    fontWeight: 450,
  },

  label: {
    display: "block",
    marginTop: 12,
    fontWeight: 650,
    fontSize: 13,
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "rgba(255,255,255,0.9)",
    marginTop: 6,
    boxSizing: "border-box",
    fontSize: 14,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(0,0,0,0.06)",
  },
  
  messageBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    background: "rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.08)",
  },

  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },

  joinBtn: {
    padding: "10px 12px",
    background: "#0e7c41",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  leaveBtn: {
    padding: "10px 12px",
    background: "#b73636",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  statusBtn: {
    padding: "10px 12px",
    background: "#33339c",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};
