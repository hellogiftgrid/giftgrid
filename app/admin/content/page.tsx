import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Website Content — GiftGrid Admin",
};

export default async function AdminContentPage() {
  const supabase = createClient();

  const [{ data: content, error: contentError }, { data: faqs, error: faqError }] =
    await Promise.all([
      supabase
        .from("website_content")
        .select("id, page_key, updated_at, updated_by")
        .order("page_key"),

      supabase
        .from("faqs")
        .select("id, question, answer, published, sort_order")
        .order("sort_order"),
    ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Content
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Website Content
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Central administration for GiftGrid website content and FAQs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Managed pages
          </h2>

          {contentError ? (
            <p className="mt-4 text-sm text-red-600">
              {contentError.message}
            </p>
          ) : !content?.length ? (
            <p className="mt-4 text-sm text-slate-500">
              No CMS content records yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="font-bold text-slate-950">
                    {item.page_key}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Updated{" "}
                    {new Date(item.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            FAQs
          </h2>

          {faqError ? (
            <p className="mt-4 text-sm text-red-600">
              {faqError.message}
            </p>
          ) : !faqs?.length ? (
            <p className="mt-4 text-sm text-slate-500">
              No FAQs yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-bold text-slate-950">
                      {faq.question}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        faq.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {faq.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
