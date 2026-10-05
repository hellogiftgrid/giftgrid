import React from 'react';
import { Profile } from '../../workspace';
import { useSession } from '../../session';
import SignIn from '../sign-in';
export default function ProfilePage() { const { session } = useSession(); return session ? <Profile key={session.user.id} /> : <SignIn />; }
