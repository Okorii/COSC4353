import { useEffect, useMemo, useState } from "react";

export default function JoinQueue({ goToStatus }) {
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [petName, setPetName] = useState("");
  const [ownerName, setEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          setServiceId(String(data[0].serviceId));
        }
      })
      .catch((err) => console.error("Error loading services:", err));

    fetch("http://localhost:3001/api/queue-management")
      .then((res) => res.json())
      .then((data) => setQueue(data))
      .catch((err) => console.error("Error loading queue:", err));
  }, []);

  const selected = useMemo(
    () => services.find((s) => String(s.service_id) === String(serviceId)),
    [services, serviceId]
  );

  const queueForService = useMemo(
    () => queue.filter((q) => String(q.service_id) === String(serviceId)),
    [queue, serviceId]
  );

  const estWaitMinutes = selected
    ? queueForService.length * Number(selected.expected_duration)
    : 0;

  function validate() {
    if (!ownerName.trim()) return "Email is required.";
    if (ownerName.trim().length > 100) return "Email must be 100 characters or less.";
    if (!ownerName.includes("@")) return "Enter a valid email address.";
    if (!petName.trim()) return "Pet name is required.";
    if (petName.trim().length > 30) return "Pet name must be 30 characters or less.";
    if (!serviceId) return "Please select a service.";
    return "";
  }

  function joining() {
    setMessage("");
    const err = validate();
    if (err) return setMessage(err);

    fetch("http://localhost:3001/api/queue-management/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        petName: petName,
        ownerName: ownerName,
        serviceId: Number(serviceId),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
          return;
        }

        setMessage(
          `Joined ${selected?.service_name}. Estimated wait: ${estWaitMinutes} minutes.`
        );

        return fetch("http://localhost:3001/api/queue-management")
          .then((res) => res.json())
          .then((updatedQueue) => setQueue(updatedQueue));
      })
      .catch((err) => {
        console.error("Error joining queue:", err);
        setMessage("Failed to join queue.");
      });
  }

  function leaving() {
    setMessage("");

    if (!ownerName.trim()) return setMessage("Enter your email first.");
    if (!petName.trim()) return setMessage("Enter your pet name first.");

    fetch("http://localhost:3001/api/queue-management/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        petName: petName,
        ownerName: ownerName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
          return;
        }

        setMessage("Left the queue.");

        return fetch("http://localhost:3001/api/queue-management")
          .then((res) => res.json())
          .then((updatedQueue) => setQueue(updatedQueue));
      })
      .catch((err) => {
        console.error("Error leaving queue:", err);
        setMessage("Failed to leave queue.");
      });
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Join Queue</h1>
          <p style={styles.subtitle}>Join or leave a service queue.</p>
        </div>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <label style={styles.label}>Email*</label>
          <input
            style={styles.input}
            type="email"
            value={ownerName}
            maxLength={100}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />

          <label style={styles.label}>Pet Name*</label>
          <input
            style={styles.input}
            type="text"
            value={petName}
            maxLength={30}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="First name as it appears on file (ex: Luna)"
          />

          <label style={styles.label}>Service*</label>
          <select
            style={styles.input}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.service_name}
              </option>
            ))}
          </select>

          <div style={styles.infoRow}>
            <span><b>Estimated wait:</b></span>
            <span>{estWaitMinutes} min</span>
          </div>

          {message ? <div style={styles.messageBox}>{message}</div> : null}

          <div style={styles.btnRow}>
            <button style={styles.joinBtn} onClick={joining}>
              Join Queue
            </button>

            <button style={styles.leaveBtn} onClick={leaving}>
              Leave Queue
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Already joined a queue?</h2>
          <p style={styles.cardText}>
            Track your pet’s place in line and estimated wait time in the Queue Status page.
          </p>

          <button style={styles.statusBtn} onClick={goToStatus}>
            Go to Queue Status →
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

    subtitle:{
        margin: "6px 0 0",
        color: "#4b5563"
    },

    grid:{
        display: "block",
        gap: 16,
        marginTop: 16,
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
    },

    label:{
        display: "block",
        marginTop: 12,
        fontWeight: 650,
        fontSize: 13,
        color: "#374151"
    },

    input:{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "rgba(255,255,255,0.9)",
        marginTop: 6,
        boxSizing: "border-box",
        fontSize: 14
    },

    infoRow:{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 12,
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(0,0,0,0.06)",
    },

    smallText:{
        marginTop: 5,
        fontSize: 13,
    },

    messageBox:{
        marginTop: 12,
        padding: 10,
        borderRadius: 10,
        background: "rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.08)",
    },

    //buttons formatting
    btnRow:{
        display: "flex",
        gap: 10,
        marginTop: 12,
        flexWrap: "wrap"
    },

    joinBtn:{
        padding: "10px 12px",
        background: "#0e7c41",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 700,
    },

    leaveBtn:{
        padding: "10px 12px",
        background: "#b73636",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 700,
    },

    statusBtn:{
        padding: "10px 12px",
        background: "#33339c",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 700,
    },
}