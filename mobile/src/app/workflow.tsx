import React from 'react';
import { router } from 'expo-router';
import { Workflow } from '../workspace';
import { useSession } from '../session';
import SignIn from './sign-in';
export default function WorkflowPage() { const { session } = useSession(); return session ? <Workflow key={session.user.id} back={() => router.replace('/dashboard')} /> : <SignIn />; }
