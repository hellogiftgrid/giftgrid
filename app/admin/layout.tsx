import AdminSidebar from "./AdminSidebar";
import MobileAdminNav from "./MobileAdminNav";
import { requireAdmin } from "@/lib/admin/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-5 lg:px-8">
              <div>
                <div className="text-sm font-bold text-slate-950">
                  GiftGrid Admin
                </div>
                <div className="text-xs text-slate-400">
                  Platform operations
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-slate-700">
                    {admin.fullName}
                  </div>
                  <div className="text-xs capitalize text-slate-400">
                    {admin.role.replaceAll("_", " ")}
                  </div>
                </div>

                <Link
                  href="/auth/sign-out"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </header>

          <main className="px-5 py-7 lg:px-8">
            <MobileAdminNav />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
