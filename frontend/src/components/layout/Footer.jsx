import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-16 py-16 max-w-[1200px] mx-auto">
        <div className="space-y-6">
          <div className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">HALLO BARBER</div>
          <p className="text-on-surface-variant font-body-md text-body-md">Sự chính xác trong từng đường cắt. Nơi định hình phong cách quý ông hiện đại.</p>
          <div className="flex gap-4">
            <Link
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors group"
              href="https://www.facebook.com/HalloBarberHoaLac"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5 fill-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-on-surface font-headline-sm text-headline-sm mb-6">Dịch vụ</h4>
          <ul className="space-y-4">
            <li><Link className="text-on-surface-variant hover:text-secondary transition-colors duration-300 font-body-md text-body-md" href="#">Cắt tóc nam</Link></li>
            <li><Link className="text-on-surface-variant hover:text-secondary transition-colors duration-300 font-body-md text-body-md" href="#">Cạo mặt & Râu</Link></li>
            <li><Link className="text-on-surface-variant hover:text-secondary transition-colors duration-300 font-body-md text-body-md" href="#">Uốn tóc Modern</Link></li>
            <li><Link className="text-on-surface-variant hover:text-secondary transition-colors duration-300 font-body-md text-body-md" href="#">Combo chăm sóc</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-surface font-headline-sm text-headline-sm mb-6">Liên hệ</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md">
              <span className="material-symbols-outlined text-primary text-sm">call</span> 098 665 87 95
            </li>
            <li className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md">
              <span className="material-symbols-outlined text-primary text-sm">location_on</span> Khu CNC Hòa Lạc, Hà Nội
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-on-surface font-headline-sm text-headline-sm mb-6">Đăng ký nhận tin</h4>
          <p className="text-on-surface-variant font-body-md text-body-md mb-4">Nhận ưu đãi sớm nhất từ chúng tôi.</p>
          <div className="flex gap-2">
            <input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-on-surface w-full focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Email của bạn" type="email" />
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg material-symbols-outlined flex-shrink-0">send</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
