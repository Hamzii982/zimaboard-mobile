import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import api from "../api/client";

type User = {
  id: number;
  name: string;
  email: string;
};

type Message = {
  id: number;
  title: string;
  description: string;
  priority: "Niedrig" | "Mittel" | "Hoch";
  attachments: { id: number; path: string; original_name: string; mime_type: string; size: number }[];
  chat_messages: any[];
  activities: any[];
  creator: any;
  status: { name: string; color: string };
  assignees: Array<{ id: number; name: string }>;
  is_archived: boolean;
  is_announcement: boolean;
};

type Props = {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess: () => void;
};

export default function ShareModal({ message, isOpen, onClose, onShareSuccess }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (message?.assignees) {
      setSelectedUsers(message.assignees.map((a) => a.id));
    }

    // Fetch all users when modal opens
    api
      .get("/settings/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, [isOpen, message]);

  const handleShare = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      await api.post(`/messages/${message.id}/assign`, { assignees: selectedUsers });
      onShareSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              <Icon name="user-plus" size={16} /> Nachricht teilen
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="times" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Users List */}
          <ScrollView style={styles.userList}>
            {users.map((u) => {
              const selected = selectedUsers.includes(u.id);
              return (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.userItem, selected && styles.userItemSelected]}
                  disabled={selected}
                  onPress={() => {
                    if (!selected) setSelectedUsers((prev) => [...prev, u.id]);
                  }}
                >
                  <Text>
                    {u.name} ({u.email}) {selected ? "(zugewiesen)" : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text>Stornieren</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() =>
                Alert.alert(
                  "Bestätigung",
                  "Diese Aktion entfernt die Nachricht aus den Ankündigungen. Möchten Sie fortfahren?",
                  [
                    { text: "Abbrechen", style: "cancel" },
                    { text: "Ja, teilen", onPress: handleShare },
                  ]
                )
              }
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Teilen</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  container: { backgroundColor: "#fff", borderRadius: 12, padding: 16, maxHeight: "80%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontWeight: "bold", fontSize: 16 },
  userList: { maxHeight: 200, marginBottom: 12 },
  userItem: { padding: 8, borderBottomWidth: 0.5, borderBottomColor: "#d1d5db" },
  userItemSelected: { backgroundColor: "#f3f4f6" },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6 },
  shareButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#2563eb", borderRadius: 6, justifyContent: "center" },
});
