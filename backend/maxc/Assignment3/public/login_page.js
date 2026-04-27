const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.textContent = "Please enter both email and password.";
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      message.textContent = "Login successful!";
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);

      setTimeout(() => {
        window.location.href = "user_dashboard.html";
      }, 1000);
    } else {
      message.textContent = data.error || "Login failed.";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    message.textContent = "Could not connect to the server.";
  }
});
