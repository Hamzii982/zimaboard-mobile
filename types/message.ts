// types/message.ts
export interface Message {
    id: number;
    title: string;
    description: string;
    priority: "Niedrig" | "Mittel" | "Hoch";
    status: { name: string; color: string };
    status_id: number;
    creator: { id: number; name: string, department: {id: number, name: string, color: string} };
    assignees: Array<{ id: number; name: string }>;
    assignee: { id: number; name: string};
    chat_messages: Comment[];
    activities: Activity[];
    attachments: { id: number; url: string; path: string; original_name: string; mime_type: string; size: number }[];
    is_archived: boolean;
    is_announcement: boolean;
}

interface Activity {
    id: number;
    user: { id: number; name: string };
    action: string;
    assignee?: { name: string } | null;
    created_at: string;
}

interface Comment {
    id: number;
    user: { id: number; name: string };
    content: string;
    created_at: string;
}
