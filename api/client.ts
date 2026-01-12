import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { router } from 'expo-router';
import { Config } from "../config";
import { notificationBus } from "./notificationBus";

const api = axios.create({
    baseURL: Config.API_BASE_URL,
    headers: {
        Accept: "application/json",
    },
});

// Add token automatically if exists
api.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem("token");
    
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    
        notificationBus.loading("Wird geladen …");
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    res => res,
    async error => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        router.replace('/login')
      }
      return Promise.reject(error);
    }
);

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
