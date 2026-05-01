import "./App.css"
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
import Reporting from "./pages/Reporting.jsx";

export default function App() {
  const [page, setPage] = useState("login");

  return (
    <div style={appShell}>

      <div style={pageWrap}>
        {page === "queue" ? (
          <QueueManagement 
          goToAdmin={() => setPage("admin")}
          />
        ) : page === "service" ? (
          <ServiceManagement 
          goToAdmin={() => setPage("admin")}
          />
        ) : page === "status" ? (
          <QueueStatus 
          goToUserDashboard={() => setPage("user-dashboard")}
          />
        ) : page === "admin" ? (
          <AdminDashboard
            goToQueue={() => setPage("queue")}
            goToServices={() => setPage("service")}
            goToReports={() => setPage("reporting")}
            goToLogin={() => setPage("login")} 
          />
        ) : page === "join" ? (
          <JoinQueue 
          goToStatus={() => setPage("status")}
          goToUserDashboard={() => setPage("user-dashboard")}
           />
        ) : page === "login" ? (
          <LoginPage
            goToRegister={() => setPage("register")}
            goToDashboard={() => setPage("user-dashboard")}
            goToAdminDashboard={() => setPage("admin")}
          />
        ) : page === "register" ? (
          <RegistrationPage goToLogin={() => setPage("login")} />
        ) : page === "user-dashboard" ? (
          <UserDashboardPage
            goToLogin={() => setPage("login")}
            goToJoinQueue={() => setPage("join")}
            goToStatus={() => setPage("status")}
            goToHistory={() => setPage("history")}
          />
        ) : page === "reporting" ? (
          <Reporting
          goToAdmin={() => setPage("admin")}
          />
        ) : (
          <History
          goToUserDashboard={() => setPage("user-dashboard")}
          />
        )}
      </div>
    </div>
  );
}

const appShell = {
  minHeight: "100vh",
  width: "100%",
  background: "#f3f4f6",
};

const pageWrap = {
  width: "100%",
};
