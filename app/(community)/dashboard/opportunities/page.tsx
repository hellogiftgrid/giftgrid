import { requireAdmin } from "@/lib/admin/auth";
import OpportunitiesPage from "@/components/admin/legacy/OpportunitiesPage";

export const dynamic = "force-dynamic";

export default async function DashboardOpportunitiesPage() {
  await requireAdmin();
  return <OpportunitiesPage />;
}
