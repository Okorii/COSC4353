//NOTE: THIS IS NOT COMPLETE. Need to add back end. 
import {useMemo,useState} from "react";

// employee examples
const groomers = [
  { id: "all", name: "Groomers" },
  { id: "g1", name: "Lilly Rose" },
  { id: "g2", name: "Julian Rangel" },
  { id: "g3", name: "Ariana Nazario" },
];

// services
const services = [
  { id: "quick", name: "Quick Wash", minutes: 20 },
  { id: "full", name: "Full Groom", minutes: 60 },
  { id: "nails", name: "Nail Trim", minutes: 10 },
  { id: "haircut", name: "Haircut", minutes: 30 },
  { id: "bathplusdry", name: "Package", minutes: 35 }
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

// just for assignment 1. fake data. will add functionality later.
const initialAppointments = [
  { id: "a1", pet: "Kochi", owner: "Billy Jones", groomerId: "g1", serviceId: "nails", start: "09:30", priority: "low" },
  { id: "a2", pet: "Cake", owner: "Estefania Gonzalez", groomerId: "g2", serviceId: "nails", start: "11:30", priority: "low" },
  { id: "a3", pet: "Sam", owner: "Maria Jones", groomerId: "g3", serviceId: "bathplusdry", start: "14:00", priority: "medium" },
  { id: "a4", pet: "Chucho", owner: "Manuel Avila", groomerId: "g1", serviceId: "full", start: "15:00", priority: "high" },
  { id: "a5", pet: "Hime", owner: "Lupe Garcia", groomerId: "g2", serviceId: "full", start: "15:30", priority: "high" },
];

//REACT
export default function QueueManagement() {
  //select groomer
  const [selectedGroomerId, setSelectedGroomerId] = useState("all");
  //select date
  const [selectdate, setdate] = useState(new Date());
  //manage appointments
  const [appointments, setappointment] = useState(initialAppointments);
  //notifications
  const [message, setmessage] = useState("");

  // find service by id
  const serviceById = useMemo(() => {
  const map = new Map();
  services.forEach((s) => map.set(s.id, s));
  return map;
}, []);


// which appointments to select based on which groomer selected
const allappointments = useMemo(() => {
   let list;

  if (selectedGroomerId === "all") {
    // all appointments
    list = appointments;
  } else {
    // filter by specific groomer
    list = appointments.filter(function(a) {
      return a.groomerId === selectedGroomerId;
    });
  }
//return by start time
return [...list].sort((x, y) => x.start.localeCompare(y.start));
}, [appointments, selectedGroomerId]);

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

  //removes from queue
  const removepet = (index) => {
    const removed = allappointments[index];
    setappointment((prev) => prev.filter((a) => a.id !== removed.id));
    setmessage(`Removed ${removed.pet} (${removed.owner}).`);
  };

  //removes first pet in queue bc they are actively being serviced now
  const serveNext = () => {
    if (allappointments.length === 0) return setmessage("No appointments");
    const next = allappointments[0];
    setappointment((prev) => prev.filter((a) => a.id !== next.id));
    setmessage(`Served (${next.pet}) belonging to (${next.owner}).`);
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

    // DOES NOT HAVE FUNCTIONALITY YET. NEED TO ADD. 
    const notifyReady = (appt) => {
    // example
    setmessage(`Auto-notification ${appt.owner}: "${appt.pet} is ready to be seen."`);
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
        width: "100%", 
        background: "#c4e7e5", 
        color: "#000000", 
        fontFamily: "system-ui, Arial", 
        padding: 20 
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
          marginBottom: 14,
          padding: "14px 16px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.05)",
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
            {/*date*/}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select
              value={selectedGroomerId}
              onChange={(e) => { setSelectedGroomerId(e.target.value); setmessage(""); }}
              style={selectgroomer}
            >
              {groomers.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
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
            background: "rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            {message}
          </div>
        )}

        {/*table styling*/}
        <div style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "3px solid #000",
          background: "rgba(49, 97, 123, 0.14)",
        }}>
          <div style={{ padding: "12px 16px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" }}>

            <div style={{ fontWeight: 700 }}>Queue Management</div>
            <div style={{ opacity: 0.85 }}><strong>Queue Length:</strong> {queueLength}</div>
          </div>
            
        
          <div style={{ borderTop: "3px solid rgb(0, 0, 0)" }}>
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
                        <td style={td}><span style={prioritycolor(a.priority)}>{a.priority}</span></td>

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

const th = { padding: "10px 16px" };
const td = { padding: "12px 16px", verticalAlign: "middle" };

//for dropdown
const selectgroomer = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "#eee",
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
  border: "1px solid rgba(22, 9, 9, 0.15)",
  background: "rgba(0,0,0,0.20)",
  color: "#eee",
  cursor: "pointer",
};

//serve next button
const Servenextbutton = {
  padding: "9px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0, 0, 0, 0.12)",
  background: "rgba(83, 180, 88, 0.81)",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 700,
};

//up and down buttons
const upanddownbutton = {
  ...basebuttonformat,
  border: "1px solid rgba(0,0,0,0.18)",
  background: "#403e3ea1", 
  color: "#fff",
};

//ready button
const readybutton = {
   ...basebuttonformat,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#36b13cd6", 
  color: "#fff",
};

//message button
const messagebutton = { 
    ...basebuttonformat, 
    border: "1px solid rgba(0,0,0,0.18)", 
    background: "#403e3ea1", 
    color: "#fff", };


//remove button
const removebutton = {
  ...basebuttonformat,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#ef4444", // red
  color: "#fff",
};
