// NOTE: THIS IS NOT COMPLETE. Need to add back end.
// in future, i will add personal info for each user. Right now, all mock data in one view.
import { useMemo, useState } from "react";

// services
const services = [
  { id: "all", name: "Services", minutes: 0 },
  { id: "quick", name: "Quick Wash", minutes: 20 },
  { id: "full", name: "Full Groom", minutes: 60 },
  { id: "nails", name: "Nail Trim", minutes: 10 },
  { id: "haircut", name: "Haircut", minutes: 30 },
  { id: "bathplusdry", name: "Package", minutes: 35 },
];

// groomers
const groomers = [
  { id: "g1", name: "Lilly Rose" },
  { id: "g2", name: "Julian Rangel" },
  { id: "g3", name: "Ariana Nazario" },
];

// placeholder FINISH LATER assignment 3
const initialHistory = [
  { id: "h1", date: "2026-02-10", pet: "Kochi", groomerId: "g1", serviceId: "nails", outcome: "completed" },
  { id: "h2", date: "2026-02-12", pet: "Cake", groomerId: "g2", serviceId: "quick", outcome: "canceled" },
  { id: "h3", date: "2026-02-18", pet: "Sam", groomerId: "g3", serviceId: "full", outcome: "no show" },
  { id: "h4", date: "2026-02-19", pet: "Chucho", groomerId: "g1", serviceId: "bathplusdry", outcome: "completed" },
];

export default function History() {
  const [selectedServiceId, setSelectedServiceId] = useState("all");

  // history
  const [historyList] = useState(initialHistory);

  // notifications - implementation will add later
  const [message, setmessage] = useState("");

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

  const filteredHistory = useMemo(() => {
    let list = historyList;

    if (selectedServiceId !== "all") {
      list = list.filter((h) => h.serviceId === selectedServiceId);
    }

    // newer first
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [historyList, selectedServiceId]);

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

                    const dateText = new Date(h.date + "T00:00:00").toLocaleDateString(undefined, {
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