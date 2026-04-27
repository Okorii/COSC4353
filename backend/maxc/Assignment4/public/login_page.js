document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.error || "Login failed";
        return;
      }

      // Save logged-in user info
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("user_name", data.user.name || "");
      localStorage.setItem("user_email", data.user.email || "");
      localStorage.setItem("user_role", data.user.role || "user");

      message.textContent = "Login successful";

      // Redirect to dashboard
      window.location.href = "/user_dashboard.html";
    } catch (error) {
      console.error("Login request failed:", error);
      message.textContent = "Server error";
    }
  });
});