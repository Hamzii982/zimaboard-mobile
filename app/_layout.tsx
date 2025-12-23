import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ApiFeedbackProvider } from '@/context/ApiFeedbackContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isLoggedIn } from '../api/auth';

import NetInfo from '@react-native-community/netinfo';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';

// Only define missing properties on existing window
if (!(global as any).window) {
  (global as any).window = {};
}

// Polyfill WebSocket
(global as any).window.WebSocket = global.WebSocket;

// Polyfill btoa
(global as any).window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// Polyfill NetInfo for pusher-js
(global as any).window.NetInfo = NetInfo;

// Safely define navigator
if (!(global as any).navigator) {
  (global as any).navigator = { product: 'ReactNative' };
} else if (!(global as any).navigator.product) {
  (global as any).navigator.product = 'ReactNative';
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const result = await isLoggedIn();
      setLoggedIn(result);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <ApiFeedbackProvider>
        <NotificationProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            {loggedIn ? (
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="login" options={{ headerShown: false }} />
            )}
          </Stack>
          <StatusBar style="auto" />
        </NotificationProvider>
      </ApiFeedbackProvider>
    </ThemeProvider>
  );
}
