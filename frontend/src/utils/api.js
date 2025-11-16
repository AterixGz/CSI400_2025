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
  // Fall back to client-side check only (no server endpoint available)
  return !isTokenExpired(token);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // custom event so components can listen
  window.dispatchEvent(new Event("authChange"));
}

export function setupAuthWatcher({ intervalSec = 5 } = {}) {
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

// --- fetch API helpers ---
export async function get(url, config = {}) {
  const res = await fetch(BASE + url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    },
  });
  const json = await res.json();
  return { data: json, status: res.status };
}

export async function post(url, data, config = {}) {
  const res = await fetch(BASE + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { data: json, status: res.status };
}

export async function patch(url, data, config = {}) {
  const res = await fetch(BASE + url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { data: json, status: res.status };
}

export async function del(url, config = {}) {
  const res = await fetch(BASE + url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    },
  });
  const json = await res.json();
  return { data: json, status: res.status };
}

export default {
  getToken,
  getUser,
  isTokenExpired,
  verifyTokenWithServer,
  logout,
  setupAuthWatcher,
  get,
  post,
  patch,
  del,
};
