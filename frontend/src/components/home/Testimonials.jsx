import React from "react";

export default function Testimonials() {
  return (
    <section className="py-24 bg-surface-container-low border-t border-outline-variant">
      <div className="max-w-[1200px] mx-auto px-4 md:px-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-16 text-center">Khách hàng nói gì về chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-8 rounded-xl border border-outline-variant relative">
            <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-6 right-6">format_quote</span>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 italic">&quot;Không gian quá đẳng cấp, phục vụ chu đáo. Hùng cắt cực kỳ tỉ mỉ, mình rất hài lòng với kiểu tóc mới.&quot;</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high"></div>
              <div>
                <p className="text-on-surface font-headline-sm text-headline-sm">Anh Tuấn</p>
                <p className="text-outline font-label-md text-label-md">CEO at TechCorp</p>
              </div>
            </div>
          </div>
          <div className="bg-surface p-8 rounded-xl border border-outline-variant relative">
            <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-6 right-6">format_quote</span>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 italic">&quot;Lần đầu trải nghiệm cạo mặt bằng khăn nóng, cảm giác thực sự thư giãn sau một ngày làm việc mệt mỏi.&quot;</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high"></div>
              <div>
                <p className="text-on-surface font-headline-sm text-headline-sm">Nam Khánh</p>
                <p className="text-outline font-label-md text-label-md">Designer</p>
              </div>
            </div>
          </div>
          <div className="bg-surface p-8 rounded-xl border border-outline-variant relative">
            <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-6 right-6">format_quote</span>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 italic">&quot;Voucher giảm giá 20% cho khách mới rất hời. Chắc chắn sẽ quay lại và dẫn cả bạn bè tới đây.&quot;</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high"></div>
              <div>
                <p className="text-on-surface font-headline-sm text-headline-sm">Thanh Hải</p>
                <p className="text-outline font-label-md text-label-md">Freelancer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
