import React, { useState } from "react";
import { voucherService } from "@/services/voucher.service";
import { bookingService } from "@/services/booking.service";

export default function BookingSummarySidebar({
  selectedServices = [], selectedBarber, selectedDate, selectedTime,
  paymentMethod, setPaymentMethod, onConfirm, isLoading, isGuest,
  user, discountType, setDiscountType, pointsToUseInput, setPointsToUseInput,
  voucherCodeInput, setVoucherCodeInput, appliedVoucher, setAppliedVoucher,
  discountAmount, setDiscountAmount, voucherError, setVoucherError,
  applyingVoucher, setApplyingVoucher, setVerifiedPhone
}) {
  const [newUserPhone, setNewUserPhone] = useState("");
  const [isNewUserVerified, setIsNewUserVerified] = useState(false);
  const isReady = selectedServices.length > 0 && selectedBarber && selectedDate && selectedTime;

  const subTotal = selectedServices.reduce((total, s) => total + (s.price || 0), 0);
  const totalPrice = Math.max(0, subTotal - discountAmount);
  const depositAmount = isGuest ? Math.round(totalPrice / 2) : totalPrice;

  React.useEffect(() => {
    if (discountType === 'loyalty_points' && user) {
      let maxPointsByBill = Math.floor(subTotal / 2 / 1000); 
      let maxPointsAllowed = 50; 
      let pointsWillUse = Math.min(user.loyaltyPoints, maxPointsByBill, maxPointsAllowed);
      
      if (subTotal < 50000 || pointsWillUse <= 0) {
        setPointsToUseInput(0);
        setDiscountAmount(0);
      } else {
        setPointsToUseInput(pointsWillUse);
        setDiscountAmount(pointsWillUse * 1000);
      }
    } else if (discountType === 'new_user') {
      let dAmount = subTotal * 0.5;
      if (dAmount > 50000) dAmount = 50000;
      setDiscountAmount(dAmount);
    }
  }, [subTotal, discountType, user, setDiscountAmount, setPointsToUseInput]);

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setApplyingVoucher(true);
    setVoucherError("");
    try {
      // In booking, customerPhone might not be known yet until guest modal, 
      // but if user is logged in, token is sent. 
      // If guest, usageLimitPerUser might be checked by phone later.
      const serviceIds = selectedServices.map(s => s._id || s.id);
      const res = await voucherService.applyVoucher(voucherCodeInput.trim(), subTotal, null, [], serviceIds);
      if (res.success) {
        setAppliedVoucher(res.data.code);
        setDiscountAmount(res.data.discountAmount);
        setVoucherError("");
      }
    } catch (err) {
      setVoucherError(err.message || "Mã giảm giá không hợp lệ");
      setAppliedVoucher(null);
      setDiscountAmount(0);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherCodeInput("");
    setVoucherError("");
  };

  const handleApplyNewUserDiscount = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng ưu đãi!");
      return;
    }
    if (user.loyaltyPoints > 0) {
      alert("Ưu đãi Khách mới chỉ dành cho khách hàng mới (chưa có điểm thưởng)!");
      return;
    }
    setApplyingVoucher(true);
    setVoucherError("");
    try {
      let dAmount = subTotal * 0.5;
      if (dAmount > 50000) dAmount = 50000;
      setDiscountAmount(dAmount);
      setDiscountType('new_user');
      setVoucherError("Đã áp dụng ưu đãi Khách mới");
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleApplyLoyaltyPoints = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng điểm thưởng!");
      return;
    }
    if (user.loyaltyPoints <= 0) {
      alert("Bạn chưa có điểm thưởng nào.");
      return;
    }
    if (subTotal < 50000) {
      alert("Dịch vụ phải tối thiểu 50,000đ để áp dụng tiêu điểm.");
      return;
    }

    let maxPointsByBill = Math.floor(subTotal / 2 / 1000); 
    let maxPointsAllowed = 50; 
    let pointsWillUse = Math.min(user.loyaltyPoints, maxPointsByBill, maxPointsAllowed);

    if (pointsWillUse <= 0) {
      alert("Không thể áp dụng điểm thưởng cho đơn hàng này.");
      return;
    }

    let dAmount = pointsWillUse * 1000;

    setPointsToUseInput(pointsWillUse);
    setDiscountAmount(dAmount);
    setDiscountType('loyalty_points');
    setVoucherError(`Đã dùng ${pointsWillUse} điểm thưởng`);
  };

  const clearDiscount = () => {
    setDiscountType('none');
    setDiscountAmount(0);
    setPointsToUseInput(0);
    removeVoucher();
    setIsNewUserVerified(false);
    if (setVerifiedPhone) setVerifiedPhone("");
  };

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        <div className="glass-card overflow-hidden border border-outline-variant rounded-xl">
          <div className="bg-surface-container-highest p-6 border-b border-outline-variant">
            <h3 className="text-headline-sm font-headline-sm text-primary tracking-tight">Chi Tiết Đặt Lịch</h3>
          </div>
          <div className="p-6 space-y-6">

            {/* Service Detail */}
            <div className={`flex items-start space-x-4 ${selectedServices.length === 0 && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">content_cut</span>
              <div className="w-full">
                <p className="text-label-md text-on-surface-variant font-bold mb-2">DỊCH VỤ ĐÃ CHỌN ({selectedServices.length})</p>
                {selectedServices.length > 0 ? (
                  <div className="space-y-3">
                    {selectedServices.map(service => (
                      <div key={service._id} className="flex justify-between items-start border-b border-outline-variant/30 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-body-md font-bold text-on-surface leading-tight">{service.name}</p>
                          <p className="text-label-sm text-outline mt-0.5">{service.durationMinutes || service.duration} Phút</p>
                        </div>
                        <p className="text-body-sm font-semibold text-primary">{service.price ? service.price.toLocaleString('vi-VN') : '0'}đ</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-lg font-bold text-on-surface">Chưa chọn</p>
                )}
              </div>
            </div>

            {/* Barber Detail */}
            <div className={`flex items-start space-x-4 ${!selectedBarber && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">person</span>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold">BARBER</p>
                <p className="text-body-lg font-bold text-on-surface">{selectedBarber ? selectedBarber.name : 'Chưa chọn'}</p>
                {selectedBarber && <p className="text-label-md text-outline">{selectedBarber.title}</p>}
              </div>
            </div>

            {/* Time Detail */}
            <div className={`flex items-start space-x-4 ${(!selectedDate || !selectedTime) && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">calendar_month</span>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold">THỜI GIAN BẮT ĐẦU</p>
                <p className="text-body-lg font-bold text-on-surface">{selectedTime ? `${selectedTime}` : 'Chưa chọn'}</p>
                {selectedDate && <p className="text-label-md text-outline">{selectedDate}</p>}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className={`flex items-start space-x-4 pt-4 border-t border-outline-variant/30 ${!isReady && 'opacity-50'}`}>
              <span className="material-symbols-outlined text-primary mt-1">payments</span>
              <div className="w-full">
                <p className="text-label-md text-on-surface-variant font-bold mb-3">PHƯƠNG THỨC THANH TOÁN</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={!isReady}
                        className="peer appearance-none w-5 h-5 rounded-full border border-outline-variant checked:border-primary transition-colors cursor-pointer"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                    <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">Thanh toán tại quán (Tiền mặt)</span>
                  </label>

                  {isGuest && paymentMethod === 'cash' && (
                    <div className="mt-2 p-3 bg-surface-variant/50 border border-outline-variant rounded-lg">
                      <p className="text-body-sm text-on-surface-variant flex items-start">
                        <span className="material-symbols-outlined text-[16px] text-error mr-2 mt-0.5">warning</span>
                        <span>Nếu không cọc trước, hệ thống sẽ không giữ cứng chỗ. Nếu bạn đến muộn, chỗ có thể nhường cho khách khác và bạn sẽ bị đánh dấu Không tới (No-show).</span>
                      </p>
                    </div>
                  )}

                  <label className="flex items-center space-x-3 cursor-pointer group mt-2">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="payos"
                        checked={paymentMethod === 'payos'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={!isReady}
                        className="peer appearance-none w-5 h-5 rounded-full border border-outline-variant checked:border-primary transition-colors cursor-pointer"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                    <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">
                      Chuyển khoản QR ({isGuest ? 'Cọc 50% giữ chỗ' : 'Thanh toán 100%'})
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Discount Section */}
            <div className={`pt-4 border-t border-outline-variant/30 space-y-4 ${!isReady && 'opacity-50'}`}>
              <h3 className="text-label-md text-on-surface-variant font-bold">ƯU ĐÃI CỦA BẠN</h3>
              
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="discount" checked={discountType === 'none'} onChange={clearDiscount} className="text-primary focus:ring-primary" disabled={!isReady} />
                  <span className="text-sm">Không dùng ưu đãi</span>
                </label>
                
                {/* NEW USER DISCOUNT */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discount"
                    checked={discountType === 'new_user'}
                    onChange={() => {
                      let dAmount = subTotal * 0.5;
                      if (dAmount > 50000) dAmount = 50000;
                      setDiscountAmount(dAmount);
                      setDiscountType('new_user');
                      setVoucherError("Đã áp dụng ưu đãi Khách mới");
                      setPointsToUseInput(0);
                      removeVoucher();
                    }}
                    className="text-primary focus:ring-primary"
                    disabled={!isReady || !user || !user.isNewUser}
                  />
                  <span className="text-sm">
                    Khách mới (Giảm 50% tối đa 50k){" "}
                    {!user ? (
                      <span className="text-error text-[10px] ml-1">
                        (Chỉ dành cho tài khoản mới)
                      </span>
                    ) : !user.isNewUser ? (
                      <span className="text-error text-[10px] ml-1">
                        (Đã sử dụng)
                      </span>
                    ) : null}
                  </span>
                </label>

                {/* LOYALTY POINTS */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="discount" checked={discountType === 'loyalty_points'} onChange={handleApplyLoyaltyPoints} className="text-primary focus:ring-primary" disabled={!isReady || !user || user.loyaltyPoints <= 0} />
                  <span className="text-sm">
                    Dùng điểm thưởng
                    {user && (
                      <> (Đang có <span className="text-primary font-bold">{user.loyaltyPoints || 0}</span> điểm)</>
                    )}
                    {!user && (
                      <span className="text-error text-[10px] ml-1">(Chỉ dành cho thành viên)</span>
                    )}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="discount" checked={discountType === 'voucher'} onChange={() => setDiscountType('voucher')} className="text-primary focus:ring-primary" disabled={!isReady} />
                  <span className="text-sm">Mã giảm giá</span>
                </label>
              </div>

              {discountType === 'voucher' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    disabled={!isReady || appliedVoucher || applyingVoucher}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm uppercase focus:border-primary outline-none disabled:opacity-50"
                  />
                  {appliedVoucher ? (
                    <button onClick={removeVoucher} disabled={!isReady} className="px-4 bg-error text-white font-bold rounded text-sm hover:bg-error/90 disabled:opacity-50">Hủy</button>
                  ) : (
                    <button onClick={handleApplyVoucher} disabled={!isReady || applyingVoucher || !voucherCodeInput} className="px-4 bg-surface-container-highest border border-outline-variant rounded font-bold text-sm hover:text-primary disabled:opacity-50">Áp dụng</button>
                  )}
                </div>
              )}
              {voucherError && <p className={`text-xs mt-1 ${voucherError.includes('Đã') ? 'text-success' : 'text-error'}`}>{voucherError}</p>}
              {appliedVoucher && discountType === 'voucher' && <p className="text-success text-xs mt-1">Đã áp dụng mã {appliedVoucher}</p>}
            </div>

            <div className="pt-6 border-t border-outline-variant">
              {discountAmount > 0 && (
                <div className="flex justify-between items-end mb-2">
                  <span className="text-body-md font-bold text-on-surface-variant">Giảm giá</span>
                  <span className="text-body-md font-bold text-success">
                    -{discountAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
              {isGuest && paymentMethod === 'payos' ? (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-body-md font-bold text-on-surface-variant">Tạm tính</span>
                    <span className="text-body-md font-bold text-on-surface-variant">
                      {selectedServices.length > 0 ? `${(totalPrice / 1000)}k` : '0đ'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-headline-sm font-bold text-on-surface">Cọc 50%</span>
                    <span className="text-display-lg text-[32px] font-bold text-primary leading-none">
                      {selectedServices.length > 0 ? `${(depositAmount / 1000)}k` : '0đ'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-end mb-8">
                  <span className="text-headline-sm font-bold text-on-surface">Tổng cộng</span>
                  <span className="text-display-lg text-[32px] font-bold text-primary leading-none">
                    {selectedServices.length > 0 ? `${(totalPrice / 1000)}k` : '0đ'}
                  </span>
                </div>
              )}
              <button
                onClick={onConfirm}
                disabled={!isReady || isLoading}
                className={`w-full font-headline-md py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${isReady && !isLoading
                    ? 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(255,222,165,0.3)] active:scale-95 cursor-pointer'
                    : 'bg-surface-variant text-outline cursor-not-allowed'
                  }`}
              >
                <span>{isLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}</span>
                {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
              <p className="text-center text-[11px] text-outline mt-4 font-label-md tracking-tighter">
                Bằng cách nhấn xác nhận, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="glass-card p-6 bg-surface-container-low border-dashed border border-outline-variant rounded-xl">
          <h4 className="text-label-md font-bold text-primary mb-2 flex items-center">
            <span className="material-symbols-outlined text-sm mr-2">info</span> CHÍNH SÁCH HỦY LỊCH
          </h4>
          <p className="text-body-md text-on-surface-variant leading-relaxed italic">
            Quý khách vui lòng thông báo trước ít nhất 2 giờ nếu có thay đổi để chúng tôi phục vụ tốt nhất.
          </p>
        </div>
      </div>
    </aside>
  );
}
