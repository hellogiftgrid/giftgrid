import React from 'react';
import { Dashboard } from '../../workspace';
import { useSession } from '../../session';
import SignIn from '../sign-in';
export default function DashboardPage() { const { session } = useSession(); return session ? <Dashboard key={session.user.id} /> : <SignIn />; }
