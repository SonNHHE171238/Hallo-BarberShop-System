"use client";

import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { bookingService } from "@/services/booking.service";
import { staffDashboardService } from "@/services/staffDashboard.service";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
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
  // REQUIREMENT: không hiển thị 1 list ra POS trước (Chỉ hiện khi có Search)
  const displayedItems = searchTerm.trim() === "" 
    ? [] 
    : allItems
        .filter(i => {
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
    <div className="w-full flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto overflow-hidden h-full">
      {/* Left Side: Selection */}
      <section className="flex-1 p-4 md:p-8 lg:p-12 border-r border-outline-variant overflow-y-auto custom-scrollbar pb-32">
        <header className="mb-10">
          <h1 className="font-headline-lg text-3xl md:text-headline-lg text-primary mb-3">POS & Thu Ngân</h1>
          <p className="text-on-surface-variant font-body-md max-w-2xl">
            Tạo lịch cắt hoặc thanh toán mua sản phẩm trực tiếp tại quầy một cách nhanh chóng.
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
                    placeholder="Nhập số điện thoại khách hàng..."
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(normalizePhone(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                    onPaste={(e) => handlePhonePaste(e, setPhoneInput)}
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
                        onChange={(e) => setNewCustomerInfo({...newCustomerInfo, phone: normalizePhone(e.target.value)})}
                        onPaste={(e) => handlePhonePaste(e, (val) => setNewCustomerInfo(prev => ({ ...prev, phone: val })))}
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-on-surface-variant">Email / Ghi chú (Tùy chọn)</label>
                    <input 
                      type="text" 
                      className="bg-surface border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                      value={newCustomerInfo.emailOrNote}
                        onChange={(e) => setNewCustomerInfo({...newCustomerInfo, emailOrNote: e.target.value})}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v.includes('@') && !isValidEmail(v)) {
                            toast.error('Email không hợp lệ.');
                          }
                        }}
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

        {/* Services & Products Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-1">Thêm Dịch vụ / Sản phẩm</h2>
              <span className="font-label-md text-xs text-gold-dim">Tìm kiếm để thêm vào giỏ hàng POS</span>
            </div>
            <div className="relative w-full md:max-w-md flex items-center gap-3">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">search</span>
              <input
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary text-on-surface placeholder:text-outline-variant/40 transition-all text-sm font-body-md"
                placeholder="Ví dụ: Cắt tóc, sáp vuốt..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-surface-container border border-outline-variant rounded-lg h-11 px-3 text-sm"
                aria-label="Sắp xếp theo giá"
              >
                <option value="priceAsc">Giá: Tăng dần</option>
                <option value="priceDesc">Giá: Giảm dần</option>
              </select>
            </div>
          </div>

          {searchTerm.trim() === "" ? (
            <div className="text-center py-10 bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">search</span>
              <p className="text-on-surface-variant font-body-md">Vui lòng gõ từ khóa để tìm kiếm Dịch vụ hoặc Sản phẩm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedItems.map(item => {
                const isSelected = selectedItems.some(i => i._id === item._id);
                const isProduct = item.itemType === 'product';
                
                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => selectItem(item)}
                    className={`bg-surface-container/70 backdrop-blur-md p-5 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] relative overflow-hidden group border ${
                      isSelected ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-outline-variant hover:border-primary'
                    }`}
                  >
                    <div className="absolute top-2 right-2 z-20">
                       <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${isProduct ? 'border-gold-dim text-gold-dim' : 'border-primary text-primary'}`}>
                         {isProduct ? 'Sản phẩm' : 'Dịch vụ'}
                       </span>
                    </div>

                    <div className="relative z-10">
                      <div className="w-full h-36 mb-3 overflow-hidden rounded-lg bg-surface-container">
                        {((item.images && item.images[0]) || item.image) ? (
                          <img src={(item.images && item.images[0]) || item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                            <span className="material-symbols-outlined text-outline-variant text-4xl">inventory_2</span>
                          </div>
                        )}
                      </div>
                      <h3 className={`font-headline-sm text-lg line-clamp-2 leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                        {item.name}
                      </h3>
                      {!isProduct && <p className="font-label-md text-on-surface-variant text-xs mt-1">{item.durationMinutes || item.duration || 30} phút</p>}
                      {isProduct && <p className="font-label-md text-on-surface-variant text-xs mt-1">Kho: {item.stock}</p>}
                    </div>
                    <div className="flex justify-between items-end relative z-10 mt-4">
                      <span className="font-label-md font-bold text-primary text-lg">{item.price ? item.price.toLocaleString('vi-VN') : 0}đ</span>
                      <span className={`material-symbols-outlined text-2xl transition-colors ${isSelected ? 'text-primary' : 'text-outline-variant group-hover:text-primary'}`} style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                        {isSelected ? 'check_circle' : 'add_circle'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                );
              })}
              {displayedItems.length === 0 && (
                <div className="col-span-full text-center py-10 text-on-surface-variant">Không tìm thấy kết quả nào phù hợp.</div>
              )}
            </div>
          )}
        </div>

        {/* Staff Selection (Only show if there's at least one service selected) */}
        {hasServices && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="font-headline-sm text-2xl text-on-surface mb-1">Chỉ Định Barber</h2>
                <span className="font-label-md text-xs text-gold-dim">Bắt buộc khi có đặt Dịch vụ</span>
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
      <aside className="w-full lg:w-[450px] bg-surface-container/30 backdrop-blur-md border-l border-outline-variant/50 shrink-0 flex flex-col h-full">
        <div className="flex flex-col p-6 md:p-8 lg:p-10 h-full overflow-hidden">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 border-b border-outline-variant/20 pb-4 shrink-0">
            Tóm Tắt Đơn POS
          </h2>

          {/* Summary List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
            {selectedItems.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center mt-10">Giỏ hàng trống</p>
            ) : (
              selectedItems.map(item => {
                const isProduct = item.itemType === 'product';
                return (
                  <div key={item._id} className="flex justify-between items-start animate-fade-in bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                    <div className="flex-1 pr-4">
                      <h4 className="font-body-md font-semibold text-on-surface text-base leading-tight mb-1">{item.name}</h4>
                      {!isProduct && (
                        <span className="text-[10px] text-primary border border-primary/50 rounded px-1.5 py-0.5 uppercase">Dịch vụ</span>
                      )}
                      {isProduct && (
                         <div className="flex items-center gap-3 mt-2 bg-surface p-1 rounded w-fit border border-outline-variant/50">
                            <button onClick={() => decreaseQuantity(item._id)} className="w-6 h-6 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface">-</button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item._id)} className="w-6 h-6 flex items-center justify-center hover:bg-surface-variant rounded text-on-surface">+</button>
                         </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-body-md font-bold text-on-surface block">
                        {item.price ? ((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN') : 0}đ
                      </span>
                      <button 
                        onClick={() => selectItem(item)}
                        className="text-[10px] text-error hover:underline uppercase tracking-tighter mt-2 inline-block"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )
              })
            )}
            
            {/* Display Barber in Summary */}
            {hasServices && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20 shrink-0">
                <p className="font-label-md text-on-surface-variant text-sm">
                  Barber phụ trách: <span className="text-primary/80 font-bold ml-1">{selectedStaff ? (selectedStaff.userId?.name || "Unknown Barber") : 'Chưa chỉ định'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-outline-variant/20 pt-6 space-y-4 shrink-0">
            <div className="flex justify-between font-body-md text-on-surface-variant">
              <span>Tạm tính</span>
              <span className="font-label-md">{subTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between font-body-md text-on-surface-variant">
              <span>Thuế VAT (8%)</span>
              <span className="font-label-md">{vat.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between font-headline-md text-3xl text-primary pt-4">
              <span>Tổng Tiền</span>
              <span className="font-bold tracking-tight">{total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="mt-6 space-y-4 shrink-0">
            <button 
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="w-full py-5 border border-outline-gold text-primary rounded-lg font-label-md font-bold flex items-center justify-center gap-3 hover:bg-primary/5 transition-all active:scale-[0.98] group disabled:opacity-50"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">print</span>
              IN HÓA ĐƠN TẠM
            </button>
            <button 
              onClick={openTimeModalOrCheckout}
              disabled={selectedItems.length === 0}
              className={`w-full py-5 rounded-lg font-label-md font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 ${hasServices ? 'bg-primary text-on-primary hover:brightness-110 shadow-primary/20' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-600/20'}`}
            >
              <span className="material-symbols-outlined">
                {hasServices ? 'schedule' : 'point_of_sale'}
              </span>
              {hasServices ? 'CHỌN GIỜ & XÁC NHẬN' : 'THANH TOÁN NGAY'}
            </button>
          </div>
        </div>
      </aside>

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
