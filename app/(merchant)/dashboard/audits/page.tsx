import { requireAdmin } from "@/lib/admin/auth";
import AuditsPage from "@/components/admin/legacy/AuditsPage";

export const dynamic = "force-dynamic";

export default async function DashboardAuditsPage() {
  await requireAdmin();
  return <AuditsPage />;
}
