import { useEffect, useMemo, useState } from "react";

// services
const services = [
  { id: "all", name: "Services", minutes: 0 },
  { id: 1, name: "Nail trimming", minutes: 10 },
  { id: 2, name: "Haircut", minutes: 30 },
  { id: 3, name: "Full Groom (Bath + Haircut + Nails)", minutes: 60 },
  { id: 4, name: "Bath + Dry", minutes: 35 },
];

function Dateformat(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

//consistent 2 digits
function Format2digits(n) {
  return String(n).padStart(2, "0");
}

//calculates start and end
function Calculatetime(Starttime, duration) {
  const [hh, mm] = Starttime.split(":").map(Number);
  const total = hh * 60 + mm + duration;
  return `${Format2digits(Math.floor(total / 60))}:${Format2digits(total % 60)}`;
}

//time 12hr format. not military
function to12Hour(time24hr) {
  const [hh, mm] = time24hr.split(":").map(Number);
  const ampm = hh >= 12 ? "pm" : "am";
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${Format2digits(mm)} ${ampm}`;
}



//REACT
export default function QueueManagement() {
  //select groomer
  //const [selectedGroomerId, setSelectedGroomerId] = useState("all");
  //select specific appointment service
  const [selectedServiceId, setSelectedServiceId] = useState("all");
  //select date
  const [selectdate, setdate] = useState(new Date());
  //manage appointments
  const [appointments, setappointment] = useState([]);
  //notifications
  const [message, setmessage] = useState("");

  //loads queue data from backend API
  const loadQueue = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/queue-management");
      const data = await res.json();
      //map backend to frontend UI structure
      const mapped = data.map((item) => ({
        id: item.id,
        pet: item.petName,
        owner: item.ownerName,
    
        serviceId:item.serviceId,

        start: new Date(item.joinedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        priority: item.priority,
        //groomerId: "g1",
      }));
      //update with mapped queue data
      setappointment(mapped);
    } catch {
      setmessage("Failed to load queue data.");
    }
  };
  //making sure queue data is actually loaded
  useEffect(() => {
    loadQueue();
  }, []);


  // find service by id
  const serviceById = useMemo(() => {
  const map = new Map();
  services.forEach((s) => map.set(s.id, s));
  return map;
}, []);

const allappointments = useMemo(() => {
  let list = appointments;

  
  if (selectedServiceId !== "all") {
  list = list.filter((a) => a.serviceId === Number(selectedServiceId));
}

  // order by time
  return [...list].sort((x, y) => x.start.localeCompare(y.start));
}, [appointments, selectedServiceId]);



//appointments in queue
const queueLength = allappointments.length;

    //can move appointments up/down
    const move = (index, direction) => {
    //new position
    const newIndex = index + direction;
    //checking if out of bounds
    if (newIndex < 0 || newIndex >= allappointments.length) return;

    //getting id
    const ids = allappointments.map((a) => a.id);
    const movingId = ids[index];
    const swapId = ids[newIndex];

    const copy = [...appointments];
    const i1 = copy.findIndex((a) => a.id === movingId);
    const i2 = copy.findIndex((a) => a.id === swapId);
    [copy[i1], copy[i2]] = [copy[i2], copy[i1]];
    setappointment(copy);
    //message stating what was done
    setmessage(`Moved ${allappointments[index].pet} ${direction === -1 ? "up":"down"} in the queue.`);
  };

  //removes from queue using backend api
  const removepet = async (index) => {
    //get appt based on the index
  const removed = allappointments[index];

  try {
    //send request to backend with pet id
    const res = await fetch(`http://localhost:3001/api/queue-management/${removed.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      setmessage(data.error || "Could not remove.");
      return;
    }

    setmessage(data.message);
    loadQueue(); // refresh
  } catch {
    setmessage("Server error.");
  }
};

  //remove next pet in queue
  const serveNext = async () => {
  try {
    //post request to backend to serve next pet
    const res = await fetch("http://localhost:3001/api/queue-management/serve-next", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setmessage(data.error || "No appointments");
      return;
    }

    setmessage(data.message);
    loadQueue(); // refresh
  } catch {
    setmessage("Server error.");
  }
};

  //go back a date
  const prevDay = () => {
    const d = new Date(selectdate);
    d.setDate(d.getDate() - 1);
    setdate(d);
    setmessage("");
  };

  //go fwd a date
  const nextDay = () => {
    const d = new Date(selectdate);
    d.setDate(d.getDate() + 1);
    setdate(d);
    setmessage("");
  };
 
    const notifyReady = async (appt) => {
  try {
    const res = await fetch(
      `http://localhost:3001/api/queue-management/${appt.id}/ready`,
      { method: "PUT" }
    );

    const data = await res.json();

    if (!res.ok) {
      setmessage(data.error || "Failed to mark ready.");
      return;
    }

    setmessage(data.message);
    loadQueue();
  } catch {
    setmessage("Server error.");
  }
};

//custom message incase of emergencies or etc.
  const customMessage = (appt) => {
    // example
     const text = prompt(`${appt.owner} about ${appt.pet}:`, "Please bring updated vaccine chart");
  if (!text) return; // cancel
  if (text.trim().length === 0) return setmessage("Empty message");
  //what is actually on customers screen
  setmessage(`Dog Groomer sent message to ${appt.owner}: "${text.trim()}"`);
};

