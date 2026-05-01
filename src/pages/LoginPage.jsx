import { useState } from "react";
import "./Assignment4Auth.css";
import { apiUrl } from "../lib/api.js";

export default function LoginPage({ goToRegister, goToDashboard }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Login failed");
        setMessageType("error");
        return;
      }

      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("user_name", data.user.name || "");
      localStorage.setItem("user_email", data.user.email || "");
      localStorage.setItem("user_role", data.user.role || "user");

      setMessage("Login successful");
      setMessageType("success");
      goToDashboard();
    } catch (error) {
      console.error("Login request failed:", error);
      setMessage("Server error");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-shell">
      <div className="assignment-hero assignment-hero-centered"></div>

      <div className="assignment-stack">
        <div className="login-card">
          <h1 className="login-title"> Welcome to PetCare</h1>

          <p className="login-subtitle">Sign in to access your PetCare account</p>

          <form className="assignment-form" onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label>Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="button" className="assignment-inline-link" onClick={goToRegister}>
              Create an account
            </button>

            <button className="assignment-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <p className={`assignment-message ${messageType}`}>{message}</p>
        </div>
      </div>
    </section>
  );
}
