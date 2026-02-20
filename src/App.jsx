
//only shows service management
/*
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import QueueStatus from "./pages/QueueStatus";
import ServiceManagement from "./pages/ServiceManagement";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <nav style={{ marginBottom: 20, display: "flex", gap: 20 }}>
          <Link to="/">Queue Status</Link>
          <Link to="/service-management">Service Management</Link>
        </nav>

        <Routes>
          <Route path="/" element={<QueueStatus />} />
          <Route path="/service-management" element={<ServiceManagement />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

*/

// background doesnt fit properly
/*
import { useState } from "react";
import QueueManagement from "./pages/QueueManagement.jsx";
import ServiceManagement from "./pages/ServiceManagement.jsx";

export default function App() {
  const [page, setPage] = useState("queue");

  return (
    <div>
      <div style={{ display: "flex", gap: 10, padding: 12 }}>
        <button onClick={() => setPage("queue")}>Queue Management</button>
        <button onClick={() => setPage("service")}>Service Management</button>
      </div>

      {page === "queue" ? <QueueManagement /> : <ServiceManagement />}
    </div>
  );
}
*/

import { useState } from "react";
import QueueManagement from "./pages/QueueManagement.jsx";
import ServiceManagement from "./pages/ServiceManagement.jsx";
import QueueStatus from "./pages/QueueStatus.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import JoinQueue from "./pages/JoinQueue.jsx";

export default function App() {
  const [page, setPage] = useState("queue");

  return (
    <div style={appShell}>
      <div style={topTabs}>
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
  
      </div>

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
            goToServices={() => setPage("service")}/>
        ) : (
          <JoinQueue 
            goToStatus={() => setPage("status")} />
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



