import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider, useSession } from '../session';
import { configured } from '../client';

function Routes() {
  const { ready } = useSession();
  if (!configured) return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text>GiftGrid is not configured. Please install the official release.</Text></View>;
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading GiftGrid" /></View>;
  return <Stack screenOptions={{ title: 'GiftGrid', headerBackTitle: 'Back' }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="sign-in" options={{ presentation: 'modal', headerShown: false }} /><Stack.Screen name="product/[id]" options={{ title: 'Product' }} /><Stack.Screen name="comments/[id]" options={{ title: 'Comments' }} /></Stack>;
}
export default function RootLayout() { return <SafeAreaProvider><SessionProvider><StatusBar style="dark" /><Routes /></SessionProvider></SafeAreaProvider>; }
