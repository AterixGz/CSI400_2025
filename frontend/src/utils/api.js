const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || window.__API_BASE__ || "http://localhost:3000";

function _parseJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = _parseJwtPayload(token);
  if (!payload) return true;
  // exp is in seconds since epoch
  if (!payload.exp) return false; // if no exp claim, assume not expired
  return payload.exp * 1000 < Date.now();
}

export async function verifyTokenWithServer(token) {
  if (!token) return false;
  const endpoints = ["/verify-token", "/auth/verify", "/verify"];
  for (const ep of endpoints) {
    try {
      const res = await fetch(BASE + ep, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token }),
      });
      if (res.status === 200) return true;
      if (res.status === 401) return false;
      // try next endpoint on other statuses
    } catch {
      // network error -> continue trying
    }
  }
  // if server verification endpoints not available, fall back to client-side check
  return !isTokenExpired(token);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // custom event so components can listen
  window.dispatchEvent(new Event("authChange"));
}

export function setupAuthWatcher({ intervalSec = 60 } = {}) {
  // check immediately and then set interval
  async function check() {
    const token = getToken();
    if (!token) return; // nothing to do
    // first do client-side expiry check
    if (isTokenExpired(token)) {
      logout();
      return;
    }
    // then attempt server verify (if available)
    try {
      const ok = await verifyTokenWithServer(token);
      if (!ok) logout();
    } catch {
      // ignore: we'll re-check later
    }
  }

  // run once now
  check();
  const id = setInterval(check, intervalSec * 1000);
  // also check on visibility change
  const onVis = () => {
    if (!document.hidden) check();
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", onVis);
  };
}

export default {
  getToken,
  getUser,
  isTokenExpired,
  verifyTokenWithServer,
  logout,
  setupAuthWatcher,
};
