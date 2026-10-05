import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Comments } from '../../social';
import { useSession } from '../../session';
export default function CommentsPage() { const { id } = useLocalSearchParams<{ id: string }>(); const { session } = useSession(); return <Comments id={id} session={session} signIn={() => router.push('/sign-in')} back={() => router.canGoBack() ? router.back() : router.replace('/')} />; }
