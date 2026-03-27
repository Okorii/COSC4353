async function loadDashboard() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Not logged in!");
    window.location.href = "login_page.html";
    return;
  }

  try {
    const [meResponse, notificationsResponse, historyResponse] = await Promise.all([
      fetch("/api/users/me", {
        headers: { "x-user-id": userId }
      }),
      fetch("/api/users/me/notifications", {
        headers: { "x-user-id": userId }
      }),
      fetch("/api/users/me/history", {
        headers: { "x-user-id": userId }
      })
    ]);

    const meData = await meResponse.json();
    const notificationsData = await notificationsResponse.json();
    const historyData = await historyResponse.json();

    if (!meResponse.ok) {
      alert(meData.error || "Failed to load dashboard");
      return;
    }

    document.querySelector("h1").textContent = "Welcome, " + meData.name;

    document.getElementById("position").textContent = meData.queueStatus.position;
    document.getElementById("peopleAhead").textContent = meData.queueStatus.peopleAhead;
    document.getElementById("waitTime").textContent = meData.queueStatus.waitTime;
    document.getElementById("serviceType").textContent = meData.queueStatus.serviceType;

    const notificationList = document.getElementById("notificationList");
    notificationList.innerHTML = "";

    if (notificationsData.notifications && notificationsData.notifications.length > 0) {
      notificationsData.notifications.forEach((note) => {
        const div = document.createElement("div");
        div.className = "text";
        div.innerHTML = `<p class="message">${note}</p>`;
        notificationList.appendChild(div);
      });
    } else {
      notificationList.innerHTML = "<p>No notifications yet.</p>";
    }

    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    if (historyData.history && historyData.history.length > 0) {
      historyData.history.forEach((item) => {
        const div = document.createElement("div");
        div.className = "text";
        div.innerHTML = `<p class="message">${item.action}</p><p class="time">${item.date}</p>`;
        historyList.appendChild(div);
      });
    } else {
      historyList.innerHTML = "<p>No history yet.</p>";
    }

  } catch (error) {
    console.error(error);
    alert("Server error");
  }
}

loadDashboard();

document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.clear();
  window.location.href = "login_page.html";
});