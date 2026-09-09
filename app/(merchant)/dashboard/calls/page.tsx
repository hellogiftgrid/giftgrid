import { requireAdmin } from "@/lib/admin/auth";
import CallsPage from "@/components/admin/legacy/CallsPage";

export const dynamic = "force-dynamic";

export default async function DashboardCallsPage() {
  await requireAdmin();
  return <CallsPage />;
}
