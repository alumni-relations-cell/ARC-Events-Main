import axios from "axios";

export const apiUser = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiUser.interceptors.request.use((config) => {
  const raw = localStorage.getItem("app_auth");
  const token = raw ? JSON.parse(raw)?.token : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Add event lock token if present
  try {
    const lockData = sessionStorage.getItem("event_lock_data");
    if (lockData) {
      const lock = JSON.parse(lockData);
      if (lock.token) {
        config.headers["X-Event-Lock-Token"] = lock.token;
      }
    }
  } catch (err) {
    console.error("Failed to add lock token:", err);
  }

  return config;
});

apiUser.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      // Prevent infinite loops
      if (!window.__authAlertShown) {
        window.__authAlertShown = true;
        alert("Your session has expired. Please log in again.");
      }

      localStorage.removeItem("app_auth");

      if (location.pathname !== "/login") {
        location.replace("/login");
      }
    }

    return Promise.reject(err);
  }
);
