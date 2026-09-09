import { requireAdmin } from "@/lib/admin/auth";
import MessagesPage from "@/components/admin/legacy/MessagesPage";

export const dynamic = "force-dynamic";

export default async function DashboardMessagesPage() {
  await requireAdmin();
  return <MessagesPage />;
}
