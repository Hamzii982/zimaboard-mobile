import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type ApiMessageType = "success" | "error" | "loading";

interface ApiMessage {
  text: string;
  type: ApiMessageType;
}

interface ApiFeedbackContextValue {
  message: ApiMessage | null;
  clear: () => void;
}

const ApiFeedbackContext = createContext<ApiFeedbackContextValue | null>(null);

export const ApiFeedbackProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<ApiMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    setMessage(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!message) return;

    timerRef.current = setTimeout(clear, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [message]);

  return (
    <ApiFeedbackContext.Provider value={{ message, clear }}>
      {children}
      {message && (
        <View style={[styles.container, message.type === "success" ? styles.success : message.type === "error" ? styles.error : styles.loading]}>
          {message.type === "loading" && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
          <Text style={styles.text}>{message.text}</Text>
        </View>
      )}
    </ApiFeedbackContext.Provider>
  );
};

export const useApiFeedback = () => {
  const ctx = useContext(ApiFeedbackContext);
  if (!ctx) throw new Error("useApiFeedback must be used within ApiFeedbackProvider");
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  text: { color: "white", fontWeight: "600", flex: 1 },
  success: { backgroundColor: "#16a34a" },
  error: { backgroundColor: "#dc2626" },
  loading: { backgroundColor: "#2563eb" },
});
