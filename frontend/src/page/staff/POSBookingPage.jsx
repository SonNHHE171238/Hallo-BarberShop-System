"use client";

import React, { useState } from "react";
import toast from 'react-hot-toast';

export default function POSBookingPage() {
  // State: Customer
  const [phoneInput, setPhoneInput] = useState("");
  const [customer, setCustomer] = useState(null); // { name, phone, role, points }
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerInfo, setNewCustomerInfo] = useState({ name: "", phone: "", emailOrNote: "" });

  // State: Services
  const [selectedServices, setSelectedServices] = useState([]);

  // State: Staff
  const [selectedStaff, setSelectedStaff] = useState(null);

  // State: UI
  const [showToast, setShowToast] = useState(false);

  // Mock Data
  const servicesList = [
    { id: 1, name: "The Heritage Cut", time: "45 phút • Tư vấn phong cách", price: 350000 },
    { id: 2, name: "Beard Sculpt", time: "30 phút • Trim & Shape", price: 200000 },
    { id: 3, name: "Hot Towel Shave", time: "30 phút • Massage mặt", price: 250000 },
  ];

  const staffList = [
    { id: 1, name: "Marco V.", role: "Master Barber", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwsjN4xWZ4toLEd9PiwInqKSBYZ4ltUKHatPGZGWfosk2LkhHeYyvESCclB9X3f0uB7wfR2OJC1TRmPc5WQw7Q48k19t4Anjz7SrI7CDwEd7KTdpUc4BPpQ2yfi3tYV08W8kleBxDQNwUugm1jtuGMphj026HCBW34Uykm3NbRkQst4w12AMAr_jDZtZfQUbY18fNDFxCa66lyxbfvEUszQ3RitmqRb1XqmnvQMeKs4jQ-7CCWNXFrmYPBpFxgg3vees77X6DlfCc9" },
    { id: 2, name: "Julian K.", role: "Expert Stylist", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8mZYsnGi2GYvPGFU8HmeIlRSMFi507XwJIGKBxgHyZsiYYqvWGdfwMqqZ48slWf3ISCr0odYo0Ej1P7dQtF5tIGwoRLQbYYUuQAL-B75gvngDPgGECpSyt1oA2cQTOXfFYT165tmpivoAF1WOS3TC87Q12xKL6MWOBf4POsY7Cl5s6W5eeSg-IZ4tQ8scZArytC3rxXR-IgLirqmMUz7B-syyS5oWmbIEo-tZ8Qzh-o2pTouD8yOZgG7eZS8VrQR8iQ6HABivEiXF" },
    { id: 3, name: "Sasha L.", role: "Senior Barber", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm3HX1mYoIobhNfIzeQyuI91EiyPjILstNxroLRcvvK4uODt_ZVxNoUlzjyxVpEHvq4eJJYS6DSq5ijiaTmPn8kwfe5_CEqIgBOFYU02T-l5BTWaf05mdWIxeG3pa8i_QFgHiE-VWUmuyIaVcvSjSYAFxps_U_4tnG3cDXrCE_jobP5qud_nWBKNbpqhhbDmwTve2cBdGYTSNEB6qEOHd8VLIsGfH5DueQpU6e9w-zp-RtQviH-cn7HQQMyanPyfF60L60ehWXlmYM" },
    { id: 4, name: "Arthur G.", role: "Artistic Director", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBUTB6KGB8Ct8PRo8nmlISU3s90D4-gQS_49pgRREGHqPdckCmIMaubo0lAGJ7Nbh1dN0bujWPbgkAK8-xJpe46ZVC5eIKNWE4OOsFgI6BE2Ss-X_Ow_OoTGLg1Vg8Z0A3i1VD4oP-b7neTqFGwjvtyt-hp0VDwTcNkcuyBRWc_h9LZyE_s60GOYQkhctYRBQ6w7uAi64fQBwwM4oTWHDHrQNgzM8ConOu4Yrcdp1IjHbnbt8k7pCQ8SWAV9jIDOKcVL1ORfcGl7C8" },
  ];

  // Actions
  const handleSearchCustomer = () => {
    if (!phoneInput) return;
    
    // Giả lập API
    if (phoneInput === "0901234567") {
      setCustomer({ name: "Nguyễn Văn A", phone: "0901234567", role: "customer", points: 150 });
      setShowNewCustomerForm(false);
    } else if (phoneInput === "0988888888") {
      setCustomer({ name: "Khách Vãng Lai VIP", phone: "0988888888", role: "guest", points: null });
      setShowNewCustomerForm(false);
    } else {
      setCustomer(null);
      setNewCustomerInfo(prev => ({ ...prev, phone: phoneInput }));
      setShowNewCustomerForm(true);
    }
  };

  const handleSaveNewCustomer = () => {
    // Lưu khách hàng mới vào hệ thống (giả lập)
    setCustomer({ 
      name: newCustomerInfo.name || "Khách hàng mới", 
      phone: newCustomerInfo.phone, 
      role: "guest", 
      points: null 
    });
    setShowNewCustomerForm(false);
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleConfirm = () => {
    if (selectedServices.length === 0 || !selectedStaff) {
      toast.error("Vui lòng chọn ít nhất 1 dịch vụ và 1 Barber.");
      return;
    }
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      // Reset form
      setPhoneInput("");
      setCustomer(null);
      setSelectedServices([]);
      setSelectedStaff(null);
    }, 3500);
  };

  const handlePrint = () => {
    console.log("Đang in hóa đơn...");
  };

  // Calculations
  const subTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const vat = Math.round(subTotal * 0.08);
  const total = subTotal + vat;

  return (
    <div className="w-full flex flex-col lg:flex-row max-w-[1600px] mx-auto min-h-screen">
      {/* Left Side: Selection */}
      <section className="flex-1 p-4 md:p-8 lg:p-12 border-r border-outline-variant">
        <header className="mb-10">
          <h1 className="font-headline-lg text-3xl md:text-headline-lg text-primary mb-3">Đặt Lịch Tại Quầy</h1>
          <p className="text-on-surface-variant font-body-md max-w-2xl">
            Quản lý đặt lịch nhanh cho khách vãng lai với sự chuẩn xác và đẳng cấp Heritage.
          </p>
        </header>

        {/* Customer Info Section */}
        <div className="bg-surface-container/60 backdrop-blur-xl border border-outline-variant p-6 md:p-8 rounded-xl mb-12 shadow-inner">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Tra cứu khách hàng (Số điện thoại)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-4 pl-12 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/40 transition-all font-body-md"
                    placeholder="Nhập số điện thoại..."
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                  />
                </div>
                <button 
                  onClick={handleSearchCustomer}
                  className="px-8 py-4 bg-surface-container-high border border-outline-gold text-primary rounded-lg font-label-md hover:bg-primary/10 transition-all active:scale-95 whitespace-nowrap"
                >
                  Kiểm tra
                </button>
              </div>
            </div>

            {/* Display Customer Info if found */}
            {customer && !showNewCustomerForm && (
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 flex flex-col gap-6 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-label-md text-outline-variant uppercase tracking-[0.2em]">Trạng thái tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="font-body-md font-medium text-on-surface-variant">
                        {customer.role === 'customer' ? 'Thành viên' : 'Khách vãng lai'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="text-[10px] font-label-md text-outline-variant uppercase tracking-[0.2em]">Điểm tích lũy</span>
                    <span className="font-body-md font-medium text-primary">
                      {customer.role === 'customer' ? customer.points : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-outline-variant/10">
                  <div>
                    <span className="text-[10px] font-label-md text-outline-variant uppercase tracking-[0.2em]">Tên khách hàng</span>
                    <p className="text-on-surface font-body-md text-lg">{customer.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-label-md text-outline-variant uppercase tracking-[0.2em]">Số điện thoại</span>
                    <p className="text-on-surface font-body-md text-lg">{customer.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Customer Form Dropdown */}
            {showNewCustomerForm && !customer && (
              <div className="bg-surface-container-high border border-primary/30 rounded-xl p-6 flex flex-col gap-4 animate-fade-in">
                <h3 className="font-headline-sm text-primary">Thêm Mới Khách Hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant">Tên khách hàng *</label>
                    <input 
                      type="text" 
                      className="bg-surface border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                      value={newCustomerInfo.name}
                      onChange={(e) => setNewCustomerInfo({...newCustomerInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant">Số điện thoại *</label>
                    <input 
                      type="tel" 
                      className="bg-surface border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                      value={newCustomerInfo.phone}
                      onChange={(e) => setNewCustomerInfo({...newCustomerInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-on-surface-variant">Email / Ghi chú (Tùy chọn)</label>
                    <input 
                      type="text" 
                      className="bg-surface border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                      value={newCustomerInfo.emailOrNote}
                      onChange={(e) => setNewCustomerInfo({...newCustomerInfo, emailOrNote: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button 
                    onClick={() => setShowNewCustomerForm(false)}
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded text-sm hover:bg-surface-variant transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSaveNewCustomer}
                    className="px-4 py-2 bg-primary text-on-primary rounded text-sm font-bold hover:brightness-110 transition-colors"
                  >
                    Lưu Khách Hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-1">Chọn Dịch Vụ</h2>
              <span className="font-label-md text-xs text-gold-dim">{servicesList.length} Dịch vụ hiện có tại chi nhánh</span>
            </div>
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">search</span>
              <input
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/40 transition-all text-sm font-body-md"
                placeholder="Tìm kiếm dịch vụ..."
                type="text"
              />
            </div>
          </div>

          {/* Flexible Service Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {servicesList.map(service => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`bg-surface-container/70 backdrop-blur-md p-5 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] relative overflow-hidden group border ${
                    isSelected ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-outline-variant hover:border-primary'
                  }`}
                >
                  <div className="relative z-10">
                    <h3 className={`font-headline-sm text-xl transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                      {service.name}
                    </h3>
                    <p className="font-label-md text-on-surface-variant text-xs mt-1">{service.time}</p>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <span className="font-label-md font-bold text-primary text-lg">{service.price.toLocaleString('vi-VN')}đ</span>
                    <span className={`material-symbols-outlined text-2xl transition-colors ${isSelected ? 'text-primary' : 'text-outline-variant group-hover:text-primary'}`} style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                      {isSelected ? 'check_circle' : 'add_circle'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Selection */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-1">Chỉ Định Barber</h2>
              <span className="font-label-md text-xs text-gold-dim">Đội ngũ chuyên gia đang sẵn sàng</span>
            </div>
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">search</span>
              <input
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/40 transition-all text-sm font-body-md"
                placeholder="Tìm barber..."
                type="text"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
            {staffList.map(staff => {
              const isSelected = selectedStaff?.id === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff)}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all group ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant/20 hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border transition-colors ${
                      isSelected ? 'border-primary' : 'border-outline-variant group-hover:border-primary/50'
                    }`}>
                      <img alt={staff.name} className="w-full h-full object-cover" src={staff.img} />
                    </div>
                    <div>
                      <span className={`font-label-md block font-semibold transition-colors ${
                        isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                      }`}>
                        {staff.name}
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest ${
                        isSelected ? 'text-primary/70' : 'text-on-surface-variant'
                      }`}>
                        {staff.role}
                      </span>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined transition-colors ${
                    isSelected ? 'text-primary' : 'text-outline-variant group-hover:text-primary'
                  }`}>
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right Side: Booking Summary & Checkout */}
      <aside className="w-full lg:w-[450px] bg-surface-container/30 backdrop-blur-md border-l border-outline-variant/50">
        <div className="sticky top-20 flex flex-col p-6 md:p-10 lg:p-12 h-[calc(100vh-80px)]">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8 border-b border-outline-variant/20 pb-6">
            Tóm Tắt Đặt Lịch
          </h2>

          {/* Summary List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 mb-8 pr-2">
            {selectedServices.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center mt-10">Chưa chọn dịch vụ nào</p>
            ) : (
              selectedServices.map(service => (
                <div key={service.id} className="flex justify-between items-start animate-fade-in">
                  <div>
                    <h4 className="font-body-md font-semibold text-on-surface text-lg">{service.name}</h4>
                    <p className="font-label-md text-on-surface-variant text-xs mt-1">
                      Barber: <span className="text-primary/80">{selectedStaff ? selectedStaff.name : 'Chưa chỉ định'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md font-bold text-on-surface block">{service.price.toLocaleString('vi-VN')}đ</span>
                    <button 
                      onClick={() => toggleService(service)}
                      className="text-[10px] text-error hover:underline uppercase tracking-tighter mt-1"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-outline-variant/20 pt-8 space-y-4">
            <div className="flex justify-between font-body-md text-on-surface-variant">
              <span>Tạm tính</span>
              <span className="font-label-md">{subTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between font-body-md text-on-surface-variant">
              <span>Thuế VAT (8%)</span>
              <span className="font-label-md">{vat.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between font-headline-md text-3xl text-primary pt-6">
              <span>Tổng Tiền</span>
              <span className="font-bold tracking-tight">{total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="mt-10 space-y-4">
            <button 
              onClick={handlePrint}
              className="w-full py-5 border border-outline-gold text-primary rounded-lg font-label-md font-bold flex items-center justify-center gap-3 hover:bg-primary/5 transition-all active:scale-[0.98] group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">print</span>
              IN HÓA ĐƠN TẠM
            </button>
            <button 
              onClick={handleConfirm}
              className="w-full py-5 bg-primary text-on-primary rounded-lg font-label-md font-bold flex items-center justify-center gap-3 hover:brightness-110 shadow-[0_0_20px_rgba(233,193,118,0.1)] transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">verified</span>
              XÁC NHẬN ĐẶT LỊCH
            </button>
          </div>
        </div>
      </aside>

      {/* Success Toast */}
      <div 
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-surface-container/70 backdrop-blur-xl border border-primary/50 px-10 py-5 rounded-full flex items-center gap-4 transition-all duration-500 z-[100] shadow-2xl ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <div>
          <p className="font-label-md font-bold text-on-surface">Thành công!</p>
          <p className="text-xs text-on-surface-variant">Lịch hẹn đã được ghi nhận vào hệ thống.</p>
        </div>
      </div>
    </div>
  );
}
