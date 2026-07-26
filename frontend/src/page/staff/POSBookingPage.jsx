"use client";

import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { bookingService } from "@/services/booking.service";
import { staffDashboardService } from "@/services/staffDashboard.service";
import { voucherService } from "@/services/voucher.service";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import POSServiceList from "@/components/staff/pos/POSServiceList";
import POSSummaryCard from "@/components/staff/pos/POSSummaryCard";
import POSNewCustomerModal from "@/components/staff/pos/POSNewCustomerModal";
import POSTimeSelectionModal from "@/components/staff/pos/POSTimeSelectionModal";
import POSStaffSelectionModal from "@/components/staff/pos/POSStaffSelectionModal";
import POSPaymentModal from "@/components/staff/pos/POSPaymentModal";
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
  const [showStaffModal, setShowStaffModal] = useState(false);

  // State: Voucher
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // State: Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      // Only products -> Open Payment Modal
      setShowPaymentModal(true);
    }
  };

  // Hàm xử lý chung: Sinh ra Booking (nếu có service) và Order (nếu có product)
  const handleProcessBoth = async (onlyProducts = false, paymentMethod = 'cash') => {
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

      // 1. Nếu có sản phẩm -> Tạo Order
      if (productsOnly.length > 0) {
        const orderPayload = {
          items: productsOnly.map(p => ({
            productId: p._id,
            quantity: p.quantity || 1
          })),
          customerName: customer ? customer.name : "Khách vãng lai",
          customerPhone: customer ? customer.phone : "0000000000",
          shippingAddress: "Mua tại cửa hàng",
          paymentMethod: paymentMethod,
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
          discountAmount: discountAmount || 0,
        };
        const orderRes = await axios.post("http://localhost:5000/api/orders", orderPayload, { withCredentials: true });
        
        if (paymentMethod === 'payos') {
          return orderRes.data;
        }

        // Nếu là tiền mặt (cash), tự động chuyển status = paid và completed
        if (paymentMethod === 'cash' && orderRes.data && orderRes.data.data) {
          const orderId = orderRes.data.data._id;
          try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/pay-cod`, {}, { withCredentials: true });
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'completed' }, { withCredentials: true });
          } catch (e) {
            console.error("Lỗi khi tự động hoàn thành đơn tại quầy", e);
          }
        }
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
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
          discountAmount: discountAmount || 0,
        };
        await bookingService.createBookingSinglePage(bookingPayload);
      }

      toast.success("Thanh toán / Lên lịch thành công!");
      setShowTimeModal(false);
      setShowPaymentModal(false);
      
      // Reset form
      setPhoneInput("");
      setCustomer(null);
      setSelectedItems([]);
      setSelectedStaff(null);
      setSelectedDate("");
      setSelectedTime("");
      setSearchTerm("");
      setNewCustomerInfo({ name: "", phone: "", emailOrNote: "" });
      setAppliedVoucher(null);
      setDiscountCodeInput("");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo đơn.");
      return { success: false };
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
  
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage' || appliedVoucher.type === 'percentage') {
      const discountValue = appliedVoucher.discountValue || appliedVoucher.value || 0;
      discountAmount = (subTotal * discountValue) / 100;
      const maxAmount = appliedVoucher.maxDiscountAmount;
      if (maxAmount && discountAmount > maxAmount) {
        discountAmount = maxAmount;
      }
    } else {
      discountAmount = appliedVoucher.discountValue || appliedVoucher.value || 0;
    }
  }
  
  const total = Math.max(0, subTotal - discountAmount);

  // Voucher Actions
  const handleApplyVoucher = async () => {
    if (!discountCodeInput.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm/dịch vụ trước khi áp dụng mã");
      return;
    }
    setIsApplyingVoucher(true);
    try {
      const productIds = selectedItems.filter(i => i.itemType === 'product').map(i => i._id);
      const serviceIds = selectedItems.filter(i => i.itemType === 'service').map(i => i._id);
      
      const res = await voucherService.applyVoucher(
        discountCodeInput.trim(), 
        subTotal, 
        customer?.phone || null, 
        productIds, 
        serviceIds
      );
      
      if (res && res.success) {
        toast.success("Áp dụng mã giảm giá thành công");
        setAppliedVoucher(res.data || res.voucher);
      } else {
        toast.error(res.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi áp dụng mã giảm giá");
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountCodeInput("");
    toast.success("Đã gỡ mã giảm giá");
  };

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
      </section>

      {/* Right Side: Booking Summary & Checkout */}
      <POSSummaryCard 
        selectedItems={selectedItems}
        hasServices={hasServices}
        selectedStaff={selectedStaff}
        subTotal={subTotal}
        total={total}
        decreaseQuantity={decreaseQuantity}
        increaseQuantity={increaseQuantity}
        selectItem={selectItem}
        handlePrint={handlePrint}
        openTimeModalOrCheckout={openTimeModalOrCheckout}
        // Voucher passdown
        discountCodeInput={discountCodeInput}
        setDiscountCodeInput={setDiscountCodeInput}
        appliedVoucher={appliedVoucher}
        isApplyingVoucher={isApplyingVoucher}
        handleApplyVoucher={handleApplyVoucher}
        handleRemoveVoucher={handleRemoveVoucher}
        discountAmount={discountAmount}
        // Customer passdown
        phoneInput={phoneInput}
        setPhoneInput={setPhoneInput}
        handleSearchCustomer={handleSearchCustomer}
        handlePhonePaste={handlePhonePaste}
        customer={customer}
        setCustomer={setCustomer}
        setShowNewCustomerForm={setShowNewCustomerForm}
        normalizePhone={normalizePhone}
        // Staff Modal
        setShowStaffModal={setShowStaffModal}
      />

      {/* Modal: New Customer */}
      <POSNewCustomerModal
        show={showNewCustomerForm && !customer}
        onClose={() => setShowNewCustomerForm(false)}
        newCustomerInfo={newCustomerInfo}
        setNewCustomerInfo={setNewCustomerInfo}
        handleSaveNewCustomer={handleSaveNewCustomer}
        normalizePhone={normalizePhone}
        handlePhonePaste={handlePhonePaste}
        isValidEmail={isValidEmail}
      />

      {/* Time Selection Modal */}
      <POSTimeSelectionModal
        show={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        selectedStaff={selectedStaff}
        selectedServices={selectedItems.filter(i => i.itemType === 'service')}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        isSubmitting={isSubmitting}
        handleConfirm={() => handleProcessBoth(false)}
      />

      {/* Payment Modal */}
      <POSPaymentModal
        isOpen={showPaymentModal}
        onClose={(success) => {
          setShowPaymentModal(false);
          if (success) {
            // Reset form if payment success
            setPhoneInput("");
            setCustomer(null);
            setSelectedItems([]);
            setSelectedStaff(null);
            setSelectedDate("");
            setSelectedTime("");
            setSearchTerm("");
            setNewCustomerInfo({ name: "", phone: "", emailOrNote: "" });
            setAppliedVoucher(null);
            setDiscountCodeInput("");
          }
        }}
        onConfirm={(method) => handleProcessBoth(true, method)}
        isSubmitting={isSubmitting}
      />

      {/* Staff Selection Modal */}
      <POSStaffSelectionModal
        show={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        staffList={staffList}
        selectedStaff={selectedStaff}
        setSelectedStaff={setSelectedStaff}
      />
    </div>
  );
}
