import React from 'react';

export default function CuratedProducts() {
  return (
    <section className="flex flex-col gap-10 pt-4">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-md text-3xl text-on-surface serif-title">Dành Riêng Cho Bạn</h2>
          <p className="text-on-surface-variant italic mt-1">Những sản phẩm thiết yếu được các nghệ nhân của chúng tôi tuyển chọn.</p>
        </div>
        <a className="font-label-md text-xs text-primary-container uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 font-bold" href="#">
          Xem Cửa Hàng <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
        </a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Product 1 */}
        <div className="group flex flex-col gap-5 cursor-pointer">
          <div className="aspect-[4/5] bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden relative">
            <img 
              alt="Sáp Vuốt Tóc Matte" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ1KYs5ckr317ygJbQ0jJR_AJ8TOfgr5AA8lGb11uAVrzd679Jf6MIfuKv2M2yQSMHK7JudumYhshuX7EGbnVxM3LzjUEKYtdgI-gBWJJVnN8n3aLpSVwIcSN6sMnVmsH0v_r9XivIxDEAmeVMMVLd6cYn5ABDn3CRfInjmv8TV341qoG59jTWr947h9FVQY3DWTle-cKJe4jBbG8q7bhApUAWu8En9NyFYp1_hv0FkHnOZlPkPtOEMNS7kHN4zAeEyiQVqxHYwNO2"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <button className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-md text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
              Thêm vào Routine
            </button>
          </div>
          <div className="flex justify-between items-start px-1">
            <div>
              <div className="font-label-md text-[10px] text-primary-container uppercase tracking-[0.2em] mb-1 font-bold">Tạo kiểu</div>
              <div className="font-headline-sm text-lg text-on-surface serif-title">Sáp Obsidian Matte</div>
            </div>
            <div className="font-body-md text-on-surface-variant font-bold">$34</div>
          </div>
        </div>

        {/* Product 2 */}
        <div className="group flex flex-col gap-5 cursor-pointer">
          <div className="aspect-[4/5] bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden relative">
            <img 
              alt="Dầu Dưỡng Râu" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB14T1v5IrnyROvraJhbDg98V9KBl3pq_1BqFsDTriKu8HEgNJNx8hc4xA0frQvl3pED1DvmGLeRgv7z9_jw5q4s6Blj_9VQ9xqh7p3l1NrG8cOScdOvrutUrtW2c6PF1iEUJPRZzXrMwRFP07nD5y7PRrVOc9vFJrdjwMjmNt4dBCbtmKFjB05QfKK-gNtI_Uo4j3zAjrS2EMjRyAEFFI7LmHWIF5StxUcdLT5-K8A5KHDe4vsrEFQPDq6tg9dghW2wj8rzIPPKDm4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <button className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-md text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
              Thêm vào Routine
            </button>
          </div>
          <div className="flex justify-between items-start px-1">
            <div>
              <div className="font-label-md text-[10px] text-primary-container uppercase tracking-[0.2em] mb-1 font-bold">Nuôi dưỡng</div>
              <div className="font-headline-sm text-lg text-on-surface serif-title">Serum Dưỡng Râu Precision</div>
            </div>
            <div className="font-body-md text-on-surface-variant font-bold">$42</div>
          </div>
        </div>

        {/* Product 3 */}
        <div className="group flex flex-col gap-5 cursor-pointer">
          <div className="aspect-[4/5] bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden relative">
            <img 
              alt="Tẩy Tế Bào Chết" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2oqt_Fc77VIHleh0Y3S9ht50OH6kE_8lBioZdkPnhtLt2kN3RUast6Tce7x44CKA39xuWrcuzncZtUToZdxin1O1LshBqX9B6kUXYe4zRiz_cEzndiDuzyD_djK3JbHjgQ08uVzs9AW67r6q1AMEJx7JMT0SydUzXnzyWlJGJ1GULiJ7yuHD9IEpvKmeWaBZRTVlq1MPuLJuMLn_qIVj3C3l1KCz9G8HLSSFhW-k_I4zv9dc5fXlmCEdbav9bFF7_tskVCddeghyl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <button className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-md text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
              Thêm vào Routine
            </button>
          </div>
          <div className="flex justify-between items-start px-1">
            <div>
              <div className="font-label-md text-[10px] text-primary-container uppercase tracking-[0.2em] mb-1 font-bold">Dưỡng da</div>
              <div className="font-headline-sm text-lg text-on-surface serif-title">Tẩy Da Chết Than Hoạt Tính</div>
            </div>
            <div className="font-body-md text-on-surface-variant font-bold">$28</div>
          </div>
        </div>

        {/* Browse Card */}
        <div className="group flex flex-col gap-5 cursor-pointer">
          <div className="aspect-[4/5] bg-surface-container-low border border-outline-variant rounded-lg flex items-center justify-center relative hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-outline-variant text-6xl group-hover:text-primary-container transition-all group-hover:scale-110">auto_awesome</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm">
              <span className="font-label-md text-xs uppercase text-on-surface tracking-[0.3em] border border-primary-container/40 px-6 py-3 rounded-full bg-background/80 font-bold">Xem Toàn Bộ</span>
            </div>
          </div>
          <div className="flex justify-between items-start px-1">
            <div>
              <div className="font-label-md text-[10px] text-primary-container uppercase tracking-[0.2em] mb-1 font-bold">Tất cả sản phẩm</div>
              <div className="font-headline-sm text-lg text-on-surface-variant serif-title">Khám Phá Các Nghệ Nhân</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
