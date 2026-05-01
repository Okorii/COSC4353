function getCurrentUserEmail() {
  return localStorage.getItem("user_email") || "";
}

function getQueueKey(email, field) {
  return `queue:${email}:${field}`;
}

export function getStoredQueueOwnerEmail() {
  return getCurrentUserEmail();
}

export function getStoredQueueEntryId() {
  const email = getCurrentUserEmail();

  if (!email) {
    return "";
  }

  return localStorage.getItem(getQueueKey(email, "entryId")) || "";
}

export function setStoredQueueState({ ownerEmail, entryId }) {
  if (!ownerEmail) {
    return;
  }

  localStorage.setItem(getQueueKey(ownerEmail, "ownerName"), ownerEmail);
  localStorage.setItem(getQueueKey(ownerEmail, "entryId"), String(entryId));
}

export function clearStoredQueueState(ownerEmail = getCurrentUserEmail()) {
  if (!ownerEmail) {
    return;
  }

  localStorage.removeItem(getQueueKey(ownerEmail, "ownerName"));
  localStorage.removeItem(getQueueKey(ownerEmail, "entryId"));
}

export function clearLegacyQueueState() {
  localStorage.removeItem("queueEntryId");
  localStorage.removeItem("ownerName");
}
