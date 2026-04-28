import { useEffect, useState } from "react";
import "./Assignment4Auth.css";
import { apiUrl } from "../lib/api.js";

function formatList(items, emptyLabel) {
  if (!items || items.length === 0) {
    return [emptyLabel];
  }

  return items.map((item) => item.message || JSON.stringify(item));
}

export default function UserDashboardPage({ goToLogin, goToJoinQueue }) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

        const [meResponse, historyResponse, notificationsResponse] = await Promise.all([
          fetch(apiUrl("/api/users/me"), requestOptions),
          fetch(apiUrl("/api/users/me/history"), requestOptions),
          fetch(apiUrl("/api/users/me/notifications"), requestOptions),
        ]);

        const [meData, historyData, notificationsData] = await Promise.all([
          meResponse.json(),
          historyResponse.json(),
          notificationsResponse.json(),
        ]);

        if (!meResponse.ok) {
          throw new Error(meData.error || "Failed to load profile");
        }

        if (!historyResponse.ok) {
          throw new Error(historyData.error || "Failed to load history");
        }

        if (!notificationsResponse.ok) {
          throw new Error(notificationsData.error || "Failed to load notifications");
        }

        if (!isActive) {
          return;
        }

        setUser(meData);
        setHistory(historyData.history || []);
        setNotifications(notificationsData.notifications || []);
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

  const historyItems = formatList(history, "No history found");
  const notificationItems = formatList(notifications, "No notifications found");

  return (
    <section className="assignment-shell">
      <div className="assignment-hero assignment-dashboard">
        <div>
          <h1 className="assignment-title">Dashboard</h1>
          <p className="assignment-subtitle">
            {user ? `Signed in as ${user.name || user.email}` : "User dashboard for Assignment 4"}
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
                <div className="dashboard-big-number">--</div>
              </div>

              <div>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">People Ahead:</span> <strong>--</strong>
                </p>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Estimated Wait:</span> <strong>--</strong>
                </p>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Service Type:</span> <strong>{user?.role || "--"}</strong>
                </p>
                <p className="dashboard-meta">
                  <span className="dashboard-muted">Email:</span> <strong>{user?.email || "--"}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Notifications</h2>
            <ul className="dashboard-list">
              {notificationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="dashboard-card">
            <h2>History</h2>
            <ul className="dashboard-list">
              {historyItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
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
