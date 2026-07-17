"use client";

import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { bookingService } from "@/services/booking.service";
import { staffDashboardService } from "@/services/staffDashboard.service";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import POSServiceList from "@/components/staff/pos/POSServiceList";
import POSSummaryCard from "@/components/staff/pos/POSSummaryCard";
import axios from "axios";

export default function POSBookingPage() {
  // State: Customer
  const [phoneInput, setPhoneInput] = useState("");
  const [customer, setCustomer] = useState(null); // { name, phone, role, points, _id }
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerInfo, setNewCustomerInfo] = useState({ name: "", phone: "", emailOrNote: "" });

  // State: Services & Products & Staff (Dynamic)
  const [allItems, setAllItems] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // MULTIPLE selection
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("priceAsc");
  
  // State: Time & Modal
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if cart has services
  const hasServices = selectedItems.some(item => item.itemType === 'service');
  const hasProducts = selectedItems.some(item => item.itemType === 'product');

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicesRes, barbersRes, productsRes] = await Promise.all([
          bookingService.getServices().catch(() => null),
          bookingService.getBarbers().catch(() => null),
          axios.get("http://localhost:5000/api/products?limit=1000", { withCredentials: true }).catch(() => null)
        ]);
        
        let combined = [];

        if (servicesRes && servicesRes.services) {
          const srvs = servicesRes.services.map(s => ({ ...s, itemType: 'service' }));
          combined = [...combined, ...srvs];
        }
        
        if (productsRes && productsRes.data && productsRes.data.success) {
          const prods = productsRes.data.data.products.map(p => ({ ...p, itemType: 'product', quantity: 1 })); // Default quantity 1 for POS click
          combined = [...combined, ...prods];
        }
        
        setAllItems(combined);

        if (barbersRes && barbersRes.barbers) {
          setStaffList(barbersRes.barbers);
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu.");
      }
    };
    fetchInitialData();
  }, []);

  // Actions
  const normalizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const isLikelyEmail = (value) => value.includes('@');

  const handlePhonePaste = (e, setter) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = normalizePhone(paste);
    if (cleaned.length === 0) {
      e.preventDefault();
    } else {
      e.preventDefault();
      setter(cleaned.slice(0, 10));
    }
  };

  const handleSearchCustomer = async () => {
    if (!phoneInput || phoneInput.length !== 10) {
      toast.error("Nhập đúng 10 chữ số điện thoại.");
      return;
    }
    try {
      const customerData = await staffDashboardService.searchCustomerByPhone(phoneInput);
      if (customerData) {
        setCustomer({ 
          _id: customerData._id,
          name: customerData.name, 
          phone: customerData.phone, 
          role: "customer", 
          points: customerData.loyaltyPoints || 0 
        });
        setShowNewCustomerForm(false);
        toast.success(`Đã tìm thấy thành viên: ${customerData.name}`);
      } else {
        setCustomer(null);
        setNewCustomerInfo(prev => ({ ...prev, phone: phoneInput }));
        setShowNewCustomerForm(true);
        toast.error("Không tìm thấy, vui lòng nhập mới khách vãng lai.");
      }
    } catch (error) {
      toast.error("Lỗi khi tra cứu số điện thoại.");
    }
  };

  const handleSaveNewCustomer = () => {
    if (!newCustomerInfo.name || !newCustomerInfo.phone) {
      toast.error("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    if (newCustomerInfo.phone.length !== 10) {
      toast.error("Số điện thoại phải có 10 chữ số.");
      return;
    }

    const emailText = newCustomerInfo.emailOrNote.trim();
    let email;
    let note;

    if (emailText) {
      if (isLikelyEmail(emailText)) {
        if (!isValidEmail(emailText)) {
          toast.error("Email không hợp lệ.");
          return;
        }
        email = emailText;
      } else {
        note = emailText;
      }
    }

    setCustomer({ 
      name: newCustomerInfo.name, 
      phone: newCustomerInfo.phone, 
      role: "guest", 
      points: null,
      email,
      note,
    });
    setShowNewCustomerForm(false);
  };

  const selectItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i._id === item._id);
      if (isSelected) {
        return prev.filter(i => i._id !== item._id);
      } else {
        return [...prev, item];
      }
    });
  };

  const increaseQuantity = (itemId) => {
    setSelectedItems(prev => prev.map(item => {
      if (item._id === itemId && item.itemType === 'product') {
        if (item.stock && item.quantity >= item.stock) {
          toast.error(`Sản phẩm này chỉ còn ${item.stock} trong kho!`);
          return item;
        }
        return { ...item, quantity: (item.quantity || 1) + 1 };
      }
      return item;
    }));
  };

  const decreaseQuantity = (itemId) => {
    setSelectedItems(prev => prev.map(item => {
      if (item._id === itemId && item.itemType === 'product') {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
      }
      return item;
    }));
  };

  const openTimeModalOrCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 dịch vụ hoặc sản phẩm.");
      return;
    }
    if (!customer) {
      toast.error("Vui lòng nhập thông tin khách hàng trước!");
      return;
    }

    if (hasServices) {
      // If there's a service, must select Barber and open Time Modal
      if (!selectedStaff) {
        toast.error("Vui lòng chọn 1 Barber cho dịch vụ.");
        return;
      }
      setShowTimeModal(true);
    } else {
      // Only products -> Direct Checkout
      await handleProcessBoth(true); 
    }
  };

  // Hàm xử lý chung: Sinh ra Booking (nếu có service) và Order (nếu có product)
  const handleProcessBoth = async (onlyProducts = false) => {
    if (!onlyProducts) {
      if (!selectedDate || !selectedTime) {
        toast.error("Vui lòng chọn ngày và giờ cắt.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const servicesOnly = selectedItems.filter(i => i.itemType === 'service');
      const productsOnly = selectedItems.filter(i => i.itemType === 'product');

      let orderRes = null;
      let bookingRes = null;

      // 1. Nếu có sản phẩm -> Tạo Order
      if (productsOnly.length > 0) {
        const orderPayload = {
          items: productsOnly.map(p => ({
            productId: p._id,
            quantity: p.quantity || 1
          })),
          customerName: customer ? customer.name : "Khách vãng lai",
          customerPhone: customer ? customer.phone : "",
          shippingAddress: "Mua tại cửa hàng",
          paymentMethod: "cash",
        };
        // Gửi bằng axios với credentials
        orderRes = await axios.post("http://localhost:5000/api/orders", orderPayload, { withCredentials: true });
      }

      // 2. Nếu có dịch vụ -> Tạo Booking
      if (servicesOnly.length > 0) {
        const bookingPayload = {
          services: servicesOnly.map(s => s._id),
          barberId: selectedStaff._id || selectedStaff.id,
          bookingDate: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
          date: selectedDate,
          timeSlot: selectedTime,
          bookingType: customer && customer.role === 'customer' ? "user" : "guest",
          customerId: customer && customer.role === 'customer' ? customer._id : undefined,
          durationMinutes: servicesOnly.reduce((acc, curr) => acc + (curr.durationMinutes || curr.duration || 30), 0),
          customerName: customer ? customer.name : "",
          customerPhone: customer ? customer.phone : "",
          note: customer?.note || "",
          customerEmail: customer?.email || undefined,
        };
        bookingRes = await bookingService.createBookingSinglePage(bookingPayload);
      }

      toast.success("Thanh toán / Lên lịch thành công!");
      setShowTimeModal(false);
      
      // Reset form
      setPhoneInput("");
      setCustomer(null);
      setSelectedItems([]);
      setSelectedStaff(null);
      setSelectedDate("");
      setSelectedTime("");
      setSearchTerm("");
      setNewCustomerInfo({ name: "", phone: "", emailOrNote: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo đơn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    toast("Tính năng in hóa đơn đang được phát triển", { icon: "🖨️" });
  };

  // Calculations
  const subTotal = selectedItems.reduce((acc, curr) => {
    const qty = curr.itemType === 'product' ? (curr.quantity || 1) : 1;
    return acc + ((curr.price || 0) * qty);
  }, 0);
  const vat = Math.round(subTotal * 0.08);
  const total = subTotal + vat;

  // Filtered + Sorted items for display
  const displayedItems = allItems
        .filter(i => {
          if (searchTerm.trim() === "") return true;
          const term = searchTerm.trim().toLowerCase();
          return (i.name || '').toLowerCase().includes(term) || (i.description || '').toLowerCase().includes(term);
        })
        .sort((a, b) => {
          const pa = a.price || 0;
          const pb = b.price || 0;
          if (sortOrder === 'priceAsc') return pa - pb;
          return pb - pa;
        });

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row max-w-[1600px] mx-auto overflow-hidden bg-surface-container-lowest">
      {/* Left Side: Selection */}
      <section className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col overflow-hidden">




        {/* Services & Products Section */}
        <POSServiceList 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          displayedItems={displayedItems}
          selectedItems={selectedItems}
          selectItem={selectItem}
        />

        {/* Staff Selection (Only show if there's at least one service selected) */}
        {hasServices && (
          <div className="mt-4 pt-4 border-t border-outline-variant/30 shrink-0 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-headline-sm text-lg text-on-surface mb-1">Chỉ Định Barber</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
              {staffList.map(staff => {
                const isSelected = selectedStaff && (selectedStaff._id === staff._id);
                const name = staff.userId?.name || "Unknown Barber";
                const title = staff.specialties?.join(", ") || "Stylist";
                const imageUrl = staff.profileImageUrl;
                const firstChar = name.charAt(0).toUpperCase();

                return (
                  <div
                    key={staff._id || staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all group ${
                      isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant/20 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border transition-colors flex items-center justify-center bg-surface-container ${
                        isSelected ? 'border-primary' : 'border-outline-variant group-hover:border-primary/50'
                      }`}>
                        {imageUrl ? (
                          <img alt={name} className="w-full h-full object-cover" src={imageUrl} />
                        ) : (
                          <span className="text-primary font-bold">{firstChar}</span>
                        )}
                      </div>
                      <div>
                        <span className={`font-label-md block font-semibold transition-colors ${
                          isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                        }`}>
                          {name}
                        </span>
                        <span className={`text-[10px] uppercase tracking-widest line-clamp-1 ${
                          isSelected ? 'text-primary/70' : 'text-on-surface-variant'
                        }`}>
                          {title}
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
        )}
      </section>

      {/* Right Side: Booking Summary & Checkout */}
      <POSSummaryCard 
        selectedItems={selectedItems}
        hasServices={hasServices}
        selectedStaff={selectedStaff}
        subTotal={subTotal}
        vat={vat}
        total={total}
        decreaseQuantity={decreaseQuantity}
        increaseQuantity={increaseQuantity}
        selectItem={selectItem}
        handlePrint={handlePrint}
        openTimeModalOrCheckout={openTimeModalOrCheckout}
        // Customer passdown
        phoneInput={phoneInput}
        setPhoneInput={setPhoneInput}
        handleSearchCustomer={handleSearchCustomer}
        handlePhonePaste={handlePhonePaste}
        customer={customer}
        setCustomer={setCustomer}
        setShowNewCustomerForm={setShowNewCustomerForm}
        normalizePhone={normalizePhone}
      />

      {/* Modal: New Customer */}
      {showNewCustomerForm && !customer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-surface-obsidian/60 backdrop-blur-sm" onClick={() => setShowNewCustomerForm(false)}></div>
          <div className="relative bg-surface border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-fade-in slide-in-from-bottom-4">
            <button 
              onClick={() => setShowNewCustomerForm(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary">person_add</span>
              </div>
              <h2 className="font-headline-sm text-xl text-on-surface">Thêm Khách Mới</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-outline-variant">Tên khách hàng <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
                  value={newCustomerInfo.name}
                  onChange={(e) => setNewCustomerInfo({...newCustomerInfo, name: e.target.value})}
                  placeholder="Nguyễn Văn A..."
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-outline-variant">Số điện thoại <span className="text-error">*</span></label>
                <input 
                  type="tel" 
                  className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
                  value={newCustomerInfo.phone}
                  onChange={(e) => setNewCustomerInfo({...newCustomerInfo, phone: normalizePhone(e.target.value)})}
                  onPaste={(e) => handlePhonePaste(e, (val) => setNewCustomerInfo(prev => ({ ...prev, phone: val })))}
                  placeholder="0912345678"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-outline-variant">Email / Ghi chú</label>
                <input 
                  type="text" 
                  className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
                  value={newCustomerInfo.emailOrNote}
                  onChange={(e) => setNewCustomerInfo({...newCustomerInfo, emailOrNote: e.target.value})}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v.includes('@') && !isValidEmail(v)) {
                      toast.error('Email không hợp lệ.');
                    }
                  }}
                  placeholder="email@example.com hoặc ghi chú đặc biệt"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-outline-variant/30">
              <button 
                onClick={() => setShowNewCustomerForm(false)}
                className="px-5 py-2.5 border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-surface-variant transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveNewCustomer}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                Lưu Khách Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Selection Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTimeModal(false)}></div>
          <div className="relative bg-surface border border-outline-variant/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in custom-scrollbar">
            <button 
              onClick={() => setShowTimeModal(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            
            <h2 className="font-headline-md text-2xl text-primary mb-6">Chọn Giờ Cắt</h2>
            
            <div className="mb-8">
              <DateTimeSelection 
                selectedBarber={selectedStaff}
                selectedServices={selectedItems.filter(i => i.itemType === 'service')}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />
            </div>

            <div className="flex justify-end gap-4 border-t border-outline-variant/20 pt-6 mt-8">
              <button 
                onClick={() => setShowTimeModal(false)}
                className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg font-label-md hover:bg-surface-variant transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleProcessBoth(false)}
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md font-bold hover:brightness-110 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                )}
                CHỐT ĐƠN KHÁCH HÀNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
