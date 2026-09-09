import { requireAdmin } from "@/lib/admin/auth";
import ContentPage from "@/components/admin/legacy/ContentPage";

export const dynamic = "force-dynamic";

export default async function DashboardContentPage() {
  await requireAdmin();
  return <ContentPage />;
}
