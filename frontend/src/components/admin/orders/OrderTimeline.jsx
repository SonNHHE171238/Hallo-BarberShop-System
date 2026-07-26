import React from "react";
import { formatDateTime } from "@/utils/formatters";

export default function OrderTimeline({ historyLog }) {
  return (
    <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant/30 p-8 rounded-xl">
      <h3 className="font-headline-md text-xl text-on-surface mb-8">Lịch sử xử lý</h3>
      <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
        {!historyLog || historyLog.length === 0 ? (
          <p className="text-outline text-sm italic pl-8">Chưa có lịch sử xử lý nào được ghi nhận.</p>
        ) : (
          [...historyLog].reverse().map((log, idx) => (
            <div key={idx} className="flex gap-6 relative">
              <div className={`w-[23px] h-[23px] rounded-full border-4 border-surface-container z-10 ${idx === 0 ? "bg-primary" : "bg-white/20"}`}></div>
              <div className="flex-1 -mt-1">
                <div className="flex justify-between items-start">
                  <p className={`font-semibold ${idx === 0 ? "text-primary" : "text-on-surface"}`}>{log.action}</p>
                  <span className="font-label-md text-[11px] text-outline uppercase">{formatDateTime(log.timestamp)}</span>
                </div>
                {log.note && (
                  <p className="mt-2 text-[12px] italic text-outline bg-white/[0.03] p-3 border-l-2 border-primary/30">
                    Ghi chú: {log.note}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
