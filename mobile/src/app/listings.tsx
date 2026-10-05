import React from 'react';
import { router } from 'expo-router';
import { Listings } from '../workspace';
import { useSession } from '../session';
import SignIn from './sign-in';
export default function ListingsPage() { const { session } = useSession(); return session ? <Listings key={session.user.id} back={() => router.replace('/dashboard')} /> : <SignIn />; }
