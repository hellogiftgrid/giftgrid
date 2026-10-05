import Link from "next/link";

type Props = {
  role: string;
  fullName: string;
  email: string;
  merchantStats?: {
    
    
    documents: number;
    messages: number;
  };
  adminStats?: {
    merchants: number;
    applications: number;
    
    
    messages: number;
    support: number;
  };
};

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

export default function RoleDashboard({
  role,
  fullName,
  email,
  merchantStats,
  adminStats,
}: Props) {
  const isAdmin =
    role === "admin" || role === "super_admin";

  return (
    <div className="mx-auto max-w-7xl space-y-7">

      <div className="rounded-3xl bg-white border border-slate-200 p-7 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
              GiftGrid Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Welcome back, {fullName || "there"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {email}
            </p>
          </div>

          
        </div>
      </div>

      {isAdmin && adminStats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Stat label="Merchants" value={adminStats.merchants} />
            <Stat label="Applications" value={adminStats.applications} />
            
            
            <Stat label="Messages" value={adminStats.messages} />
            <Stat label="Support" value={adminStats.support} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            

            {(role === "super_admin") && (
              <Link
                href="/dashboard/users"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-200"
              >
                <div className="text-lg font-bold text-slate-950">
                  Users & Roles
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Manage platform roles and permissions.
                </p>
              </Link>
            )}

            {role === "super_admin" && (
              <Link
                href="/dashboard/activity"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-200"
              >
                <div className="text-lg font-bold text-slate-950">
                  Activity Log
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  See platform events and administrative actions.
                </p>
              </Link>
            )}

            <Link
              href="/dashboard/merchants"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-200"
            >
              <div className="text-lg font-bold text-slate-950">
                Merchants
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Review live merchant accounts and applications.
              </p>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            
            <Stat
              label="Documents"
              value={merchantStats?.documents || 0}
            />
            <Stat
              label="Messages"
              value={merchantStats?.messages || 0}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            

            

            <Link
              href="/dashboard/comms"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-200"
            >
              <div className="text-lg font-bold text-slate-950">
                Messages
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Communicate with GiftGrid support and team members.
              </p>
            </Link>

            
          </div>
        </>
      )}
    </div>
  );
}
