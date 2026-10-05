import React from 'react';
import { router } from 'expo-router';
import { Community } from '../../social';
import { useSession } from '../../session';
export default function Home() { const { session } = useSession(); return <Community key={session?.user.id || 'guest'} session={session} signIn={() => router.push('/sign-in')} />; }
