import axios from "axios";
import { notificationBus } from "./notificationBus";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        Accept: "application/json",
    },
});

// Add token automatically if exists
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    notificationBus.loading("Wird geladen …");

    return config;
});

  /* =========================
   Response interceptor
   ========================= */
api.interceptors.response.use(
    response => {
        notificationBus.clear();
        // Success message from backend (optional)
        if (response.data?.message) {
            notificationBus.success(response.data.message);
        }
        return response;
    },
    error => {
        notificationBus.clear();
        const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Etwas ist schiefgelaufen.";

        notificationBus.error(message);

        // IMPORTANT: let callers still handle the error if needed
        return Promise.reject(error);
    }
);

export default api;
