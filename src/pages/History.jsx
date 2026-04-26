import { useEffect, useMemo, useState } from "react";

// services
const services = [
  { id: "all", name: "Services", minutes: 0 },
  { id: 1, name: "Nail trimming", minutes: 10 },
  { id: 2, name: "Haircut", minutes: 30 },
  { id: 3, name: "Full Groom (Bath + Haircut + Nails)", minutes: 60 },
  { id: 4, name: "Bath + Dry", minutes: 35 },
];

// groomers
const groomers = [
  { id: "g1", name: "Lilly Rose" },
  { id: "g2", name: "Julian Rangel" },
  { id: "g3", name: "Ariana Nazario" },
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

  const groomerById = useMemo(() => {
    const map = new Map();
    groomers.forEach((g) => map.set(g.id, g));
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
        background: "#c4e7e5",
        color: "#000000",
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
            background: "rgba(255,255,255,0.05)",
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
            border: "3px solid #000",
            background: "rgba(49, 97, 123, 0.14)",
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
                  <th style={th}>GROOMER</th>
                  <th style={th}>SERVICE</th>
                  <th style={th}>OUTCOME</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, opacity: 0.8 }}>
                      No history yet.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h) => {
                    const svc = serviceById.get(h.serviceId);
                    const g = groomerById.get(h.groomerId);

                    const dateText = new Date(h.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr key={h.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={td}>{dateText}</td>
                        <td style={td}>{h.pet}</td>
                        <td style={td}>{g?.name ?? "Groomer"}</td>
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

const th = {padding: "10px 16px"};
const td = {padding: "12px 16px",verticalAlign: "middle" };

const selectgroomer = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "#eee",
};