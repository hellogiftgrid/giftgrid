import { requireAdmin } from "@/lib/admin/auth";
import SupportPage from "@/components/admin/legacy/SupportPage";

export const dynamic = "force-dynamic";

export default async function DashboardSupportPage() {
  await requireAdmin();
  return <SupportPage />;
}
