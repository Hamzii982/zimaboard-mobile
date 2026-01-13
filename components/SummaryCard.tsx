import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

type Message = {
    id: number;
    title: string;
    status: { name: string; color: string };
    priority: string;
    creator: { name: string; department: { name: string; color: string } };
};

type SummaryCardProps = {
    title: string;
    messages: Message[];
    count: number;
    onPress?: () => void;
};

export default function SummaryCard({ title, messages, count, onPress }: SummaryCardProps) {
    const router = useRouter();

    const getCardIcon = () => {
        switch (title.toLowerCase()) {
            case 'meine nachrichten':
                return <Icon name="user-check" size={20} color="#3b82f6" />;
            case 'zugewiesene nachrichten':
                return <Icon name="user-edit" size={20} color="#10b981" />;
            case 'pin wand':
                return <Icon name="bullhorn" size={20} color="#facc15" />;
            default:
                return <Icon name="user" size={20} color="#3b82f6" />;
        }
    };

    const getPriorityBg = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'hoch':
                return { backgroundColor: 'rgba(248, 113, 113, 0.3)' }; // red
            case 'mittel':
                return { backgroundColor: 'rgba(253, 230, 138, 0.3)' }; // yellow
            case 'niedrig':
                return { backgroundColor: 'rgba(191, 219, 254, 0.3)' }; // blue
            default:
                return { backgroundColor: '#f3f4f6' }; // gray
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {getCardIcon()}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>{title}</Text>
            </View>

            {messages.length === 0 ? (
                <Text style={{ color: '#6b7280' }}>Keine neuen Nachrichten</Text>
            ) : (
                <View>
                    {messages.map(item => (
                        <TouchableOpacity
                        key={item.id}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            padding: 8,
                            borderRadius: 8,
                            marginBottom: 6,
                            ...getPriorityBg(item.priority),
                        }}
                        onPress={() => router.push(`/message/${item.id}`)}
                        >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Icon name="envelope" size={14} color={item.status.color} style={{ marginRight: 6 }} />
                            <Text numberOfLines={1} style={{ fontWeight: '500', flexShrink: 1 }}>
                            {item.title}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                            style={{
                                fontSize: 10,
                                color: '#fff',
                                fontWeight: 'bold',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: item.status.color,
                            }}
                            >
                            {item.status.name}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>{item.creator.name}</Text>
                        </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={{ marginTop: 8, fontWeight: 'bold', color: '#3b82f6' }}>
                {count} {count === 1 ? 'Nachricht' : 'Nachrichten'}
            </Text>
        </TouchableOpacity>
    );
}
