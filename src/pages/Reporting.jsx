import { useEffect, useState } from "react";

//groomer mapping - converts IDs to the actual names.
const groomers = [
  { id: "g1", name: "Lilly Rose" },
  { id: "g2", name: "Julian Rangel" },
  { id: "g3", name: "Ariana Nazario" },
];

//filtering options
const services = [
  { id: "all", name: "All Services" },
  { id: 1, name: "Nail trimming" },
  { id: 2, name: "Haircut" },
  { id: 3, name: "Full Groom (Bath + Haircut + Nails)" },
  { id: 4, name: "Bath + Dry" },
];

//lookup map for groomer Ids to names
const groomerById = new Map();
groomers.forEach((g) => groomerById.set(g.id, g.name));

export default function Reporting() {
  //stores report data from backend
  const [report, setReport] = useState(null);
  //service filter
  const [serviceId, setServiceId] = useState("all");
  //displays error/status msg
  const [message, setMessage] = useState("");

  //get report data from api
  const loadReport = async () => {
    try {
      const url =
        serviceId === "all"
          ? "http://localhost:3001/api/reports/summary"
          : `http://localhost:3001/api/reports/summary?serviceId=${serviceId}`;

      const res = await fetch(url);
      const data = await res.json();
      //backend errors
      if (!res.ok) {
        setMessage(data.error || "Failed to load report.");
        return;
      }
      //storing report data
      setReport(data);
      setMessage("");
    } catch {
      setMessage("Server error while loading report.");
    }
  };
  //reload report whenever service filter is changed
  useEffect(() => {
    loadReport();
  }, [serviceId]);

  //triggers CSV export download
  const exportCsv = () => {
    window.open("http://localhost:3001/api/reports/export/csv", "_blank");
  };

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <div>
            <div style={{ fontSize: 16, opacity: 0.85 }}>Admin Reporting</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>
              QueueSmart Reports
            </div>
          </div>
          {/* Filters + Export */}
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              style={selectStyle}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <button onClick={exportCsv} style={button}>
              Export CSV
            </button>
          </div>
        </div>

        {message && <div style={messageBox}>{message}</div>}
        {/* report data display */}
        {report && (
          <>
            <div style={cards}>
              <div style={card}>
                <div style={cardLabel}>Total Queue Entries</div>
                <div style={cardNumber}>{report.queueStats.total_queue_entries}</div>
              </div>

              <div style={card}>
                <div style={cardLabel}>Users Served</div>
                <div style={cardNumber}>{report.queueStats.users_served}</div>
              </div>

              <div style={card}>
                <div style={cardLabel}>Currently Waiting</div>
                <div style={cardNumber}>{report.queueStats.currently_waiting}</div>
              </div>

              <div style={card}>
                <div style={cardLabel}>Removed</div>
                <div style={cardNumber}>{report.queueStats.users_removed}</div>
              </div>
            </div>
            {/* Recent history table */}
            <ReportTable
              title="Service Activity"
              columns={["Service ID", "Service Name", "Queue Count"]}
              rows={report.serviceActivity.map((s) => [
                s.service_id,
                s.service_name,
                s.queue_count,
              ])}
            />

            <ReportTable
              title="Recent Queue History"
              columns={["Date", "Pet", "Groomer", "Service", "Outcome"]}
              rows={report.recentHistory.map((h) => [
                new Date(h.date).toLocaleDateString(),
                h.pet_name,
                groomerById.get(h.groomer_id) || h.groomer_id,
                h.service_name,
                h.outcome,
              ])}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ReportTable({ title, columns, rows }) {
  return (
    <div style={tableBox}>
      <div style={tableTitle}>{title}</div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={td}>
                No data available.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, i) => (
                  <td key={i} style={td}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

//styling
const page = {
  minHeight: "100vh",
  width: "100vw",
  background: "#24243a",
  color: "#ffffff",
  fontFamily: "system-ui, Arial",
  padding: 20,
  boxSizing: "border-box",
};

const container = {
  maxWidth: 1400,
  width: "100%",
  margin: "0 auto",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
  padding: "18px 20px",
  borderRadius: 14,
  background: "#8f8f8f",
  color: "#000000",
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "2px solid #ffffff",
  background: "#ffffff",
  color: "#000000",
  fontWeight: 600,
};

const button = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#2fa043",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
};

const messageBox = {
  padding: 12,
  marginBottom: 12,
  borderRadius: 12,
  background: "#ffd6d6",
  color: "#7a0000",
  fontWeight: 700,
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 14,
  marginBottom: 18,
};

const card = {
  padding: 18,
  borderRadius: 14,
  border: "2px solid #ffffff",
  background: "#8f8f8f",
  color: "#000000",
  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
};

const cardLabel = {
  fontSize: 14,
  fontWeight: 700,
  color: "#111111",
};

const cardNumber = {
  fontSize: 32,
  fontWeight: 900,
  marginTop: 8,
  color: "#000000",
};

const tableBox = {
  borderRadius: 14,
  overflow: "hidden",
  border: "2px solid #ffffff",
  background: "#8f8f8f",
  color: "#000000",
  marginBottom: 18,
  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
};

const tableTitle = {
  padding: "14px 16px",
  fontWeight: 900,
  background: "#707070",
  color: "#ffffff",
  borderBottom: "2px solid #ffffff",
};

const th = {
  padding: "12px 16px",
  textAlign: "left",
  background: "#d9e6f7",
  color: "#000000",
  fontWeight: 900,
};

const td = {
  padding: "12px 16px",
  borderTop: "1px solid rgba(0,0,0,0.25)",
  color: "#000000",
  background: "#f4f4f4",
};