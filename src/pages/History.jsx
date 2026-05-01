import { useEffect, useMemo, useState } from "react";
import { getStoredQueueOwnerEmail } from "../lib/userQueueStorage.js";

//services
const services = [
  { id: "all", name: "Services", minutes: 0 },
  { id: 1, name: "Nail trimming", minutes: 10 },
  { id: 2, name: "Haircut", minutes: 30 },
  { id: 3, name: "Full Groom (Bath + Haircut + Nails)", minutes: 60 },
  { id: 4, name: "Bath + Dry", minutes: 35 },
  { id: 5, name: "Teeth Cleaning", minutes: 20 },
];

export default function History({goToUserDashboard}) {
  const ownerName = getStoredQueueOwnerEmail();
  const [selectedServiceId, setSelectedServiceId] = useState("all");

  // history
  const [historyList, setHistoryList] = useState([]);

  // notifications
  const [message, setmessage] = useState("");

  // history data from backend API
  useEffect(() => {
  if (!ownerName) {
    setHistoryList([]);
    setmessage("No user found. Please join the queue first.");
    return;
  }

  const url =
    selectedServiceId === "all"
      ? `http://localhost:3001/api/history?ownerName=${encodeURIComponent(ownerName)}`
      : `http://localhost:3001/api/history?ownerName=${encodeURIComponent(ownerName)}&serviceId=${selectedServiceId}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      setHistoryList(data);
      setmessage("");
    })
    .catch(() => setmessage("Failed to load history."));
}, [selectedServiceId, ownerName]);




  // service lookup
  const serviceById = useMemo(() => {
    const map = new Map();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, []);

  // sorting backend data
  const filteredHistory = useMemo(() => {
    return [...historyList].sort((a, b) => b.date.localeCompare(a.date));
  }, [historyList]);

    const formatOutcome = (text) => {
      if (!text) return "";
      return text
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      };

  return (
    <div
    style={{
      minHeight: "100vh",
      width: "100%",           
      color: "#ffffff",
      fontFamily: "system-ui, Arial",
      padding: 16,             
      boxSizing: "border-box",
      overflowX: "hidden",     
    }}
    >
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        <div>
            <div style = {{margin: 0, fontSize: 28, fontWeight: 700, color: "#14532d"}}>History</div>
            <div style = {{margin: 0, fontSize: 16, fontWeight: 500, color: "#787b80"}}>View your queue history.</div>
            <span onClick={goToUserDashboard} style={backButton}>
              ← Return to Dashboard
            </span>
        </div>

        {message && (
          <div
            style={{
              padding: 12,
              marginBottom: 12,
              borderRadius: 12,
              background: "rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {message}
          </div>
        )}

        {/*table*/}
        <div
          style={{
            borderRadius: 14,
            overflowX: "auto",
            border: "1px solid #e5dddd",
            background: "#3f5e36",
            color: "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>Past Queues Joined</div>
            <div style={{ display:"flex", alignItems:"center", gap: 10}}>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setmessage("");
                  }}
                  style={selectStyle}>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
            </div>
          </div>

          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, letterSpacing: 0.7, opacity: 0.8 }}>
                  <th style={th}>DATE</th>
                  <th style={th}>PET</th>
                  <th style={th}>SERVICE</th>
                  <th style={th}>OUTCOME</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 16, opacity: 0.8 }}>
                      No history yet.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h) => {
                    const svc = serviceById.get(h.serviceId);

                    const dateText = new Date(h.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr key={h.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={td}>{dateText}</td>
                        <td style={td}>{h.pet}</td>
                        <td style={td}>{h.service_name || svc?.name || "Service"}</td>
                        <td style={td}>{formatOutcome(h.outcome)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div style={totalRow}>
              <strong>   Total:</strong> {filteredHistory.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: "12px 16px",
  background: "#def4d8c0",
  color: "#14532d",
  fontWeight: 900,
  textAlign: "left",
};

const td = {
  padding: "12px 16px",
  verticalAlign: "middle",
  color: "#000000",
  background: "#f4f4f4",
  borderTop: "1px solid rgba(0,0,0,0.25)",
};

const backButton = {
    color: "#166534",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 14,
};

const totalRow = {
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: 700,
  color: "#14532d",
  background: "#def4d8c0",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #a9cbb5",
  background: "#e0efdced",
  color: "#536c4c",
  fontWeight: 600,
};