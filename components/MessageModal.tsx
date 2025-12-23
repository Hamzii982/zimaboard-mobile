import { getUser } from "@/api/auth";
import { initPusher } from "@/api/pusherClient";
import React, { useEffect, useRef, useState } from "react";
import {
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { timeAgo } from "../utils/timeAgo"; // make sure this works for RN
import NewMessage from "./NewMessage";

type Comment = {
  id: number;
  user: { id: number; name: string };
  content: string;
  created_at: string;
};

type Activity = {
  assignee?: { id: number; name: string };
  id: number;
  user: { id: number; name: string };
  action: string;
  created_at: string;
};

type Attachment = {
  id: number;
  path: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
};

type Message = {
  creator: any;
  assignees: any[];
  status: { name: string; color: string };
  id: number;
  title: string;
  description: string;
  priority: "Niedrig" | "Mittel" | "Hoch";
  status_id: number;
  attachments: Attachment[];
  chat_messages: Comment[];
  activities: Activity[];
  is_archived: boolean;
  is_announcement: boolean;
};

type Props = {
  message: Message;
  onClose: () => void;
  onArchiveToggle: (archived: boolean) => void;
  onAddComment: (text: string) => Promise<Comment> | Comment;
};

export default function MessageModal({ message, onClose, onArchiveToggle, onAddComment }: Props) {
  const [chatMessages, setChatMessages] = useState<Comment[]>(message.chat_messages || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const priorityBg =
    message.priority === "Hoch"
      ? "#fee2e2"
      : message.priority === "Mittel"
      ? "#fef3c7"
      : "#dbeafe";

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await onAddComment(newComment);
      setChatMessages((prev) => [...prev, res]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

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

            setChatMessages(prev => {
                if (!prev) return prev;
                // prevent duplicates (VERY IMPORTANT)
                if (prev.some(c => c.id === data.chat.id)) {
                    return prev;
                }
                return [...prev, data.chat];
            });

            scrollRef.current?.scrollToEnd({ animated: true });
        };

        initPusher(userId, handlePusherEvent);
  
    }, [userId]);

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              <Text style={{ backgroundColor: message.status.color, color: "#fff", paddingHorizontal: 4, borderRadius: 4 }}>
                {message.status.name}
              </Text>{" "}
              {message.title}
                <TouchableOpacity onPress={() => setEditModal(true)}>
                    <Ionicons name="create-outline" size={22} />
                </TouchableOpacity>
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="times" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {editModal && (
            <NewMessage
                mode="edit"
                visible={editModal}
                onClose={() => setEditModal(false)}
                message={message}        />
            )}

          <ScrollView style={styles.content}>
            {/* Description */}
            <View style={[styles.section, { backgroundColor: priorityBg, padding: 12 }]}>
              <Text>{message.description}</Text>
            </View>

            {/* Attachments */}
            {message.attachments?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Anhänge</Text>
                {message.attachments.map((att) => (
                  <TouchableOpacity key={att.id} onPress={() => Linking.openURL(att.url)}>
                    <Text style={{ color: "#2563eb", marginVertical: 2 }}>
                      {att.original_name} ({Math.round(att.size / 1024)} KB)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Comments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kommentare</Text>
              <ScrollView
                ref={scrollRef}
                style={{ maxHeight: 200 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {chatMessages.map((c) => (
                  <View key={c.id} style={{ marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: "#d1d5db", paddingBottom: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                      <Icon name="comment-dots" size={14} color="#9ca3af" style={{ marginRight: 4 }} />
                      <Text style={{ fontWeight: "bold" }}>{c.user.name}</Text>
                    </View>
                    <Text style={{ marginLeft: 18 }}>{c.content}</Text>
                    <Text style={{ fontSize: 10, color: "#9ca3af", textAlign: "right" }}>{timeAgo(c.created_at)}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Add new comment */}
              <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
                <TextInput
                  style={styles.input}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Kommentar hinzufügen..."
                />
                <TouchableOpacity onPress={handleAddComment} style={styles.button} disabled={loading}>
                  <Text style={{ color: "#fff" }}>{loading ? "Senden..." : "Senden"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Activities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aktivitäten</Text>
              <ScrollView
                style={{ maxHeight: 200 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {message.activities?.map((a) => (
                    <View key={a.id} style={{ flexDirection: "row", marginBottom: 4 }}>
                    <Icon name="history" size={14} color="#9ca3af" style={{ marginRight: 4, marginTop: 2 }} />
                    <View>
                        <Text style={{ fontWeight: "bold" }}>
                        {a.user.name} <Text style={{ color: "#374151" }}>{a.action}</Text> {a.assignee?.name || ""}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#9ca3af" }}>{timeAgo(a.created_at)}</Text>
                    </View>
                    </View>
                ))}
                </ScrollView>
            </View>

            {/* Creator & Assignees */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ersteller & Empfaenger</Text>
              <Text>Ersteller: {message.creator?.name || "Unbekannt"}</Text>
              {message.assignees.map((a) => (
                <Text key={a.id}>Empfaenger: {a.name}</Text>
              ))}
            </View>

            {/* Archive Toggle */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
              <Icon name="trash" size={16} color="#374151" />
              <TouchableOpacity
                onPress={() => onArchiveToggle(!message.is_archived)}
                style={{
                  marginLeft: 8,
                  width: 50,
                  height: 25,
                  borderRadius: 15,
                  backgroundColor: message.is_archived ? "#2563eb" : "#d1d5db",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 21,
                    height: 21,
                    borderRadius: 10.5,
                    backgroundColor: "#fff",
                    marginLeft: message.is_archived ? 25 : 2,
                  }}
                />
              </TouchableOpacity>
              <Text style={{ marginLeft: 8 }}>{message.is_archived ? "Archiviert" : "Nicht archiviert"}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 12, maxHeight: "90%", padding: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontWeight: "bold", fontSize: 16, flex: 1 },
  content: { marginTop: 8 },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: "bold", marginBottom: 4 },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, paddingHorizontal: 8, height: 36 },
  button: { backgroundColor: "#2563eb", paddingHorizontal: 12, justifyContent: "center", borderRadius: 6 },
});
