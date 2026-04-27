document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("You are not logged in.");
    window.location.href = "/login_page.html";
    return;
  }

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      window.location.href = "/login_page.html";
    });
  }

  try {
    const meResponse = await fetch("/api/users/me", {
      headers: {
        "x-user-id": userId,
      },
    });

    const meData = await meResponse.json();

    if (!meResponse.ok) {
      throw new Error(meData.error || "Failed to load profile");
    }

    const nameElement = document.getElementById("userName");
    const emailElement = document.getElementById("userEmail");

    if (nameElement) nameElement.textContent = meData.name || "No name found";
    if (emailElement) emailElement.textContent = meData.email || "No email found";

    const historyResponse = await fetch("/api/users/me/history", {
      headers: {
        "x-user-id": userId,
      },
    });

    const historyData = await historyResponse.json();

    if (!historyResponse.ok) {
      throw new Error(historyData.error || "Failed to load history");
    }

    const historyList = document.getElementById("historyList");
    if (historyList) {
      historyList.innerHTML = "";

      if (!historyData.history || historyData.history.length === 0) {
        historyList.innerHTML = "<li>No history found</li>";
      } else {
        historyData.history.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.message || JSON.stringify(item);
          historyList.appendChild(li);
        });
      }
    }

    const notificationsResponse = await fetch("/api/users/me/notifications", {
      headers: {
        "x-user-id": userId,
      },
    });

    const notificationsData = await notificationsResponse.json();

    if (!notificationsResponse.ok) {
      throw new Error(notificationsData.error || "Failed to load notifications");
    }

    const notificationsList = document.getElementById("notificationsList");
    if (notificationsList) {
      notificationsList.innerHTML = "";

      if (!notificationsData.notifications || notificationsData.notifications.length === 0) {
        notificationsList.innerHTML = "<li>No notifications found</li>";
      } else {
        notificationsData.notifications.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.message || JSON.stringify(item);
          notificationsList.appendChild(li);
        });
      }
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    alert(error.message);
  }
});