import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { api, asset } from '../../client';
import { Card, Field, Page, Picture, Status, styles, useLoad } from '../../ui';

export default function MembersPage() {
  const load = useLoad(() => api('/community/members'), []);
  const [search, setSearch] = useState('');
  const members = load.data?.members?.filter((member: any) =>
    [member.display_name, member.bio || '', member.country || ''].join(' ').toLowerCase().includes(search.toLowerCase()),
  ) || [];
  return <Page title="Members" refresh={load.refresh} loading={load.loading}>
    <Text style={styles.muted}>Browse GiftGrid member and merchant profiles.</Text>
    <Field label="Find a member" value={search} onChangeText={setSearch} />
    <Status {...load} />
    {members.map((member: any) => <Card key={member.profile_id}>
      <View style={styles.row}><Picture uri={asset(member.avatar_url)} avatar /><View>
        <Text style={styles.label}>{member.display_name}</Text>
        <Text style={styles.muted}>{member.kind} · {member.country || 'GiftGrid member'}</Text>
      </View></View>
      <Text style={styles.text}>{member.bio}</Text>
    </Card>)}
  </Page>;
}
