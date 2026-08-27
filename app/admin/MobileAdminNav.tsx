import Link from "next/link";

export default function MobileAdminNav() {
  return (
    <div className="mb-6 overflow-x-auto lg:hidden">
      <div className="flex min-w-max gap-2">
        {[
          ["/admin", "Dashboard"],
          ["/admin/applications", "Applications"],
          ["/admin/merchants", "Merchants"],
          ["/admin/audits", "Audits"],
          ["/admin/opportunities", "Opportunities"],
          ["/admin/messages", "Messages"],
          ["/admin/support", "Support"],
          ["/admin/content", "Content"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 whitespace-nowrap hover:border-indigo-200 hover:text-[#4F46E5]"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
