import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { getUser } from "@/api/auth";
import api from "@/api/client";
import { initPusher } from "@/api/pusherClient";
import NewMessage from "@/components/NewMessage";
import { Message } from "@/types/message";
import { timeAgo } from "@/utils/timeAgo";
import React from "react";

export default function MessageDetail() {

    <Stack.Screen
      options={{
        title: `Nachricht Detail`,
      }}
    />
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [message, setMessage] = useState<Message | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/${id}`);
      setMessage(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

    // Get user ID once
    useEffect(() => {
      const fetchUser = async () => {
        const user = await getUser();
        if (user?.id) {
          setUserId(user.id);
        }
      };
      fetchUser();
    }, []);

  useEffect(() => {
    if (!userId) return;
  
    // handle incoming Pusher events
    const handlePusherEvent = (data: any) => {
      // Only update if this chat belongs to the current message
        setMessage(prev => {
            if (!prev) return prev;
            if (data.chat?.message_id !== prev.id) return prev;
      
            return {
              ...prev,
              chat_messages: [...prev.chat_messages, data.chat],
            };
        });
  
        // scroll to bottom
        scrollRef.current?.scrollToEnd({ animated: true });
      };
      initPusher(userId, handlePusherEvent);

    }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [message?.chat_messages]);

  if (!message) return <p>Lade Nachricht...</p>;

  const priorityBg =
    message.priority === "Hoch"
      ? "#fee2e2"
      : message.priority === "Mittel"
      ? "#fef3c7"
      : "#dbeafe";

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/messages/${message?.id}/comments`, {
        text: newComment,
      });

      setMessage(prev =>
        prev
          ? { ...prev, chat_messages: [...prev.chat_messages, res.data.data] }
          : prev
      );

      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

    const handleMessageSaved = (updated: Message) => {
        setMessage(updated);
    };  

  const handleArchiveToggle = async (value: boolean) => {
    try {
      await api.put(`/messages/${message?.id}`, { is_archived: value });
      setMessage(prev => (prev ? { ...prev, is_archived: value } : prev));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!message) {
    return <Text>Nachricht nicht gefunden</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} />
        </TouchableOpacity>

        <View style={styles.archiveRow}>
          <Ionicons name="trash-outline" size={20} />
          <Switch
            value={message.is_archived}
            onValueChange={handleArchiveToggle}
          />
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: message.status.color },
          ]}
        >
          <Text style={styles.statusText}>{message.status.name}</Text>
        </View>

        <Text style={styles.title}>{message.title}</Text>

        <TouchableOpacity onPress={() => setEditModal(true)}>
          <Ionicons name="create-outline" size={22} />
        </TouchableOpacity>
      </View>

      {editModal && (
        <NewMessage
                  mode="edit"
                  visible={editModal}
                  onSaved={handleMessageSaved}
                  onClose={() => setEditModal(false)}
                  message={message}        />
      )}

      {/* Description */}
      <View style={[styles.card, { backgroundColor: priorityBg }]}>
        <Text>{message.description}</Text>
      </View>

      {/* Attachments */}
      {message.attachments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anhänge</Text>
          {message.attachments.map(att => (
            <TouchableOpacity
              key={att.id}
              onPress={() => Linking.openURL(att.url)}
            >
              <Text style={styles.link}>
                {att.original_name} ({Math.round(att.size / 1024)} KB)
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kommentare</Text>

        <ScrollView ref={scrollRef} style={styles.commentsBox}>
          {message.chat_messages.map(c => (
            <View key={c.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{c.user.name}</Text>
              <Text>{c.content}</Text>
              <Text style={styles.time}>{timeAgo(c.created_at)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.commentInput}>
          <TextInput
            placeholder="Kommentar hinzufügen..."
            value={newComment}
            onChangeText={setNewComment}
            style={styles.input}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Ionicons name="send" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivitäten</Text>
        <ScrollView
            style={{ maxHeight: 240 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
        >
            {message.activities.map(a => (
            <View key={a.id} style={styles.activity}>
                <Ionicons name="time-outline" size={16} />
                <Text style={styles.activityText}>
                {a.user.name} {a.action} {a.assignee?.name || ""}
                </Text>
                <Text style={styles.time}>{timeAgo(a.created_at)}</Text>
            </View>
            ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
  
    archiveRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      flexWrap: "wrap",
    },
  
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
  
    statusText: { color: "#fff", fontSize: 12 },
    title: { fontSize: 18, fontWeight: "600", flex: 1 },
  
    card: {
      backgroundColor: "#f1f5f9",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
  
    section: { marginBottom: 16 },
    sectionTitle: { fontWeight: "600", marginBottom: 8 },
  
    link: { color: "#2563eb", marginBottom: 4 },
  
    commentsBox: {
      maxHeight: 240,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
    },
  
    comment: { marginBottom: 8 },
    commentAuthor: { fontWeight: "600" },
    time: { fontSize: 11, color: "#6b7280" },
  
    commentInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 8,
      padding: 8,
    },
  
    activity: { marginBottom: 8 },
    activityText: { fontSize: 13 },
  });
  
