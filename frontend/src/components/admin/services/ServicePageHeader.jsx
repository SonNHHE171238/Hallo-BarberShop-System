import React from 'react';

export default function ServicePageHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
      <div>
        <h1 className="font-playfair text-display-lg leading-none italic mb-2 text-primary">Quản Lý Dịch Vụ</h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl">
          Tổ chức và tinh chỉnh danh mục dịch vụ cao cấp của bạn. Mỗi dịch vụ phản ánh di sản và sự tỉ mỉ của Hallo Barber.
        </p>
      </div>
      <button className="bg-primary text-on-primary font-headline-sm px-8 py-4 flex items-center gap-2 hover:bg-primary-fixed-dim transition-all active:scale-95 shadow-lg">
        <span className="material-symbols-outlined">add</span>
        Thêm dịch vụ mới
      </button>
    </div>
  );
}
