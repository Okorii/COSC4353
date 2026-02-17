import { useMemo, useState } from "react";

/**
 * QueueSmart - Queue Status Screen (User)
 * UI-only: mock data + simulated updates (no backend required)
 */
export default function QueueStatus() {
  // Mock "session" state (pretend this was created after Join Queue)
  const [queueInfo, setQueueInfo] = useState({
    serviceName: "Full Groom (Bath + Haircut + Nails)",
    petName: "Luna",
    position: 3,
    totalInQueue: 12,
    etaMinutes: 18,
    status: "WAITING", // WAITING | ALMOST_READY | SERVED | READY_FOR_PICKUP
    lastUpdated: new Date(),
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      text: "You’re in the queue. We’ll notify you when you’re almost ready.",
      time: new Date(),
    },
  ]);

  const statusLabel = useMemo(() => {
    switch (queueInfo.status) {
      case "ALMOST_READY":
        return "Almost Ready";
      case "SERVED":
        return "Served";
      case "READY_FOR_PICKUP":
        return "Ready for Pickup";
      default:
        return "Waiting";
    }
  }, [queueInfo.status]);

  const statusStyle = useMemo(() => {
    switch (queueInfo.status) {
      case "ALMOST_READY":
        return {
          borderColor: "#f59e0b",
          background: "#fffbeb",
          color: "#92400e",
        };
      case "SERVED":
        return {
          borderColor: "#10b981",
          background: "#ecfdf5",
          color: "#065f46",
        };
      case "READY_FOR_PICKUP":
        return {
          borderColor: "#22c55e",
          background: "#f0fdf4",
          color: "#166534",
        };
      default:
        return { borderColor: "#3b82f6", background: "#eff6ff", color: "#1e40af" };
    }
  }, [queueInfo.status]);

  const progress = useMemo(() => {
    // Simple progress estimate: closer to 1 when position approaches 1
    // Clamp to [0, 1]
    if (queueInfo.totalInQueue <= 0) return 0;
    const p =
      (queueInfo.totalInQueue - queueInfo.position + 1) / queueInfo.totalInQueue;
    return Math.max(0, Math.min(1, p));
  }, [queueInfo.position, queueInfo.totalInQueue]);

  // Dedupe + keep list from getting huge
  function pushNotif(type, text) {
    setNotifications((prev) => {
      // block duplicate if the newest notification has same text
      if (prev.length > 0 && prev[0].text === text) return prev;

      const next = [
        {
          id: Date.now(),
          type,
          text,
          time: new Date(),
        },
        ...prev,
      ];

      // keep max 10 in memory
      return next.slice(0, 10);
    });
  }

  function simulateRefresh() {
    setQueueInfo((prev) => {
      // Once ready for pickup, keep it stable
      if (prev.status === "READY_FOR_PICKUP") {
        return { ...prev, lastUpdated: new Date() };
      }
  
      // Move up exactly 1 spot per refresh (clean + predictable)
      const newPos = Math.max(1, prev.position - 1);
  
      // Update ETA based on position (simple estimate)
      // Example: each person ahead ~ 6 minutes
      const minutesPerSpot = 6;
      const newEta = Math.max(0, (newPos - 1) * minutesPerSpot);
  
      let newStatus = prev.status;
  
      // Status changes based on position/state
      if (newPos >= 3) {
        newStatus = "WAITING";
      }
      if (newPos === 2) {
        newStatus = "ALMOST_READY";
      }
      if (newPos === 1 && prev.status !== "SERVED" && prev.status !== "READY_FOR_PICKUP") {
        newStatus = "SERVED";
      }
  
      // Notifications ONLY at key milestones
      if (prev.status === "WAITING" && newStatus === "ALMOST_READY") {
        pushNotif("warning", "You’re next in line. Please be near the store.");
      }
  
      if (prev.status !== "SERVED" && newStatus === "SERVED") {
        pushNotif(
          "success",
          "It’s your turn! Grooming started! We’ll notify you when your pet is ready for pickup."
        );
      }
  
      // After served, one more refresh will set Ready for Pickup (simple + demo-friendly)
      if (prev.status === "SERVED" && newStatus === "SERVED") {
        newStatus = "READY_FOR_PICKUP";
        pushNotif("success", "Ready for pickup! Please come to the front desk.");
      }
  
      return {
        ...prev,
        position: newPos,
        etaMinutes: newEta,
        status: newStatus,
        lastUpdated: new Date(),
      };
    });
  }
  

  function leaveQueue() {
    // UI-only: clear queue info
    pushNotif("info", "You left the queue.");
    setQueueInfo((prev) => ({
      ...prev,
      position: 0,
      totalInQueue: 0,
      etaMinutes: 0,
      status: "WAITING",
      serviceName: "",
    }));
  }

  const isInQueue = queueInfo.position > 0;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Queue Status</h1>
          <p style={styles.subtitle}>
            Track your pet’s place in line and estimated wait time.
          </p>
        </div>
        <div style={{ ...styles.badge, ...statusStyle }}>{statusLabel}</div>
      </header>

      {!isInQueue ? (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Not currently in a queue</h2>
          <p style={styles.cardText}>
            Join a service queue to see your position, ETA, and updates here.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Current Queue</h2>
              <div style={styles.row}>
                <span style={styles.label}>Pet</span>
                <span style={styles.value}>{queueInfo.petName}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Service</span>
                <span style={styles.value}>{queueInfo.serviceName}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Position</span>
                <span style={styles.value}>
                  #{queueInfo.position} of {queueInfo.totalInQueue}
                </span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Estimated Wait</span>
                <span style={styles.value}>{queueInfo.etaMinutes} min</span>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={styles.progressWrap}>
                  <div
                    style={{ ...styles.progressBar, width: `${progress * 100}%` }}
                  />
                </div>
                <div style={styles.progressHint}>
                  Updated: {queueInfo.lastUpdated.toLocaleTimeString()}
                </div>
              </div>

              <div style={styles.actions}>
                <button style={styles.primaryBtn} onClick={simulateRefresh}>
                  Refresh (Simulate)
                </button>
                <button style={styles.ghostBtn} onClick={leaveQueue}>
                  Leave Queue
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Notifications</h2>
              <p style={styles.cardText}>
                In-app updates for queue changes and status changes.
              </p>

              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotif}>No notifications yet.</div>
                ) : (
                  // show only 5 to keep UI clean
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} style={styles.notifItem}>
                      <span style={styles.notifDot(n.type)} />
                      <div style={{ flex: 1 }}>
                        <div style={styles.notifText}>{n.text}</div>
                        <div style={styles.notifTime}>
                          {n.time.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  style={styles.ghostBtn}
                  onClick={() => setNotifications([])}
                >
                  Clear Notifications
                </button>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Status meanings</h2>
            <ul style={styles.list}>
              <li>
                <b>Waiting:</b> you’re in line.
              </li>
              <li>
                <b>Almost Ready:</b> please be nearby.
              </li>
              <li>
                <b>Served:</b> grooming started / your turn.
              </li>
              <li>
                <b>Ready for Pickup:</b> grooming complete / pick up your pet.
              </li>
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
  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid",
    fontWeight: 700,
    fontSize: 14,
    height: "fit-content",
  },

  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    marginBottom: 16,
  },
  cardTitle: { margin: 0, fontSize: 18 },
  cardText: { margin: "6px 0 0", color: "#4b5563", fontSize: 14 },

  row: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 10 },
  label: { color: "#4b5563", fontSize: 14 },
  value: { fontWeight: 650, fontSize: 14, color: "#111827" },

  progressWrap: {
    width: "100%",
    height: 10,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: { height: "100%", background: "#3b82f6" },
  progressHint: { marginTop: 6, fontSize: 12, color: "#6b7280" },

  actions: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
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

  notifList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 },
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
  notifText: { fontSize: 14, color: "#111827" },
  notifTime: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  emptyNotif: { color: "#6b7280", fontSize: 14 },

  list: { margin: "10px 0 0", color: "#374151" },
};
