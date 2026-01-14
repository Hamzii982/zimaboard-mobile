import { isLoggedIn } from '@/api/auth';
import api from '@/api/client';
import SummaryCard from '@/components/SummaryCard';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

type Message = {
  id: number;
  title: string;
  status: { name: string; color: string };
  priority: string;
  creator: { name: string; department: { name: string; color: string } };
};

export default function Dashboard() {
  const [assigned, setAssigned] = useState<Message[]>([]);
  const [created, setCreated] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Message[]>([]);
  const [assignedCount, setAssignedCount] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) return;

      const res = await api.get("/dashboard");

      setAssigned(res.data.assigned?.latest ?? []);
      setCreated(res.data.created?.latest ?? []);
      setAnnouncements(res.data.announcements?.latest ?? []);

      setAssignedCount(res.data.assigned?.total ?? 0);
      setCreatedCount(res.data.created?.total ?? 0);
      setAnnouncementsCount(res.data.announcements?.total ?? 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const reloadData = useCallback(async () => {
    setRefreshing(true);

    // fetch / refetch your data here
    await fetchDashboard();

    setRefreshing(false);
  }, []);

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 16 }} 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={reloadData} />
      }
    >
      <SummaryCard
        title="Meine Nachrichten"
        messages={assigned}
        count={assignedCount}
        onPress={() => router.push('/assigned')}
      />
      <SummaryCard
        title="Zugewiesene Nachrichten"
        messages={created}
        count={createdCount}
        onPress={() => router.push('/created')}
      />
      <SummaryCard
        title="Pin Wand"
        messages={announcements}
        count={announcementsCount}
        onPress={() => router.push('/announcement')}
      />
    </ScrollView>
  );
}
