import React from "react";

export default function MessageBubble({ 
  msg, 
  setMenuData, 
  setSelectedServices, 
  setIsMenuOpen, 
  setBarberData, 
  setSelectedBarber, 
  setIsBarberMenuOpen 
}) {
  if (msg.isAdvice) {
    const { advice, previewImageUrl, matchedServices } = msg.data;
    return (
      <div className="flex justify-start">
        <div className="max-w-[95%] rounded-2xl p-4 text-sm font-body-md bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm flex flex-col gap-3">
          <div className="font-bold text-primary">💈 Kết quả Phân tích & Tư vấn</div>
          <div className="text-sm">
            <p><strong>Dáng mặt:</strong> {advice?.faceShape}</p>
            <p><strong>Nhận xét tóc:</strong> {advice?.currentHairObservation}</p>
            <p className="mt-2 text-primary font-medium">{advice?.overallAdvice}</p>
          </div>

          {previewImageUrl ? (
            <div className="mt-2">
              <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Ảnh mô phỏng (AI Preview):</p>
              <img src={previewImageUrl} alt="AI Preview" className="w-full h-auto rounded-xl border border-outline-variant shadow-md" onError={(e) => e.target.style.display = 'none'} />
            </div>
          ) : (
            <div className="mt-2 p-2 bg-surface-container-highest rounded-lg text-xs italic text-on-surface-variant flex items-center gap-2 border border-outline-variant/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Chưa tạo được ảnh preview, chỉ hiển thị tư vấn.
            </div>
          )}

          {advice?.recommendedStyles && advice.recommendedStyles.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-2">Đề xuất hàng đầu:</p>
              <div className="flex flex-col gap-2">
                {advice.recommendedStyles.slice(0, 3).map((style, sIdx) => (
                  <div key={sIdx} className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
                    <p className="font-bold text-primary">{style.styleName}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{style.description}</p>
                    <p className="text-xs text-secondary mt-1"><strong>Lý do:</strong> {style.whyItFits}</p>
                    <p className="text-xs italic text-on-surface mt-1 bg-surface-container-highest p-1.5 rounded">Ghi chú cho thợ: &quot;{style.barberInstruction}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedServices && matchedServices.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Dịch vụ phù hợp tại Shop:</p>
              <div className="flex flex-wrap gap-1">
                {matchedServices.map((svc, svcIdx) => (
                  <span key={svcIdx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                    {svc.name} - {svc.price.toLocaleString('vi-VN')}đ
                  </span>
                ))}
              </div>
            </div>
          )}

          {advice?.barberNote && (
            <div className="mt-2 p-2 bg-error/10 text-error rounded-lg text-xs font-medium border border-error/20">
              <strong>Lời nhắn cho thợ:</strong> {advice.barberNote}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (msg.isMenu) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl p-3 text-sm font-body-md flex flex-col gap-2 bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm">
          {msg.content && <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
          <button
            onClick={() => { setMenuData(msg.services); setSelectedServices([]); setIsMenuOpen(true); }}
            className="mt-2 bg-primary text-on-primary py-2 px-4 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-primary-fixed transition-colors text-center shadow-md flex justify-center items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Mở Menu Dịch Vụ
          </button>
        </div>
      </div>
    );
  }

  if (msg.isBarberMenu) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl p-3 text-sm font-body-md flex flex-col gap-2 bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm">
          {msg.content && <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
          <button
            onClick={() => { setBarberData(msg.barbers); setSelectedBarber(null); setIsBarberMenuOpen(true); }}
            className="mt-2 bg-secondary text-on-secondary py-2 px-4 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-secondary-fixed transition-colors text-center shadow-md flex justify-center items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Mở Danh Sách Thợ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-3 text-sm font-body-md flex flex-col gap-2 ${msg.role === 'user'
          ? 'bg-primary text-on-primary rounded-br-none shadow-md shadow-primary/10'
          : msg.role === 'system'
            ? 'bg-surface-container border border-outline-variant text-on-surface-variant italic text-center w-full rounded-xl text-xs'
            : 'bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm'
          }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {msg.image && (
          <img src={msg.image} alt="User Upload" className="max-w-full rounded-lg object-contain" />
        )}
        {msg.content && <span>{msg.content}</span>}
      </div>
    </div>
  );
}
