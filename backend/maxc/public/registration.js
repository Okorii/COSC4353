const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!firstName || !lastName || !email || !password) {
    message.textContent = "Please fill in all fields.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password must be at least 6 characters.";
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
        role: "user"
      })
    });

    const data = await response.json();

    if (response.ok) {
      message.textContent = "Account created successfully!";
      setTimeout(() => {
        window.location.href = "login_page.html";
      }, 1500);
    } else {
      message.textContent = data.error || "Registration failed.";
    }
  } catch (error) {
    console.error(error);
    message.textContent = "Could not connect to server.";
  }
});