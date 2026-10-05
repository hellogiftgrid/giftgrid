import React from 'react';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Auth } from '../social';
import { useSession } from '../session';
export default function SignIn() { const { session } = useSession(); if (session) return <Redirect href="/" />; return <SafeAreaView style={{ flex: 1 }}><Auth onClose={() => router.canGoBack() ? router.back() : router.replace('/')} /></SafeAreaView>; }
