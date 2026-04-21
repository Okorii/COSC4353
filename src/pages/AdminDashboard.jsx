import { useState, useEffect } from "react";

export default function AdminDashboard({goToServices, goToQueue}){
  const [services, setServices] = useState([]);
  const [queueData, setQueue] = useState([]);
  
  useEffect(() => {
    //loading services
    fetch("http://localhost:3001/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error("Error loading services:", err));

    //loading queue info
    fetch("http://localhost:3001/api/queue-management")
      .then((res) => res.json())
      .then((data) => setQueue(data))
      .catch((err) => console.error("Error loading queue:", err));
  }, []);

  function getQueueLength(serviceId) {
    return queueData.filter(
      (item) =>
        String(item.service_id ?? item.serviceId) === String(serviceId)
    ).length;
  }

  function toggleService(id) {
    fetch(`http://localhost:3001/api/services/${id}/toggle-active`, {
        method: "PATCH",
      })
      .then((res) => res.json())
      .then((data) => {
        setServices((prev) =>
          prev.map((service) =>
            service.service_id === serviceId
              ? { ...service, active: data.active }
              : service
          )
        );
      })
      .catch((err) => console.error("Error toggling service:", err));
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
      </header>

      {/*current service card*/}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Current Services</h2>

        <div style={styles.list}>
          {services.map((s) => (
            <div key={s.service_id} style={styles.serviceRow}>
              <div style={{ flex: 1 }}>
                <div style={styles.serviceName}>{s.name}</div>

                <div style={styles.infoText}>
                  {s.expected_duration} min • Queue length: 
                  {getQueueLength(s.service_id)} •{" "}
                  <span style={s.active ? styles.openText : styles.closedText}>
                    {s.active ? "Open" : "Closed"}
                  </span>
                </div>

                <div style={styles.descText}>{s.description}</div>
              </div>

              <button
                style={s.active ? styles.closeBtn : styles.openBtn}
                onClick={() => toggleService(s.service_id)}
              >
                {s.active ? "Close" : "Open"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/*queue and manage card codes*/}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Need to manage a service or queue?</h2>

        <div style={styles.btnRow}>
          <button style={styles.statusBtn} onClick={goToQueue}>
            Go to Queue Management →
          </button>

          <button style={styles.serviceBtn} onClick={goToServices}>
            Go to Service Management →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
    page:{
        width: "100%",
        maxWidth: 980,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
    },

    header:{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
    },

    title:{
        margin: 0,
        fontSize: 28
    },

    card:{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        textAlign: "left",
        marginBottom: 16,
    },

    cardTitle:{
        margin: "0",
        fontSize: 20,
        fontWeight: 700
    },

    //service list cards text
    list:{
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    serviceRow:{
      border: "1px solid #b7b9bb",
      borderRadius: 14,
      padding: 16,
      background: "#fafafa",
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
    },

    serviceName:{
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 4,
    },

    //small text coding
    infoText: {
      fontSize: 13,
      color: "#6b7280",
      marginBottom: 8,
    },

    descText: {
      fontSize: 14,
      color: "#374151",
    },

    //open and close button and text coding
    openText:{
      color: "#065f46",
      fontWeight: 700
    },
    closedText:{
      color: "#991b1b",
      fontWeight: 700
    },

    openBtn:{
      minWidth: 100,
      padding: "10px 12px",
      background: "#117a37",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },

    closeBtn:{
      minWidth: 100,
      padding: "10px 12px",
      background: "#ac1d1d",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },
    //other page buttons code
    btnRow:{
      display: "flex",
      gap: 10,
      marginTop: 12,
      flexWrap: "wrap",
    },

    statusBtn:{
      padding: "10px 12px",
      background: "#33339c",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },

    serviceBtn:{
      padding: "10px 12px",
      background: "#61339c",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },
};
