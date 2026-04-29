import { useEffect, useMemo, useState } from "react";

export default function QueueStatus() {
  const [queueInfo, setQueueInfo] = useState({
    entryId: null,
    serviceName: "",
    petName: "",
    position: 0,
    totalInQueue: 0,
    etaMinutes: 0,
    status: "WAITING",
    lastUpdated: new Date(),
  });

  const [notifications, setNotifications] = useState([]);

  async function loadQueueStatus(showNotification = false) {
    try {
      const entryId = localStorage.getItem("queueEntryId");

      if (!entryId) {
        resetQueueInfo();
        return;
      }

      const entryRes = await fetch(`http://localhost:3001/api/queue-status/${entryId}`);
      const entry = await entryRes.json();

      if (!entryRes.ok || !entry) {
        resetQueueInfo();
        return;
      }

      const queueRes = await fetch("http://localhost:3001/api/queue-management");
      const queueData = await queueRes.json();

      const index = Array.isArray(queueData)
        ? queueData.findIndex((e) => Number(e.id) === Number(entry.id))
        : -1;

      setQueueInfo({
        entryId: entry.id,
        serviceName: entry.serviceName || `Service ${entry.serviceId}`,
        petName: entry.petName,
        position: index >= 0 ? index + 1 : 0,
        totalInQueue: Array.isArray(queueData) ? queueData.length : 0,
        etaMinutes: entry.expectedDuration || 0,
        status: entry.status || "WAITING",
        lastUpdated: new Date(),
      });

      if (showNotification) {
        let message = "You’re in the queue. We’ll notify you when you’re almost ready.";
        let type = "info";

        if (entry.status === "SERVED") {
          message = "Ready for pickup! Please come to the front desk.";
          type = "success";
        } else if (entry.status === "SERVING" || index === 0) {
          message = "It’s your turn! Grooming started.";
          type = "success";
        } else if (index === 1) {
          message = "You’re next in line. Please be near the store.";
          type = "warning";
        }

        setNotifications((prev) => [
          { id: Date.now(), type, text: message, time: new Date() },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Failed to load queue status", error);
    }
  }

  function resetQueueInfo() {
    setQueueInfo({
      entryId: null,
      serviceName: "",
      petName: "",
      position: 0,
      totalInQueue: 0,
      etaMinutes: 0,
      status: "WAITING",
      lastUpdated: new Date(),
    });
  }

  useEffect(() => {
    loadQueueStatus();
  }, []);

  const statusLabel = useMemo(() => {
    if (!queueInfo.entryId) return "Waiting";
    if (queueInfo.status === "SERVED") return "Served";
    if (queueInfo.position === 1) return "Serving";
    if (queueInfo.position === 2) return "Almost Ready";
    return "Waiting";
  }, [queueInfo]);

  const statusStyle = useMemo(() => {
    switch (statusLabel) {
      case "Serving":
        return { borderColor: "#f59e0b", background: "#fffbeb", color: "#92400e" };
      case "Served":
        return { borderColor: "#10b981", background: "#ecfdf5", color: "#065f46" };
      case "Almost Ready":
        return { borderColor: "#f59e0b", background: "#fff7ed", color: "#9a3412" };
      default:
        return { borderColor: "#3b82f6", background: "#eff6ff", color: "#1e40af" };
    }
  }, [statusLabel]);

  const progress = useMemo(() => {
    if (queueInfo.totalInQueue <= 0) return 0;
    const p = (queueInfo.totalInQueue - queueInfo.position + 1) / queueInfo.totalInQueue;
    return Math.max(0, Math.min(1, p));
  }, [queueInfo.position, queueInfo.totalInQueue]);

  async function refreshStatus() {
    await loadQueueStatus(true);
  }

  async function leaveQueue() {
    if (!queueInfo.entryId) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/queue-management/${queueInfo.entryId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to leave queue:", data);
        return;
      }

      resetQueueInfo();

      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "info",
          text: "You left the queue.",
          time: new Date(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Failed to leave queue", error);
    }
  }

  const isInQueue = queueInfo.position > 0;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Queue Status</h1>
          <p style={styles.subtitle}>
            Track your pet’s place in line, current status, and wait time.
          </p>
        </div>

        <div style={{ ...styles.badge, ...statusStyle }}>{statusLabel}</div>
      </header>

      {!isInQueue ? (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Not currently in a queue</h2>
          <p style={styles.cardText}>
            Join a service queue to see your pet’s status here.
          </p>

          <button style={styles.primaryBtn} onClick={refreshStatus}>
            Refresh Status
          </button>
        </div>
      ) : (
        <>
          <div style={styles.summaryGrid}>
            <div style={styles.statCard}>
              <span style={styles.label}>Pet</span>
              <span style={styles.value}>{queueInfo.petName || "N/A"}</span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.label}>Service</span>
              <span style={styles.value}>{queueInfo.serviceName || "N/A"}</span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.label}>Position</span>
              <span style={styles.value}>
                #{queueInfo.position || 0} of {queueInfo.totalInQueue || 0}
              </span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.label}>Estimated Wait</span>
              <span style={styles.value}>{queueInfo.etaMinutes || 0} min</span>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Current Queue Details</h2>

              <div style={styles.row}>
                <span style={styles.label}>Current Status</span>
                <span style={styles.value}>{statusLabel}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>Entry ID</span>
                <span style={styles.value}>{queueInfo.entryId}</span>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={styles.progressWrap}>
                  <div style={{ ...styles.progressBar, width: `${progress * 100}%` }} />
                </div>

                <div style={styles.progressHint}>
                  Last updated: {queueInfo.lastUpdated.toLocaleTimeString()}
                </div>
              </div>

              <div style={styles.actions}>
                <button style={styles.primaryBtn} onClick={refreshStatus}>
                  Refresh Status
                </button>

                <button style={styles.ghostBtn} onClick={leaveQueue}>
                  Leave Queue
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Notifications</h2>
              <p style={styles.cardText}>Updates appear here when queue status changes.</p>

              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotif}>No notifications yet.</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} style={styles.notifItem}>
                      <span style={styles.notifDot(n.type)} />
                      <div>
                        <div style={styles.notifText}>{n.text}</div>
                        <div style={styles.notifTime}>{n.time.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                style={{ ...styles.ghostBtn, marginTop: 10 }}
                onClick={() => setNotifications([])}
              >
                Clear Notifications
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Status Meanings</h2>
            <ul style={styles.list}>
              <li><b>Waiting:</b> you’re in line.</li>
              <li><b>Almost Ready:</b> you’re next in line, please be nearby.</li>
              <li><b>Serving:</b> it’s your turn / grooming started.</li>
              <li><b>Served:</b> grooming is complete, time to pick up your pet.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    maxWidth: 1000,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1f1c2c, #2c3e50)",
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
    fontSize: 32,
    color: "white",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#d1d5db",
  },

  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid",
    fontWeight: 700,
    fontSize: 14,
    height: "fit-content",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    margin: 0,
    fontSize: 20,
  },

  cardText: {
    margin: "6px 0 12px",
    color: "#4b5563",
    fontSize: 14,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },

  label: {
    color: "#4b5563",
    fontSize: 14,
  },

  value: {
    fontWeight: 700,
    fontSize: 14,
    color: "#111827",
  },

  progressWrap: {
    width: "100%",
    height: 10,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#3b82f6",
  },

  progressHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  ghostBtn: {
    background: "transparent",
    color: "#111827",
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  notifList: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  notifItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 10,
    border: "1px solid #f3f4f6",
    borderRadius: 12,
    background: "#fafafa",
  },

  notifDot: (type) => ({
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
    background:
      type === "success"
        ? "#10b981"
        : type === "warning"
        ? "#f59e0b"
        : "#3b82f6",
  }),

  notifText: {
    fontSize: 14,
    color: "#111827",
  },

  notifTime: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  emptyNotif: {
    color: "#6b7280",
    fontSize: 14,
  },

  list: {
    margin: "10px 0 0",
    color: "#374151",
  },
};