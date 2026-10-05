import React from 'react';
import { Pressable, Text } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSession } from '../../session';
import { colors } from '../../ui';

export default function TabLayout() {
  const { session } = useSession();
  return <Tabs screenOptions={{ tabBarActiveTintColor: colors.brand, tabBarLabelStyle: { fontSize: 10 }, headerTitle: 'GiftGrid', headerTitleStyle: { color: colors.brand, fontWeight: '800' }, headerRight: () => <Pressable accessibilityRole="button" onPress={() => router.push(session ? '/profile' : '/sign-in')} style={{ padding: 14 }}><Text style={{ color: colors.brand }}>{session ? 'My account' : 'Sign in'}</Text></Pressable> }}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
    <Tabs.Screen name="members" options={{ title: 'Members' }} />
    <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
}
