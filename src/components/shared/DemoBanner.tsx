/**
 * Sticky notice shown on the public demo build so visitors know this is a
 * Novixa showcase, not a real restaurant. Hidden when NEXT_PUBLIC_DEMO_MODE=false
 * (i.e. when the system is deployed for a paying client).
 */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export default function DemoBanner() {
  if (!IS_DEMO) return null;

  return (
    <div
      role="note"
      className="w-full bg-stone-900 text-stone-100 text-xs sm:text-sm font-cairo px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center"
    >
      <span>
        نسخة عرض تجريبية من نظام <strong>Novixa Restaurant</strong> — المطعم والأسعار والأرقام افتراضية. جرّب الطلب كما يفعل زبونك.
      </span>
      <a
        href="https://wa.me/967776248526?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D9%86%D8%B8%D8%A7%D9%85%20%D8%B7%D9%84%D8%A8%D8%A7%D8%AA%20%D9%84%D9%85%D8%B7%D8%B9%D9%85%D9%8A"
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-[#EFCC80] text-stone-900 px-3 py-0.5 font-bold hover:opacity-90"
      >
        اطلب نسخة لمطعمك
      </a>
    </div>
  );
}
