import React from 'react';
import Link from 'next/link';

export default function StaffDashboard() {
  return (
    <div className="w-full">
      {/* Dashboard Content */}

          {/* Dashboard Content */}
          <div className="p-12 space-y-12 max-w-[1400px] mx-auto">
            {/* Welcome Header & Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h2 className="font-display-lg text-4xl text-on-surface mb-2">Chào buổi sáng, Quản trị viên</h2>
                <p className="text-on-surface-variant font-body-md flex items-center">
                  <span className="material-symbols-outlined mr-2 text-sm">calendar_today</span>
                  Hôm nay là Thứ Tư, ngày 24 tháng 5, 2024
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg font-body-md text-sm font-bold hover:bg-primary/5 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Tạo đặt lịch mới
                </button>
                <Link href="/staff/pos" className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-body-md text-sm font-bold hover:brightness-110 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-lg">point_of_sale</span>
                  Mở POS
                </Link>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant font-medium text-sm">Lịch hẹn hôm nay</span>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold font-headline-md text-primary">24</span>
                  <span className="text-xs text-green-400 flex items-center bg-green-400/10 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-xs mr-1">trending_up</span> +15%
                  </span>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant font-medium text-sm">Thợ đang hoạt động</span>
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <span className="material-symbols-outlined text-secondary">content_cut</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold font-headline-md text-on-surface">6<span className="text-on-surface-variant font-normal text-xl">/8</span></span>
                  <span className="text-xs text-on-surface-variant">Công suất 75%</span>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant font-medium text-sm">Doanh thu dự kiến</span>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-primary">payments</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold font-headline-md text-on-surface">8.5M<span className="text-lg ml-1">₫</span></span>
                  <span className="text-xs text-on-surface-variant">Dựa trên lịch đặt</span>
                </div>
              </div>
              <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant font-medium text-sm">Khách chờ</span>
                  <div className="p-2 bg-error/10 rounded-lg">
                    <span className="material-symbols-outlined text-error">hourglass_empty</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold font-headline-md text-error">3</span>
                  <span className="text-xs text-on-surface-variant">~15 phút trung bình</span>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Appointments List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
                    <span className="material-symbols-outlined mr-3 text-primary">list_alt</span>
                    Lịch hẹn sắp tới
                  </h3>
                  <a className="text-xs font-bold text-primary hover:underline underline-offset-4 tracking-widest uppercase" href="#">Xem tất cả</a>
                </div>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface-container-high">
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Thời gian</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Khách hàng</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Dịch vụ</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Barber</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        <tr className="hover:bg-primary/5 transition-colors group">
                          <td className="px-6 py-5 font-label-md text-primary font-bold">09:30</td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">Nguyễn Văn A</p>
                            <p className="text-[10px] text-on-surface-variant">+84 901 *** 888</p>
                          </td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant italic">Combo Cắt & Gội</td>
                          <td className="px-6 py-5 text-sm font-medium">Marco V.</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-surface-variant text-[10px] font-bold text-on-surface-variant rounded uppercase tracking-wider">Đang chờ</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors group">
                          <td className="px-6 py-5 font-label-md text-primary font-bold">10:15</td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">Trần Thị B</p>
                            <p className="text-[10px] text-on-surface-variant">+84 988 *** 234</p>
                          </td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant italic">Phục hồi tóc</td>
                          <td className="px-6 py-5 text-sm font-medium">Julian K.</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-primary/10 text-[10px] font-bold text-primary rounded uppercase tracking-wider">Sắp đến</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-primary/5 transition-colors group">
                          <td className="px-6 py-5 font-label-md text-primary font-bold">11:00</td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">Lê Văn C</p>
                            <p className="text-[10px] text-on-surface-variant">+84 912 *** 999</p>
                          </td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant italic">Cạo mặt & Massage</td>
                          <td className="px-6 py-5 text-sm font-medium">Sasha L.</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-green-400/10 text-[10px] font-bold text-green-400 rounded uppercase tracking-wider">Đã xác nhận</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Quick Inventory Check */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
                    <div>
                      <p className="font-bold">Sắp hết hàng!</p>
                      <p className="text-xs text-on-surface-variant">Pomade Gỗ Đàn Hương còn 2 hũ trong kho.</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Kiểm tra kho</button>
                </div>
              </div>

              {/* Right Column: Barber Status */}
              <div className="space-y-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center">
                  <span className="material-symbols-outlined mr-3 text-primary">person_search</span>
                  Trạng thái Barber
                </h3>
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden">
                          <img className="w-full h-full object-cover" alt="Barber" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhFe_nXeSjGBPV75SLjUvDv_YD4Oka0AE0YblUul_Oe6bmzbKe3G7_eW8QewneMvatlSEtaNHIe5-EV-NRhbkyfjlnqJJ8JxgAB6OHTAqnU3S1-c4Jkh-m5s2t7XyUygfpIpgf9TN7F6heC87flqKUuirb_OUh_RDI0_w2bNDJrUUZY0sHRp7avZQMECmZHtppRjbsTNcUN93cy_iZox49b6Dc2MKXjd6IOfsqXqE5smyD8rBPVhSv5m7sISGgHRmw1QMYd-b1DFVm" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-error border-2 border-surface rounded-full"></span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Marco V.</p>
                        <p className="text-[10px] text-on-surface-variant italic">Master Barber</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-error uppercase tracking-widest bg-error/10 px-2 py-1 rounded">Đang cắt</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden grayscale">
                          <img className="w-full h-full object-cover" alt="Barber" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt9C94gSFt1__JWG7eshAQ8r6bHA9mebwNONw5vFaoAAuBRiv6_0ZSlV2tIeo8Z_HgV4LpzY5dY0Kl8PQ_6UX_mB6kKi5iPGr4kxFlBjUaUqaQinzpGOZVwrykowLy8GHdVAWPTwL9wU1HZnDNgKDt6uyrzNmUefKDZMF6uLkpXDQsioXb1RrAeUzEHpzsp11cqOnwLxfvIN_mR_2q25HR041kK7WMEF7KZ5LvIZZChPgT6HTK2WkM9MwDXKNxEi0fMeZPtlM3qNyi" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-on-surface-variant border-2 border-surface rounded-full"></span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Julian K.</p>
                        <p className="text-[10px] text-on-surface-variant italic">Senior Barber</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-variant px-2 py-1 rounded">Đang nghỉ</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden group-hover:grayscale-0 transition-all">
                          <img className="w-full h-full object-cover" alt="Barber" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA46lkz0bQ1nlyEUOFgOU3NMRgtoVR-I5XNyKJLiTeIU1Aw5wfc_fCxEkOKQvbdKVeWZODo5TEwE9PVurl0og8XD0nGAWyF82cu4OFsRKf4C8ObRlPha8XSaStIxguxMuRN6NWtM0DV6FMLbGkK1AD0-4k-4Y9o-iyuRqp45ZSSciBgwOYs853KG6fFm3cBrqnL7MeCqtgth9b_Mpz0tVbCtFoyEulr5Nro56Lbgtlw3CtRCKYWIraVvKP_F9rJK7XXcBADm8SBpQa4" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full animate-pulse"></span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Sasha L.</p>
                        <p className="text-[10px] text-on-surface-variant italic">Senior Barber</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded">Sẵn sàng</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden">
                          <img className="w-full h-full object-cover" alt="Barber" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfieutpL-NHpVc-Wkt-q1oSyJkK4f9wbIp8WLAvp3wclXiGlk4z4ItWcPFxUSthd8LI32M4EfFoLPk-3V_z9tYB9IUJsTZsxRv17s_A6p04evWUZFSX5CUyaPbp1DxiEz1cjqNyYktj16ch6HapMdhoUXNnaaUiYCzfIzV9v9m9cTGPr5s8Pnt-Kn1Vvg6O5DukEj4SaVB0Cw5fE2RPC4Qo9A0CU4Y6bOTXvHtIgCSQo40YLJRjSC9-WFpxCNX0da5_hVe5E1VPohR" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Victor R.</p>
                        <p className="text-[10px] text-on-surface-variant italic">Junior Stylist</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded">Sẵn sàng</span>
                  </div>
                </div>

                {/* Shift Overview */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <p className="font-bold text-sm flex items-center">
                    <span className="material-symbols-outlined mr-2 text-primary">schedule</span>
                    Ca làm việc hiện tại
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Thời gian còn lại</span>
                      <span className="text-on-surface">4h 15p</span>
                    </div>
                    <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[65%] shadow-[0_0_10px_rgba(233,193,118,0.4)]"></div>
                    </div>
                    <p className="text-[10px] text-on-surface-variant italic text-center">Kết thúc lúc 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
