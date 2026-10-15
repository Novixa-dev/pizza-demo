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
        href="https://novixa.dev/ar/contact"
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-[#EFCC80] text-stone-900 px-3 py-0.5 font-bold hover:opacity-90"
      >
        اطلب نسخة لمطعمك
      </a>
    </div>
  );
}
