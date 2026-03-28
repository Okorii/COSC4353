import { useEffect, useMemo, useState } from "react";

export default function JoinQueue({goToStatus}){
    const [services, setServices] = useState([]);
    const [queue, setQueue] = useState([]);
    const [queueId, setQueueId] = useState("");
    const [petName, setPetName] = useState("");
    const [email, setEmail] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [message, setMessage] = useState("");

    const selected = useMemo(
        () => services.find((s) => String(s.id) === String(serviceId)),
        [services, serviceId]
    );

    const queueForService = useMemo(
        () => queue.filter((q) => String(q.serviceId) === String(serviceId)),
        [queue, serviceId]
    );

    useEffect(() => {
    fetch("http://localhost:3001/api/services")
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Services request failed: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            console.log("services:", data);
            setServices(data);

            if (data.length > 0) {
                setServiceId(String(data[0].id));
            }
        })
        .catch((err) => {
            console.error("Error loading services:", err);
            setMessage("Could not load services from backend.");
        });
    }, []);

    useEffect(() => {
    fetch("http://localhost:3001/api/services")
        .then((res) => res.json())
        .then((data) => setServices(data))
        .catch((err) => console.error("Error loading services:", err));
    }, []);

    useEffect(() => {
    fetch("http://localhost:3001/api/queue-management")
        .then((res) => res.json())
        .then((data) => setQueue(data))
        .catch((err) => console.error("Error loading queue:", err));
}, []);

const estWaitMinutes = selected ? queueForService.length * Number(selected.durationMinutes) : 0;

//need to make it ensure theres no invalid values in the email section? such as !#$%^
function validate(){
    if(!email.trim())
        return "Email is required.";
    if(email.trim().length > 100)
        return "Email must be 100 characters or less.";
    if (!email.trim().includes("@") || !email.trim().includes("."))
        return "Enter a valid email address.";
    if(!serviceId)
        return "Please select a service.";
    if(!petName.trim())
        return "Pet name is required.";
    if(petName.trim().length > 30)
        return "Pet name must be 30 characters or less.";

    return "";
}

function joining() {
  setMessage("");
  const err = validate();
  if (err) return setMessage(err);

  if (!selected?.active) {
    return setMessage("This service is currently closed.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPet = petName.trim().toLowerCase();

  if (
    queue.some(
      (q) =>
        q.ownerName?.toLowerCase() === normalizedEmail &&
        q.petName?.toLowerCase() === normalizedPet
    )
  ) {
    return setMessage("That pet is already in a queue with this email.");
  }

  fetch("http://localhost:3001/api/queue-management/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      petName: petName.trim(),
      ownerName: email.trim(),
      serviceId: Number(serviceId),
    }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.errors?.join(", ") || "Unable to join queue.");
      }
      return data;
    })
    .then((data) => {
      setQueue((prev) => [...prev, data]);
      setQueueId(data.id);
      setMessage(`Joined ${selected.name}. Estimated wait: ${estWaitMinutes} minutes.`);
    })
    .catch((err) => {
      setMessage(err.message);
    });
}

function leaving() {
  setMessage("");

  if (!queueId) {
    return setMessage("No joined queue entry found for this session.");
  }

  fetch(`http://localhost:3001/api/queue-management/${queueId}`, {
    method: "DELETE",
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to leave queue.");
      }
      return data;
    })
    .then(() => {
      setQueue((prev) => prev.filter((q) => q.id !== queueId));
      setQueueId("");
      setMessage("Left the queue.");
    })
    .catch((err) => {
      setMessage(err.message);
    });
}

return (
    /*code for top of card txt*/
    <div style={styles.page}>
        <header style={styles.header}>
            <div>
                <h1 style={styles.title}>Join Queue</h1>
                <p style={styles.subtitle}>Join or leave a service queue.</p>
            </div>
        </header>

    <div style={styles.grid}>
        {/*code for joinqueue card */}
        <div style={styles.card}>
            <label style={styles.label}>Email*</label>
            <input
                style={styles.input}
                type="email"
                value={email}
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
                {services.length === 0 ? (
                    <option value="">Loading services...</option>
                ) : (
                services.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.name} {s.active ? "" : "(Closed)"}
                </option>
                ))
            )}
            </select>

            <div style={styles.infoRow}>
                <span><b>Estimated wait:</b></span>
                <span>{estWaitMinutes} min</span>
            </div>

            {message ? <div style={styles.messageBox}>{message}</div> : null}

            <div style={styles.btnRow}>
                <button
                style={styles.joinBtn}
                onClick={joining}
                disabled={!selected || !selected.active}
                >
                Join Queue
                </button>
                <button style={styles.leaveBtn} onClick={leaving}>
                Leave Queue
                </button>
            </div>
            </div>

            {/*code for queueStatus card */}
            <div style={styles.card}>
            <h2 style={styles.cardTitle}>Already joined a queue?</h2>
            <p style={styles.smallText}>
                Track your pet’s place in line and estimated wait time in the Queue Status page.
            </p>

            <button 
                style={styles.statusBtn}
                onClick={goToStatus}
            >
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