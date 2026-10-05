import { permanentRedirect, notFound } from "next/navigation";
import { getPublicMember } from "@/lib/community/public-profile";

export default async function OldMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getPublicMember(id);
  if (!member || member.kind !== "merchant") notFound();
  permanentRedirect(`/merchant/${id}`);
}
