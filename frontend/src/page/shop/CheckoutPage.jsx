"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/layout/Footer";
import { voucherService } from "@/services/voucher.service";
import { Suspense } from "react";

function CheckoutPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-fill voucher from URL
  useEffect(() => {
    const code =
      searchParams.get("voucherCode") || localStorage.getItem("auto_voucher");
    if (code) {
      setVoucherCodeInput(code);
      if (localStorage.getItem("auto_voucher")) {
        localStorage.removeItem("auto_voucher");
      }
    }
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "bank_transfer",
  });

  // Tự động điền thông tin user vào form nếu đã đăng nhập
  useEffect(() => {
    const initData = async () => {
      if (user) {
        let defaultAddress = "";
        let addresses = [];

        if (
          user.addresses &&
          Array.isArray(user.addresses) &&
          user.addresses.length > 0
        ) {
          addresses = [...user.addresses];
        } else if (user.address) {
          addresses = [user.address];
        }

        try {
          const res = await axios.get(
            "http://localhost:5000/api/orders/my-orders",
            { withCredentials: true },
          );
          if (res.data.success && res.data.data && res.data.data.length > 0) {
            const lastOrder = res.data.data[0];
            if (
              lastOrder.shippingAddress &&
              !addresses.includes(lastOrder.shippingAddress)
            ) {
              addresses.unshift(lastOrder.shippingAddress);
            }
            if (lastOrder.shippingAddress) {
              defaultAddress = lastOrder.shippingAddress;
            }
          }
        } catch (error) {
          console.error("Lỗi lấy đơn hàng gần nhất:", error);
        }

        if (!defaultAddress && addresses.length > 0) {
          defaultAddress = addresses[0];
        }

        setUserAddresses(addresses);

        setFormData((prev) => ({
          ...prev,
          customerName: user.name || prev.customerName,
          phone: user.phone || prev.phone,
          email: user.email || prev.email,
          address: defaultAddress || prev.address,
        }));
        setIsEditingInfo(false);
      } else {
        setIsEditingInfo(true);
      }
    };
    initData();
  }, [user]);

  // Voucher & Discount State
  const [discountType, setDiscountType] = useState("none");
  const [pointsToUseInput, setPointsToUseInput] = useState(0);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // QR Modal State
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [userAddresses, setUserAddresses] = useState([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  // VN Address API State
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Fetch provinces on mount
  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Lỗi fetch tỉnh/thành:", err));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const p = provinces.find((x) => x.name === selectedProvince);
      if (p) {
        axios
          .get(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
          .then((res) => setDistricts(res.data.districts))
          .catch((err) => console.error("Lỗi fetch quận/huyện:", err));
      }
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedProvince, provinces]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const d = districts.find((x) => x.name === selectedDistrict);
      if (d) {
        axios
          .get(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
          .then((res) => setWards(res.data.wards))
          .catch((err) => console.error("Lỗi fetch phường/xã:", err));
      }
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict, districts]);

  // Update customAddress and formData when address parts change
  useEffect(() => {
    if (streetAddress || selectedWard || selectedDistrict || selectedProvince) {
      const fullAddr = [
        streetAddress,
        selectedWard,
        selectedDistrict,
        selectedProvince,
      ]
        .filter(Boolean)
        .join(", ");
      setCustomAddress(fullAddr);
    }
  }, [streetAddress, selectedWard, selectedDistrict, selectedProvince]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        const localCart = JSON.parse(
          localStorage.getItem("hallo_cart") || "[]",
        );
        setCartItems(localCart);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          withCredentials: true,
        });
        if (res.data.success) {
          setCartItems(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const subTotal = cartItems.reduce(
    (total, item) => total + item.productId.price * item.quantity,
    0,
  );
  const totalAmount = Math.max(0, subTotal - discountAmount);

  React.useEffect(() => {
    if (discountType === "new_user") {
      let dAmount = subTotal * 0.5;
      if (dAmount > 50000) dAmount = 50000;
      setDiscountAmount(dAmount);
    } else if (discountType === "loyalty_points") {
      // Re-validate points discount if subtotal changes
      const currentDiscount = pointsToUseInput * 100;
      if (currentDiscount > subTotal) {
        setDiscountAmount(subTotal);
      } else {
        setDiscountAmount(currentDiscount);
      }
    }
  }, [subTotal, discountType, user, pointsToUseInput]);

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setApplyingVoucher(true);
    setVoucherError("");
    try {
      const productIds = cartItems.map((item) => item.productId._id);
      const res = await voucherService.applyVoucher(
        voucherCodeInput.trim(),
        subTotal,
        formData.phone,
        productIds,
        [],
      );
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
      toast.error("Vui lòng đăng nhập để sử dụng ưu đãi!");
      return;
    }
    if (user.loyaltyPoints > 0) {
      toast.error(
        "Ưu đãi Khách mới chỉ dành cho khách hàng mới (chưa có điểm thưởng)!",
      );
      return;
    }
    setApplyingVoucher(true);
    setVoucherError("");
    try {
      // Simulate checking from backend, or we can just apply it and let backend validate when checkout
      // But it's better to hit a check endpoint. Since we don't have one, we just calculate it locally
      // and backend will double check.
      let dAmount = subTotal * 0.5;
      if (dAmount > 50000) dAmount = 50000;
      setDiscountAmount(dAmount);
      setDiscountType("new_user");
      setVoucherError("Đã áp dụng ưu đãi Khách mới"); // Using error state to show success msg for now, or just alert
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

    setDiscountType("loyalty_points");
    setVoucherError("");
    // Đặt mặc định điểm dùng là 0 để người dùng tự nhập
    setPointsToUseInput(0);
    setDiscountAmount(0);
  };

  const clearDiscount = () => {
    setDiscountType("none");
    setDiscountAmount(0);
    setPointsToUseInput(0);
    removeVoucher();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!formData.customerName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      }));

      // Gọi API tạo Order
      const res = await axios.post(
        "http://localhost:5000/api/orders",
        {
          items,
          totalAmount,
          customerName: formData.customerName,
          customerPhone: formData.phone,
          shippingAddress: formData.address,
          paymentMethod:
            formData.paymentMethod === "bank_transfer" ? "payos" : "cod",
          voucherCode: appliedVoucher,
          discountType: discountType,
          pointsToUse: pointsToUseInput,
          returnUrl: "http://localhost:3000/shop/checkout/success",
          cancelUrl: "http://localhost:3000/shop/checkout",
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        const orderData = res.data.data;

        if (formData.paymentMethod === "bank_transfer") {
          if (res.data.qrCode) {
            setCurrentOrder(orderData);
            setQrData(res.data.qrCode);
            setShowQR(true);
          } else {
            alert("Lỗi: Không nhận được mã QR thanh toán PayOS");
          }
        } else {
          // COD - Thành công luôn
          alert("Đặt hàng thành công!");
          sessionStorage.removeItem("hallo_cart");
          localStorage.removeItem("hallo_cart");
          router.push(
            `/shop/checkout/success?orderCode=${orderData.orderCode}&total=${totalAmount}`,
          );
        }
      }
    } catch (error) {
      console.error(error);
      const detailError = error.response?.data?.error;
      const baseMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng.";
      alert(
        detailError
          ? `${baseMsg}\nChi tiết lỗi PayOS: ${detailError}`
          : baseMsg,
      );
    }
  };

  // Polling check trạng thái đơn hàng khi đang mở QR
  useEffect(() => {
    let interval;
    if (showQR && currentOrder) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/orders/track/${currentOrder.orderCode}`,
          );
          if (res.data.success && res.data.data.paymentStatus === "paid") {
            // Đã thanh toán thành công
            clearInterval(interval);
            setShowQR(false);
            sessionStorage.removeItem("hallo_cart");
            localStorage.removeItem("hallo_cart");
            router.push(
              `/shop/checkout/success?orderCode=${currentOrder.orderCode}&total=${totalAmount}&paid=true`,
            );
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showQR, currentOrder, router]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-40 bg-surface-obsidian/80 backdrop-blur-md border-b border-outline-variant shadow-sm h-20">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-4">
            <Link
              href="/shop/cart"
              className="text-on-surface hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label-md text-label-md group-hover:translate-x-[-2px] transition-transform">
                QUAY LẠI
              </span>
            </Link>
          </div>
          <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            HALLO BARBER
          </div>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-gutter">
            {/* Thông tin giao hàng */}
            <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 rounded-lg">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    local_shipping
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
                    Thông tin giao hàng
                  </h2>
                </div>
                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="text-primary hover:underline font-label-md"
                  >
                    Thay đổi
                  </button>
                )}
              </div>

              {!isEditingInfo ? (
                <div className="space-y-4 bg-surface-container-lowest p-6 rounded-lg border border-outline-variant">
                  <p className="font-body-md">
                    <strong className="text-on-surface-variant w-24 inline-block">
                      Họ và tên:
                    </strong>{" "}
                    {formData.customerName || "Chưa có thông tin"}
                  </p>
                  <p className="font-body-md">
                    <strong className="text-on-surface-variant w-24 inline-block">
                      SĐT:
                    </strong>{" "}
                    {formData.phone || "Chưa có thông tin"}
                  </p>
                  <p className="font-body-md">
                    <strong className="text-on-surface-variant w-24 inline-block">
                      Email:
                    </strong>{" "}
                    {formData.email || "Chưa có thông tin"}
                  </p>
                  <p className="font-body-md">
                    <strong className="text-on-surface-variant w-24 inline-block">
                      Địa chỉ:
                    </strong>{" "}
                    {formData.address || "Chưa có thông tin"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface-variant block">
                        HỌ VÀ TÊN
                      </label>
                      <input
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Nhập họ và tên của bạn"
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface-variant block">
                        SỐ ĐIỆN THOẠI
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="090 123 4567"
                        type="tel"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                      EMAIL
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="example@email.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-label-md text-label-md text-on-surface-variant block">
                        ĐỊA CHỈ NHẬN HÀNG
                      </label>
                      {!isAddingNewAddress && (
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(true)}
                          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            add
                          </span>
                          Thêm địa chỉ mới
                        </button>
                      )}
                    </div>

                    {!isAddingNewAddress && (
                      <select
                        name="addressSelect"
                        value={
                          userAddresses.includes(formData.address)
                            ? formData.address
                            : ""
                        }
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                        }}
                        className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded text-on-surface focus:border-primary focus:ring-1 focus:ring-primary mb-3"
                      >
                        <option
                          value=""
                          disabled
                          className="text-black bg-white"
                        >
                          {userAddresses.length === 0
                            ? "-- Vui lòng thêm địa chỉ mới --"
                            : "-- Chọn địa chỉ có sẵn --"}
                        </option>
                        {userAddresses.map((addr, idx) => (
                          <option
                            key={idx}
                            value={addr}
                            className="text-black bg-white"
                          >
                            {addr}
                          </option>
                        ))}
                      </select>
                    )}

                    {isAddingNewAddress && (
                      <div className="space-y-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <select
                            value={selectedProvince}
                            onChange={(e) =>
                              setSelectedProvince(e.target.value)
                            }
                            className="w-full bg-transparent border border-outline-variant px-3 py-2 rounded text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                          >
                            <option value="" className="text-black bg-white">
                              Tỉnh/Thành phố
                            </option>
                            {provinces.map((p) => (
                              <option
                                key={p.code}
                                value={p.name}
                                className="text-black bg-white"
                              >
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={selectedDistrict}
                            onChange={(e) =>
                              setSelectedDistrict(e.target.value)
                            }
                            disabled={!selectedProvince}
                            className="w-full bg-transparent border border-outline-variant px-3 py-2 rounded text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                          >
                            <option value="" className="text-black bg-white">
                              Quận/Huyện
                            </option>
                            {districts.map((d) => (
                              <option
                                key={d.code}
                                value={d.name}
                                className="text-black bg-white"
                              >
                                {d.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            disabled={!selectedDistrict}
                            className="w-full bg-transparent border border-outline-variant px-3 py-2 rounded text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                          >
                            <option value="" className="text-black bg-white">
                              Phường/Xã
                            </option>
                            {wards.map((w) => (
                              <option
                                key={w.code}
                                value={w.name}
                                className="text-black bg-white"
                              >
                                {w.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Số nhà, tên đường, tòa nhà..."
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          className="w-full bg-transparent border border-outline-variant px-4 py-3 rounded text-on-surface placeholder:text-outline transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setIsAddingNewAddress(false)}
                            className="px-4 py-2 border border-outline-variant rounded hover:bg-surface-container-highest transition-all text-sm font-medium"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!customAddress) return;
                              if (
                                user &&
                                !userAddresses.includes(customAddress)
                              ) {
                                try {
                                  const res = await axios.put(
                                    "http://localhost:5000/api/auth/profile",
                                    { newAddress: customAddress },
                                    { withCredentials: true },
                                  );
                                  if (res.data.success) {
                                    setUserAddresses(
                                      res.data.data.user.addresses,
                                    );
                                    setFormData({
                                      ...formData,
                                      address: customAddress,
                                    });
                                    setIsAddingNewAddress(false);
                                  }
                                } catch (error) {
                                  console.error(
                                    "Lỗi khi lưu địa chỉ mới:",
                                    error,
                                  );
                                }
                              } else {
                                setFormData({
                                  ...formData,
                                  address: customAddress,
                                });
                                setIsAddingNewAddress(false);
                              }
                            }}
                            className="bg-primary text-on-primary px-4 py-2 rounded hover:bg-primary-fixed-dim transition-all text-sm font-medium"
                          >
                            Lưu địa chỉ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setIsEditingInfo(false)}
                      className="bg-primary text-on-primary px-6 py-2 rounded font-label-md hover:bg-primary-fixed-dim transition-all"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Phương thức thanh toán */}
            <section className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">
                  payments
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
                  Phương thức thanh toán
                </h2>
              </div>
              <div className="space-y-4">
                <label className="group cursor-pointer block">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === "bank_transfer"}
                    onChange={handleInputChange}
                    className="hidden peer"
                  />
                  <div className="flex items-center gap-4 p-5 rounded border border-outline-variant bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-surface-container-high transition-all">
                    <div className="w-5 h-5 border-2 border-outline rounded-full flex items-center justify-center peer-checked:border-primary group-hover:border-primary">
                      <div
                        className={`w-2.5 h-2.5 bg-primary rounded-full opacity-0 ${formData.paymentMethod === "bank_transfer" ? "opacity-100" : ""}`}
                      ></div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      qr_code_2
                    </span>
                    <div className="flex-1">
                      <p className="font-body-md text-on-surface font-medium">
                        Chuyển khoản ngân hàng (QR Code)
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Tự động xác nhận giao dịch trong 30 giây
                      </p>
                    </div>
                  </div>
                </label>

                <label className="group cursor-pointer block">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === "cash"}
                    onChange={handleInputChange}
                    className="hidden peer"
                  />
                  <div className="flex items-center gap-4 p-5 rounded border border-outline-variant bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-surface-container-high transition-all">
                    <div className="w-5 h-5 border-2 border-outline rounded-full flex items-center justify-center peer-checked:border-primary group-hover:border-primary">
                      <div
                        className={`w-2.5 h-2.5 bg-primary rounded-full opacity-0 ${formData.paymentMethod === "cash" ? "opacity-100" : ""}`}
                      ></div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      local_atm
                    </span>
                    <div className="flex-1">
                      <p className="font-body-md text-on-surface font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Kiểm tra hàng trước khi thanh toán
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 mb-12">
            <div className="bg-surface-container/60 backdrop-blur-md border border-outline-variant p-8 rounded-lg flex flex-col gap-8">
              <div className="border-b border-outline-variant pb-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
                  Đơn hàng của bạn
                </h2>
              </div>

              {/* Products List */}
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.productId._id} className="flex gap-4">
                    <div className="w-20 h-24 bg-surface-container-high rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.productId.image}
                        alt={item.productId.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-body-md text-on-surface font-semibold">
                          {item.productId.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {item.productId.brand}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-on-surface-variant italic">
                          SL: {item.quantity}
                        </p>
                        <p className="font-label-md text-label-md text-primary">
                          {formatPrice(item.productId.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-outline-variant">
                {/* Discount Section */}
                <div className="pb-4 mb-4 border-b border-outline-variant space-y-4">
                  <h3 className="font-headline-sm text-sm uppercase font-bold text-on-surface">
                    Ưu đãi của bạn
                  </h3>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={discountType === "none"}
                        onChange={clearDiscount}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Không dùng ưu đãi</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={discountType === "new_user"}
                        onChange={handleApplyNewUserDiscount}
                        className="text-primary focus:ring-primary"
                        disabled={!user || !user.isNewUser}
                      />
                      <span className="text-sm">
                        Thành viên mới (Giảm 50% tối đa 50k){" "}
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={discountType === "loyalty_points"}
                        onChange={handleApplyLoyaltyPoints}
                        className="text-primary focus:ring-primary"
                        disabled={!user || user.loyaltyPoints <= 0}
                      />
                      <span className="text-sm">
                        Dùng điểm thưởng
                        {user && (
                          <>
                            {" "}
                            (Bạn đang có{" "}
                            <span className="text-primary font-bold">
                              {user.loyaltyPoints || 0}
                            </span>{" "}
                            điểm)
                          </>
                        )}
                        {!user && (
                          <span className="text-error text-[10px] ml-1">
                            (Chỉ dành cho thành viên)
                          </span>
                        )}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={discountType === "voucher"}
                        onChange={() => setDiscountType("voucher")}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Mã giảm giá</span>
                    </label>
                  </div>

                  {discountType === "voucher" && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Mã giảm giá"
                        value={voucherCodeInput}
                        onChange={(e) =>
                          setVoucherCodeInput(e.target.value.toUpperCase())
                        }
                        disabled={appliedVoucher || applyingVoucher}
                        className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm uppercase focus:border-primary outline-none disabled:opacity-50"
                      />
                      {appliedVoucher ? (
                        <button
                          onClick={removeVoucher}
                          className="px-4 bg-error text-white font-bold rounded text-sm hover:bg-error/90"
                        >
                          Hủy
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyVoucher}
                          disabled={applyingVoucher || !voucherCodeInput}
                          className="px-4 bg-surface-container-highest border border-outline-variant rounded font-bold text-sm hover:text-primary disabled:opacity-50"
                        >
                          Áp dụng
                        </button>
                      )}
                    </div>
                  )}

                  {discountType === "loyalty_points" && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        placeholder="Số điểm muốn tiêu (1 điểm = 100đ)"
                        value={pointsToUseInput || ""}
                        onChange={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val < 0) val = 0;
                          if (val > user?.loyaltyPoints)
                            val = user.loyaltyPoints;
                          setPointsToUseInput(val);
                        }}
                        className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none"
                        min="0"
                        max={user?.loyaltyPoints || 0}
                      />
                      <button
                        onClick={() => {
                          const discount = pointsToUseInput * 100;
                          if (discount > subTotal) {
                            setDiscountAmount(subTotal);
                            setVoucherError(
                              `Bạn đã dùng ${pointsToUseInput} điểm (giảm tối đa ${formatPrice(subTotal)})`,
                            );
                          } else {
                            setDiscountAmount(discount);
                            setVoucherError(
                              `Bạn đã dùng ${pointsToUseInput} điểm (giảm ${formatPrice(discount)})`,
                            );
                          }
                        }}
                        disabled={!pointsToUseInput || pointsToUseInput <= 0}
                        className="px-4 bg-surface-container-highest border border-outline-variant rounded font-bold text-sm hover:text-primary disabled:opacity-50"
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}

                  {voucherError && (
                    <p
                      className={`text-xs mt-1 ${voucherError.includes("Đã") || voucherError.includes("Bạn đã") ? "text-success" : "text-error"}`}
                    >
                      {voucherError}
                    </p>
                  )}
                  {appliedVoucher && discountType === "voucher" && (
                    <p className="text-success text-xs mt-1">
                      Đã áp dụng mã {appliedVoucher}
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-md">Tạm tính</span>
                  <span className="font-body-md">{formatPrice(subTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span className="font-body-md">Giảm giá</span>
                    <span className="font-body-md">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-4 mt-2 border-t border-outline-variant">
                  <span className="font-headline-sm text-on-surface font-bold">
                    TỔNG CỘNG
                  </span>
                  <span className="font-headline-sm text-primary font-bold">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-primary text-on-primary py-5 rounded-lg font-headline-sm uppercase tracking-widest hover:bg-primary-fixed-dim active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                THANH TOÁN NGAY
              </button>
              <div className="flex items-center justify-center gap-2 text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-sm">
                  verified_user
                </span>
                <span className="text-xs uppercase tracking-tighter">
                  Bảo mật giao dịch bởi SSL Encryption
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* ================= QR CODE MODAL ================= */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-md text-primary text-center mb-6 uppercase tracking-widest">
              Thanh Toán Đơn Hàng
            </h3>

            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
              <QRCodeSVG value={qrData} size={250} />
            </div>

            <div className="space-y-4 mb-8 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant text-center">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">
                  Ngân hàng
                </span>
                <span className="text-on-surface font-bold text-lg">
                  MB BANK
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">
                  Số tài khoản
                </span>
                <span className="text-primary font-bold text-lg">
                  012345678999
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/50">
                <span className="text-on-surface-variant text-sm">Số tiền</span>
                <span className="text-primary font-bold text-lg">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">
                  Nội dung chuyển khoản
                </span>
                <span className="text-on-surface font-bold text-lg">
                  {currentOrder?.orderCode}
                </span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-on-surface-variant text-sm animate-pulse">
                Hệ thống đang chờ nhận tiền. Vui lòng không tắt hộp thoại này...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background min-h-screen text-on-surface flex flex-col items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
