import { useState } from "react";
import QueueManagement from "./pages/QueueManagement.jsx";
import ServiceManagement from "./pages/ServiceManagement.jsx";
import QueueStatus from "./pages/QueueStatus.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import JoinQueue from "./pages/JoinQueue.jsx";
import History from "./pages/History.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import UserDashboardPage from "./pages/UserDashboardPage.jsx";

export default function App() {
  const [page, setPage] = useState("login");
  const showTopTabs = page !== "login" && page !== "register";

  return (
    <div style={appShell}>
      {showTopTabs ? (
        <div style={topTabs}>
          <button style={tabBtn(page === "user-dashboard")} onClick={() => setPage("user-dashboard")}>
            User Dashboard
          </button>

          <button style={tabBtn(page === "queue")} onClick={() => setPage("queue")}>
            Queue Management
          </button>

          <button style={tabBtn(page === "service")} onClick={() => setPage("service")}>
            Service Management
          </button>

          <button style={tabBtn(page === "status")} onClick={() => setPage("status")}>
            Queue Status
          </button>

          <button style={tabBtn(page === "admin")} onClick={() => setPage("admin")}>
            Admin Dashboard
          </button>

          <button style={tabBtn(page === "join")} onClick={() => setPage("join")}>
            Join Queue
          </button>
          <button style={tabBtn(page === "history")} onClick={() => setPage("history")}>
            History
          </button>
        </div>
      ) : null}

      <div style={pageWrap}>
        {page === "queue" ? (
          <QueueManagement />
        ) : page === "service" ? (
          <ServiceManagement />
        ) : page === "status" ? (
          <QueueStatus />
        ) : page === "admin" ? (
           <AdminDashboard 
          goToQueue={() => setPage("queue")}
          goToServices={() => setPage("service")}
        />
) : page === "join" ? (
  <JoinQueue 
    goToStatus={() => setPage("status")} 
  />
  ) : page === "login" ? (
  <LoginPage
    goToRegister={() => setPage("register")}
    goToDashboard={() => setPage("user-dashboard")}
  />
  ) : page === "register" ? (
  <RegistrationPage
    goToLogin={() => setPage("login")}
  />
  ) : page === "user-dashboard" ? (
  <UserDashboardPage
    goToLogin={() => setPage("login")}
    goToJoinQueue={() => setPage("join")}
  />
  ) : (
  <History/>
  )}
      </div>
    </div>
  );
}

// background
const appShell = {
  minHeight: "100vh",
  width: "100%",
  background: "#c4e7e5",
};

const topTabs = {
  padding: 12,
  display: "flex",
  gap: 10,
};

const pageWrap = {
  width: "100%",
};


const tabBtn = (active) => ({
  padding: "8px 12px",
  borderRadius: 8,
  border: active ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
  background: active ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.15)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 500,
});



