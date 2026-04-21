import { useState } from "react";
import "./Assignment4Auth.css";
import { apiUrl } from "../lib/api.js";

export default function RegistrationPage({ goToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    if (trimmedPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          phone: trimmedPhone,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Registration failed.");
        setMessageType("error");
        return;
      }

      setMessage("Account created successfully!");
      setMessageType("success");
      setTimeout(() => {
        goToLogin();
      }, 1200);
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage("Could not connect to backend on localhost:3001.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="assignment-shell">
      <div className="assignment-stack">
        <div className="assignment-card">
          <h2>Create Your Account</h2>

          <form className="assignment-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />

            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label htmlFor="register-phone">Phone Number</label>
            <input
              id="register-phone"
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <button className="assignment-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "REGISTERING..." : "Register"}
            </button>
          </form>

          <p className={`assignment-message ${messageType}`}>{message}</p>

          <p>
            Already have an account?{" "}
            <button type="button" className="assignment-inline-link" onClick={goToLogin}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
