import api from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MessageStatus {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

type Priority = "Niedrig" | "Mittel" | "Hoch";

export default function NewMessage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Mittel");
  const [statusId, setStatusId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [assignees, setAssignees] = useState<number[]>([]);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [attachments, setAttachments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [statuses, setStatuses] = useState<MessageStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/message-statuses").then(res => setStatuses(res.data));
    api.get("/users").then(res => setUsers(res.data.users));
  }, []);

  const pickAttachments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setAttachments(prev => [...prev, ...result.assets]);
    }
  };

  const toggleAssignee = (id: number) => {
    setAssignees(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title || !description || !statusId) return;

    setLoading(true);

    try {
      /** 1️⃣ Create Message */
      const res = await api.post("/new-message", {
        title,
        description,
        priority,
        status_id: statusId,
        is_announcement: isAnnouncement,
        assignees,
      });

      const messageId = res.data.data.id;

      /** 2️⃣ Attachments */
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append("message_id", String(messageId));

        for (const file of attachments) {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          formData.append("files[]", blob, file.name);
        }

        await api.post("/store-attachments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      /** 3️⃣ Activity */
      await api.post("/store-activities", {
        message_id: messageId,
        action: "hat Nachricht erstellt",
      });

      /** 4️⃣ Assignment activities */
      await Promise.all(
        assignees.map(id =>
          api.post("/store-activities", {
            message_id: messageId,
            action: "hat geteilt mit",
            assignee_id: id,
          })
        )
      );

      router.back();
    } catch (err) {
      console.error(err);
      alert("Nachricht konnte nicht erstellt werden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Neue Nachricht</Text>

      {/* Title */}
      <TextInput
        placeholder="Titel"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* Description */}
      <TextInput
        placeholder="Beschreibung"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textarea]}
        multiline
      />

      {/* Attachments */}
      <TouchableOpacity onPress={pickAttachments} style={styles.attachmentBtn}>
        <Ionicons name="attach" size={20} />
        <Text>Anhänge auswählen</Text>
      </TouchableOpacity>

      {attachments.map((f, i) => (
        <Text key={i} style={styles.file}>
          {f.name}
        </Text>
      ))}

      {/* Announcement */}
      <View style={styles.row}>
        <Text>Ist eine Ankündigung</Text>
        <Switch value={isAnnouncement} onValueChange={setIsAnnouncement} />
      </View>

      {/* Priority */}
      <Text style={styles.label}>Priorität</Text>
      {(["Niedrig", "Mittel", "Hoch"] as Priority[]).map(p => (
        <TouchableOpacity
          key={p}
          style={[
            styles.option,
            priority === p && styles.optionActive,
          ]}
          onPress={() => setPriority(p)}
        >
          <Text>{p}</Text>
        </TouchableOpacity>
      ))}

      {/* Status */}
      <Text style={styles.label}>Status</Text>
      {statuses.map(s => (
        <TouchableOpacity
          key={s.id}
          style={[
            styles.option,
            statusId === s.id && styles.optionActive,
          ]}
          onPress={() => setStatusId(s.id)}
        >
          <Text>{s.name}</Text>
        </TouchableOpacity>
      ))}

      {/* Assignees */}
      <Text style={styles.label}>Empfänger</Text>
      {users.map(u => (
        <TouchableOpacity
          key={u.id}
          style={styles.row}
          onPress={() => toggleAssignee(u.id)}
        >
          <Ionicons
            name={assignees.includes(u.id) ? "checkbox" : "square-outline"}
            size={22}
          />
          <Text>{u.name}</Text>
        </TouchableOpacity>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Abbrechen</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.submit}>Nachricht erstellen</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    heading: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  
    input: {
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
  
    textarea: { height: 100, textAlignVertical: "top" },
  
    attachmentBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
  
    file: { fontSize: 12, color: "#2563eb" },
  
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginVertical: 4,
    },
  
    label: { marginTop: 12, fontWeight: "600" },
  
    option: {
      padding: 8,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 6,
      marginVertical: 4,
    },
  
    optionActive: {
      backgroundColor: "#dbeafe",
      borderColor: "#2563eb",
    },
  
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
  
    submit: {
      color: "#2563eb",
      fontWeight: "600",
    },
  });
  
