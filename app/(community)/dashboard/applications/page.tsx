import { requireAdmin } from "@/lib/admin/auth";
import ApplicationsPage from "@/components/admin/legacy/ApplicationsPage";

export const dynamic = "force-dynamic";

export default async function DashboardApplicationsPage() {
  await requireAdmin();
  return <ApplicationsPage />;
}
