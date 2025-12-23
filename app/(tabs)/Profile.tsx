import { getUser, logout } from "@/api/auth";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

interface User {
    name: string;
    email: string;
    is_admin: boolean;
    department?: {
      name: string;
    };
}

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const loadUser = async () => {
        const u = await getUser();
        setUser(u);
      };
  
      loadUser();
    }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Benutzer nicht geladen</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
            <FontAwesome5 name="user-circle" size={80} color="#2563eb" />
            {!!user.is_admin && (
            <View style={styles.adminBadge}>
                <FontAwesome5 name="shield-alt" size={14} color="#fff" />
            </View>
            )}
        </View>
        {/* Name */}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>
            {user.is_admin ? "Administrator" : "Benutzer"}
        </Text>
        {/* Info Card */}
        <View style={styles.card}>
            <InfoRow icon="envelope" label="E-Mail" value={user.email} />
            <InfoRow
            icon="building"
            label="Abteilung"
            value={user.department?.name ?? "—"}
            />
        </View>
        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={logout}>
            <FontAwesome5 name="sign-out-alt" size={18} color="#fff" />
            <Text style={styles.logoutText}>Abmelden</Text>
        </Pressable>
    </View>
  );
}

/* Small reusable row */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <FontAwesome5 name={icon} size={14} color="#6b7280" />
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#f9fafb",
      alignItems: "center",
    },
  
    avatarWrapper: {
      position: "relative",
      marginBottom: 8,
    },
  
    adminBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: "#2563eb",
      padding: 6,
      borderRadius: 20,
    },
  
    name: {
      fontSize: 20,
      fontWeight: "600",
      marginTop: 4,
    },
  
    role: {
      color: "#6b7280",
      marginBottom: 16,
    },
  
    card: {
      width: "100%",
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
    },
  
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
  
    label: {
      marginLeft: 8,
      width: 90,
      fontWeight: "600",
    },
  
    value: {
      flex: 1,
      color: "#111827",
    },
  
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#dc2626",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
  
    logoutText: {
      color: "#fff",
      fontWeight: "600",
      marginLeft: 10,
    },
  
    error: {
      color: "#dc2626",
      fontWeight: "500",
    },
  });
  