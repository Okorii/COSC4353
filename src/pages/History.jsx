import { useEffect, useMemo, useState } from "react";

//services
const services = [
  { id: "all", name: "Services", minutes: 0 },
  { id: 1, name: "Nail trimming", minutes: 10 },
  { id: 2, name: "Haircut", minutes: 30 },
  { id: 3, name: "Full Groom (Bath + Haircut + Nails)", minutes: 60 },
  { id: 4, name: "Bath + Dry", minutes: 35 },
];

export default function History() {
  const [selectedServiceId, setSelectedServiceId] = useState("all");

  // history
  const [historyList, setHistoryList] = useState([]);

  // notifications 
  const [message, setmessage] = useState("");

  // history data from backend API
  useEffect(() => {
    const url =
      selectedServiceId === "all"
        ? "http://localhost:3001/api/history"
        : `http://localhost:3001/api/history?serviceId=${selectedServiceId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setHistoryList(data))
      .catch(() => setmessage("Failed to load history."));
  }, [selectedServiceId]);

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
        width: "100vw",
        background: "#24243a",
        color: "#ffffff",
        fontFamily: "system-ui, Arial",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        {/*header*/}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            padding: "14px 16px",
            borderRadius: 14,
            background: "#8f8f8f",
            color:"#000000",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/*title*/}
          <div>
            <div style={{fontSize: 16, opacity: 0.85,letterSpacing: 0.6 }}>History</div>
            <div style={{ fontWeight: 700, marginTop:6 }}>Past Queues Joined</div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap: 10}}>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setmessage("");
              }}
              style={selectgroomer}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
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
            overflow: "hidden",
            border: "2px solid #ffffff",
            background: "#8f8f8f",
            color: "#000000",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
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
            <div style={{ fontWeight: 700 }}>History</div>
            <div style={{ opacity: 0.85 }}>
              <strong>Total:</strong> {filteredHistory.length}
            </div>
          </div>

          <div style={{ borderTop: "3px solid rgb(0, 0, 0)" }}>
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
                        <td style={td}>{svc?.name ?? "Service"}</td>
                        <td style={td}>{formatOutcome(h.outcome)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: "12px 16px",
  background: "#d9e6f7",
  color: "#000000",
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

const selectgroomer = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "2px solid #ffffff",
  background: "#ffffff",
  color: "#000000",
  fontWeight: 600,
};