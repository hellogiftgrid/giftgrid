import { requireAdmin } from "@/lib/admin/auth";
import MerchantsPage from "@/components/admin/legacy/MerchantsPage";

export const dynamic = "force-dynamic";

export default async function DashboardMerchantsPage() {
  await requireAdmin();
  return <MerchantsPage />;
}
