import { useEffect, useMemo, useState } from "react";
import "./Assignment4Auth.css";
import { apiUrl } from "../lib/api.js";
import {
  getStoredQueueEntryId,
  getStoredQueueOwnerEmail,
} from "../lib/userQueueStorage.js";

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

function formatHistoryItem(item, serviceNameById) {
  if (!item) {
    return "No history found";
  }

  const petName = item.pet || item.petName || "Pet";
  const mappedServiceName = serviceNameById.get(Number(item.serviceId));
  const serviceName =
    item.service_name ||
    item.serviceName ||
    mappedServiceName ||
    `Service ${item.serviceId ?? ""}`.trim();
  const outcome = item.outcome || "Updated";
  return `${petName} - ${serviceName} (${outcome})`;
}

function formatNotificationItem(item) {
  if (!item) {
    return "No notifications found";
  }

  return item.message || item.text || JSON.stringify(item);
}

function normalizeService(service) {
  const rawName = service.service_name ?? service.serviceName ?? service.name ?? "Unknown Service";
  return {
    serviceId: service.service_id ?? service.serviceId ?? service.id,
    serviceName: rawName.replace(/\s+\d{6,}$/, ""),
    active: service.active === 1 || service.active === true,
  };
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
  const [services, setServices] = useState([]);
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

        const ownerName = getStoredQueueOwnerEmail() || meData.email;
        const queueEntryId = getStoredQueueEntryId();

        const requests = [
          fetch(apiUrl("/api/users/me/notifications"), requestOptions),
          fetch(
            `${apiUrl("/api/history")}?ownerName=${encodeURIComponent(ownerName)}`,
          ),
          fetch(apiUrl("/api/services")),
        ];

        if (queueEntryId) {
          requests.push(fetch(apiUrl(`/api/queue-status/${queueEntryId}`)));
          requests.push(fetch(apiUrl("/api/queue-management")));
        }

        const responses = await Promise.all(requests);
        const payloads = await Promise.all(responses.map((response) => response.json()));

        const [
          notificationsResponse,
          historyResponse,
          servicesResponse,
          queueEntryResponse,
          queueListResponse,
        ] = responses;
        const [
          notificationsData,
          historyData,
          servicesData,
          queueEntryData,
          queueListData,
        ] = payloads;

        if (!notificationsResponse.ok) {
          throw new Error(notificationsData.error || "Failed to load notifications");
        }

        if (!historyResponse.ok) {
          throw new Error(historyData.error || "Failed to load history");
        }

        if (!servicesResponse.ok) {
          throw new Error(servicesData.error || "Failed to load services");
        }

        const normalizedHistory = Array.isArray(historyData) ? historyData : [];
        const normalizedNotifications = Array.isArray(notificationsData.notifications)
          ? notificationsData.notifications
          : [];
        const normalizedServices = Array.isArray(servicesData)
          ? servicesData
            .map(normalizeService)
            .filter(
              (service, index, self) =>
                service.active &&
                service.serviceName !== "Updated Haircut" &&
                service.serviceName !== "Temp Service" &&
                index === self.findIndex((s) => s.serviceName === service.serviceName),
            )
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
        setServices(normalizedServices);
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
    ? `${queueInfo.position}`
    : "--";

  const latestNotification = useMemo(() => {
    if (queueInfo.entryId || notifications.length > 0) {
      const queueNotification = queueInfo.entryId
        ? [{
            id: `queue-${queueInfo.entryId}-${queueInfo.status}-${queueInfo.position}`,
            text: buildQueueNotification(queueInfo),
          }]
        : [];

      const userNotifications = notifications.map((item, index) => ({
        ...item,
        id: item.id ?? `notification-${index}`,
        text: formatNotificationItem(item),
      }));

      return [...queueNotification, ...userNotifications]
        .slice(0, 3)
        .map((item) => item.text);
    }

    return ["No notifications found"];
  }, [notifications, queueInfo]);

  const serviceNameById = useMemo(() => {
    const map = new Map();
    services.forEach((service) => {
      map.set(Number(service.serviceId), service.serviceName);
    });
    return map;
  }, [services]);

  const recentHistory = useMemo(() => {
    if (history.length === 0) {
      return ["No history found"];
    }

    return [...history]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map((item) => formatHistoryItem(item, serviceNameById));
  }, [history, serviceNameById]);

  const openJoinQueueForService = (serviceId) => {
    localStorage.setItem("preferredServiceId", String(serviceId));
    goToJoinQueue();
  };

  return (
    <section className="assignment-shell">
      <div className="assignment-hero assignment-dashboard">
        <div>
          <h1 className="assignment-title"> {user ? `Welcome, ${user.name || user.email}` : "User dashboard"}</h1>
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
              {latestNotification.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
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
              {recentHistory.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="dashboard-card">
            <h2>Services</h2>
            <p className="dashboard-subtitle">
              Select a service to join the queue.
            </p>
            <div className="dashboard-actions">
              {services.length === 0 ? (
                <p className="dashboard-meta">No active services available.</p>
              ) : (
                services.map((service) => (
                  <button
                    key={service.serviceId}
                    type="button"
                    className="assignment-button"
                    onClick={() => openJoinQueueForService(service.serviceId)}
                  >
                    {service.serviceName}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
