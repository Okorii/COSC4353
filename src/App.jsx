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
