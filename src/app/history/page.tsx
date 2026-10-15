import React, { Suspense } from "react";
import HistoryClientView from "./HistoryClientView";

export const metadata = {
  title: "سجل الطلبات السابقة | بيتزا نوڤا",
  description: "استعرض جميع طلباتك السابقة وتفاصيلها بدلالة رقم هاتفك المحمول - مطعم بيتزا نوڤا وسط المدينة المكلا",
};

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-20 text-center text-sm text-stone-500">
          <div className="w-8 h-8 border-2 border-pizza-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>جاري تحميل سجل الطلبات...</span>
        </div>
      }
    >
      <HistoryClientView />
    </Suspense>
  );
}
