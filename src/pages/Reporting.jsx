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
  background: "#c4e7e5",
  color: "#000",
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
  marginBottom: 14,
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.05)",
};

const selectStyle = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "#eee",
};

const button = {
  padding: "9px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(83, 180, 88, 0.81)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const messageBox = {
  padding: 12,
  marginBottom: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,0.05)",
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  marginBottom: 16,
};

const card = {
  padding: 16,
  borderRadius: 14,
  border: "3px solid #000",
  background: "rgba(49, 97, 123, 0.14)",
};

const cardLabel = {
  fontSize: 14,
  opacity: 0.8,
};

const cardNumber = {
  fontSize: 30,
  fontWeight: 800,
  marginTop: 8,
};

const tableBox = {
  borderRadius: 14,
  overflow: "hidden",
  border: "3px solid #000",
  background: "rgba(49, 97, 123, 0.14)",
  marginBottom: 16,
};

const tableTitle = {
  padding: "12px 16px",
  fontWeight: 700,
  borderBottom: "3px solid #000",
};

const th = {
  padding: "10px 16px",
  textAlign: "left",
};

const td = {
  padding: "12px 16px",
  borderTop: "1px solid rgba(0,0,0,0.15)",
};