import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Messages — GiftGrid Admin",
};

export default async function AdminMessagesPage() {
  const supabase = createClient();

  const { data: threads, error } = await supabase
    .from("message_threads")
    .select(
      "id, subject, created_at, merchant:merchant_profiles(business_name, contact_email)"
    )
    .order("created_at", { ascending: false });

  const threadIds = (threads ?? []).map((t) => t.id);

  const { data: messages } = threadIds.length
    ? await supabase
        .from("messages")
        .select("thread_id, sender_id, body, created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
    : { data: [] as any[] };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Communications
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Merchant Messages
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Admin-side view of merchant dashboard conversations.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Unable to load message threads: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          {threads?.map((thread: any) => {
            const threadMessages = (messages ?? []).filter(
              (message: any) => message.thread_id === thread.id
            );

            const latest =
              threadMessages[threadMessages.length - 1];

            return (
              <article
                key={thread.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      {thread.subject || "GiftGrid conversation"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {thread.merchant?.business_name ?? "Unknown merchant"} ·{" "}
                      {thread.merchant?.contact_email ?? ""}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(thread.created_at).toLocaleDateString()}
                  </span>
                </div>

                {latest && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Latest message
                    </p>

                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {latest.body}
                    </p>
                  </div>
                )}
              </article>
            );
          })}

          {!threads?.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No merchant conversations yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