//priority color
const prioritycolor = (priority) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid rgba(0, 0, 0, 0.15)",
    background:
      priority === "high" ? "rgba(255, 39, 1, 0.79)" : priority === "medium" ? "rgba(255, 217, 0, 0.55)" : "rgba(102, 199, 121, 0.44)",
  });

  return (
    <div style={{ //background
        minHeight: "100vh", 
        width: "100vw", 
        background: "#24243a", 
        color: "#ffffff", 
        fontFamily: "system-ui, Arial", 
        padding: 20 ,
        boxSizing: "border-box",
        }}>

      <div style={{ 
        maxWidth: 1400, 
        width: "100%", 
        margin: "0 auto" }}> 

        {/*Header*/}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          padding: "18px 20px",
          borderRadius: 14,
          background: "#8f8f8f",
          color:"#000000",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        }}>
            {/*title info*/}
          <div>
            <div style={{ fontSize: 16, opacity: 0.85, letterSpacing: 0.6 }}>Appointments</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <button onClick={prevDay} style={arrowbuttons}>←</button>
              <div style={{ fontWeight: 700 }}>{Dateformat(selectdate)}</div>
              <button onClick={nextDay} style={arrowbuttons}>→</button>
            </div>
          </div>
          
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

      {/*service dropdown*/}
        <select
        value={selectedServiceId}
        onChange={(e) => { setSelectedServiceId(e.target.value); setmessage(""); }}
        style={selectgroomer}  
        >
        {services.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
        </select>
    <button onClick={serveNext} style={Servenextbutton}>Serve Next</button>
        </div>
        </div>
        {/*shows the message box*/}
        {message && (
          <div style={{
            padding: 12, marginBottom: 12,
            borderRadius: 12,
            background: "#ffd6d6",
            color:"#7a0000",
            fontWeight: 700,
          }}>
            {message}
          </div>
        )}

        {/*table styling*/}
        <div style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "2px solid #ffffff",
          background: "#8f8f8f",
          color: "#000000",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}>
          <div style={{ padding: "12px 16px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" }}>

            <div style={{ fontWeight: 700 }}>Queue Management</div>
            <div style={{ opacity: 0.85 }}><strong>Queue Length:</strong> {queueLength}</div>
          </div>
            
        
          <div style={{ borderTop: "2px solid #ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, letterSpacing: 0.7, opacity: 0.8 }}>
                  <th style={th}>PET</th>
                  <th style={th}>OWNER</th>
                  <th style={th}>START</th>
                  <th style={th}>APPROX END</th>
                  <th style={th}>SERVICE</th>
                  <th style={th}>PRIORITY</th>
                  <th style={th}>ACTIONS</th>
                </tr>
              </thead>

              {/*checks if there are no appointments*/}
              <tbody>
                {allappointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, opacity: 0.8 }}> No appointments.
                    </td>
                  </tr>
                ) : (
                  allappointments.map((a, idx) => {
                    const svc = serviceById.get(a.serviceId);
                    const end24 = Calculatetime(a.start, svc?.minutes ?? 30);
                    return (
                      <tr key={a.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={td}><strong>{a.pet}</strong></td>
                        <td style={td}>{a.owner}</td>
                        <td style={td}>{to12Hour(a.start)}</td>
                        <td style={td}>{to12Hour(end24)}</td>
                        <td style={td}>{svc?.name ?? "Service"}</td>
                        <td style={td}>
                          <span style={prioritycolor(a.priority || "low")}>
                            {a.priority || "low"}
                          </span>
                        </td>

                        <td style={td}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap" }}>
                                <button style={upanddownbutton} onClick={() => move(idx, -1)} disabled={idx === 0}>Up</button>
                                <button style={upanddownbutton} onClick={() => move(idx, 1)} disabled={idx === allappointments.length - 1}>Down</button>
                                <button style={messagebutton} onClick={() => customMessage(a)}>Message</button>
                                <button style={readybutton} onClick={() => notifyReady(a)}>Ready</button>
                                <button style={removebutton} onClick={() => removepet(idx)}>Remove</button>
                            </div>
                        </td>
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

//for dropdown
const selectgroomer = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "2px solid #ffffff",
  background: "#ffffff",
  color: "#000000",
  fontWeight: 600,
};

//base
const basebuttonformat = {
  height: 32,
  minWidth: 34,
  padding: "0 10px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  lineHeight: "32px",
  cursor: "pointer",
  boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
};

//left and right arrows
const arrowbuttons = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.25)",
  background: "#ffffff",
  color: "#000000",
  cursor: "pointer",
  fontWeight: 800,
};

//serve next button
const Servenextbutton = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#2fa043",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
};

//up and down buttons
const upanddownbutton = {
  ...basebuttonformat,
  border: "none",
  background: "#3f3f46", 
  color: "#ffffff",
};

//ready button
const readybutton = {
   ...basebuttonformat,
  border: "none",
  background: "#36b13c", 
  color: "#ffffff",
};

//message button
const messagebutton = { 
    ...basebuttonformat, 
    border: "none", 
    background: "#3f3f46", 
    color: "#ffffff", };


//remove button
const removebutton = {
  ...basebuttonformat,
  border: "none",
  background: "#ef4444", // red
  color: "#ffffff",
};
