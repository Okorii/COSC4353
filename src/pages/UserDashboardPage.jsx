import { useEffect, useMemo, useState } from "react";
import "./Assignment4Auth.css";
import { apiUrl } from "../lib/api.js";

function createEmptyQueueInfo() {
  return {
    entryId: null,
    serviceName: "",
    petName: "",
    position: 0,
    totalInQueue: 0,
    etaMinutes: 0,
    status: "WAITING",
  };
}

function getStatusLabel(queueInfo) {
  if (!queueInfo.entryId) return "Waiting";
  if (queueInfo.status === "SERVED") return "Served";
  if (queueInfo.position === 1) return "Serving";
  if (queueInfo.position === 2) return "Almost Ready";
  return "Waiting";
}

function buildQueueNotification(queueInfo) {
  const statusLabel = getStatusLabel(queueInfo);

  if (!queueInfo.entryId) {
    return "No notifications yet.";
  }

  if (statusLabel === "Served") {
    return "Ready for pickup! Please come to the front desk.";
  }

  if (statusLabel === "Serving") {
    return "It's your turn. Grooming has started.";
  }

  if (statusLabel === "Almost Ready") {
    return "You're next in line. Please be nearby.";
  }

  return "You're in the queue. We'll notify you when you're almost ready.";
}

function formatHistoryItem(item) {
  if (!item) {
    return "No history found";
  }

  const petName = item.pet || item.petName || "Pet";
  const serviceName = item.service_name || item.serviceName || `Service ${item.serviceId ?? ""}`.trim();
  const outcome = item.outcome || "Updated";
  return `${petName} - ${serviceName} (${outcome})`;
}

export default function UserDashboardPage({
  goToLogin,
  goToJoinQueue,
  goToStatus,
  goToHistory,
}) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queueInfo, setQueueInfo] = useState(createEmptyQueueInfo());
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setError("You are not logged in.");
      return;
    }

    let isActive = true;

    const loadDashboard = async () => {
      try {
        const requestOptions = {
          headers: {
            "x-user-id": userId,
          },
        };

        const meResponse = await fetch(apiUrl("/api/users/me"), requestOptions);
        const meData = await meResponse.json();

        if (!meResponse.ok) {
          throw new Error(meData.error || "Failed to load profile");
        }

        const ownerName = localStorage.getItem("ownerName") || meData.email;
        const queueEntryId = localStorage.getItem("queueEntryId");

        const requests = [
          fetch(apiUrl("/api/users/me/notifications"), requestOptions),
          fetch(
            `${apiUrl("/api/history")}?ownerName=${encodeURIComponent(ownerName)}`,
          ),
        ];

        if (queueEntryId) {
          requests.push(fetch(apiUrl(`/api/queue-status/${queueEntryId}`)));
          requests.push(fetch(apiUrl("/api/queue-management")));
        }

        const responses = await Promise.all(requests);
        const payloads = await Promise.all(responses.map((response) => response.json()));

        const [notificationsResponse, historyResponse, queueEntryResponse, queueListResponse] = responses;
        const [notificationsData, historyData, queueEntryData, queueListData] = payloads;

        if (!notificationsResponse.ok) {
          throw new Error(notificationsData.error || "Failed to load notifications");
        }

        if (!historyResponse.ok) {
          throw new Error(historyData.error || "Failed to load history");
        }

        const normalizedHistory = Array.isArray(historyData) ? historyData : [];
        const normalizedNotifications = Array.isArray(notificationsData.notifications)
          ? notificationsData.notifications
          : [];

        let nextQueueInfo = createEmptyQueueInfo();

        if (queueEntryId && queueEntryResponse?.ok && Array.isArray(queueListData)) {
          const index = queueListData.findIndex(
            (entry) =>
              Number(entry.id ?? entry.entry_id) === Number(queueEntryData.id),
          );

          const position = index >= 0 ? index + 1 : 0;
          const duration = Number(queueEntryData.expectedDuration || 0);
          const peopleAhead = Math.max(position - 1, 0);

          nextQueueInfo = {
            entryId: queueEntryData.id,
            serviceName: queueEntryData.serviceName || `Service ${queueEntryData.serviceId}`,
            petName: queueEntryData.petName || "",
            position,
            totalInQueue: queueListData.length,
            etaMinutes: peopleAhead * duration,
            status: queueEntryData.status || "WAITING",
          };
        }

        if (!isActive) {
          return;
        }

        setUser(meData);
        setHistory(normalizedHistory);
        setNotifications(normalizedNotifications);
        setQueueInfo(nextQueueInfo);
        setError("");
      } catch (loadError) {
        console.error("Dashboard error:", loadError);
        if (isActive) {
          setError(loadError.message);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    goToLogin();
  };

  const currentPositionLabel = queueInfo.position
    ? `#${queueInfo.position} of ${queueInfo.totalInQueue || queueInfo.position}`
    : "--";

  const latestNotification = useMemo(() => {
    if (queueInfo.entryId) {
      return buildQueueNotification(queueInfo);
    }

    if (notifications.length === 0) {
      return "No notifications found";
    }

    return notifications[0].message || JSON.stringify(notifications[0]);
  }, [notifications, queueInfo]);

  const latestHistory = useMemo(() => {
    if (history.length === 0) {
      return "No history found";
    }

    const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
    return formatHistoryItem(sortedHistory[0]);
  }, [history]);

  return (
    <section className="assignment-shell">
      <div className="assignment-hero assignment-dashboard">
        <div>
          <h1 className="assignment-title">Dashboard</h1>
          <p className="assignment-subtitle">
            {user ? `Signed in as ${user.name || user.email}` : "User dashboard"}
          </p>
        </div>

        <button type="button" className="assignment-button logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="assignment-dashboard">
        {error ? <p className="assignment-message error">{error}</p> : null}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Overview</h2>
            <div className="dashboard-queue-body">
              <div>
                <p className="dashboard-label">Current Position:</p>
                <div className="dashboard-big-number">{currentPositionLabel}</div>
              </div>

              <div>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Estimated Wait:</span>{" "}
                  <strong>{queueInfo.entryId ? `${queueInfo.etaMinutes} min` : "--"}</strong>
                </p>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Service Type:</span>{" "}
                  <strong>{queueInfo.serviceName || "--"}</strong>
                </p>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Pet:</span>{" "}
                  <strong>{queueInfo.petName || "--"}</strong>
                </p>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Email:</span>{" "}
                  <strong>{user?.email || "--"}</strong>
                </p>
              </div>
            </div>
          </div>

          <div
            className="dashboard-card dashboard-card-link"
            onClick={goToStatus}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goToStatus();
              }
            }}
            role="link"
            tabIndex={0}
          >
            <h2>Notifications</h2>
            <ul className="dashboard-list">
              <li>{latestNotification}</li>
            </ul>
          </div>

          <div
            className="dashboard-card dashboard-card-link"
            onClick={goToHistory}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goToHistory();
              }
            }}
            role="link"
            tabIndex={0}
          >
            <h2>History</h2>
            <ul className="dashboard-list">
              <li>{latestHistory}</li>
            </ul>
          </div>

          <div className="dashboard-card">
            <h2>Services</h2>
            <div className="dashboard-actions">
              <button type="button" className="assignment-button">
                Appointment
              </button>
              <button type="button" className="assignment-button" onClick={goToJoinQueue}>
                Walk In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
