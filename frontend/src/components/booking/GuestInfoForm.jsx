import React, { useState } from "react";

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function GuestInfoForm({ guestInfo, setGuestInfo, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fields) => {
    const newErrors = {};
    if (!fields.name || fields.name.trim() === "") {
      newErrors.name = "Vui lòng nhập họ và tên.";
    }
    if (!fields.phone || fields.phone.trim() === "") {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!PHONE_REGEX.test(fields.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam (VD: 0912345678).";
    }
    if (!fields.email || fields.email.trim() === "") {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!EMAIL_REGEX.test(fields.email.trim())) {
      newErrors.email = "Email không đúng định dạng (VD: example@email.com).";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = { name: true, phone: true, email: true };
    setTouched(allTouched);
    const validationErrors = validate(guestInfo);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    // Simulating API call
    setTimeout(() => {
      window.location.href = '/'; // Replace with actual success redirect
    }, 2000);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone") {
      value = value.replace(/[^0-9+\s]/g, "");
    }
    const updated = { ...guestInfo, [name]: value };
    setGuestInfo(updated);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(updated)[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(guestInfo)[name] }));
  };

  const inputClass = (field) =>
    `w-full bg-surface-container border rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all ${
      errors[field] && touched[field]
        ? "border-error focus:border-error focus:ring-1 focus:ring-error"
        : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
    }`;

  return (
    <div className="glass-card p-8 md:p-10 rounded-xl bg-surface-container/60">
      <h1 className="font-headline-lg text-headline-lg mb-2 text-primary">Xác nhận thông tin</h1>
      <p className="text-on-surface-variant mb-10 font-body-md text-body-md">
        Vui lòng cung cấp thông tin liên hệ để chúng tôi gửi xác nhận đặt lịch qua SMS và Email.
      </p>

      <form className="space-y-8" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ và Tên */}
          <div className="space-y-2 group">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
              Họ và Tên <span className="text-error">*</span>
            </label>
            <input
              name="name"
              value={guestInfo.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("name")}
              placeholder="Nguyễn Văn A"
              type="text"
            />
            {errors.name && touched.name && (
              <p className="text-error text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2 group">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
              Số điện thoại <span className="text-error">*</span>
            </label>
            <input
              name="phone"
              value={guestInfo.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("phone")}
              placeholder="0912 345 678"
              type="tel"
            />
            {errors.phone && touched.phone && (
              <p className="text-error text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2 group">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
            Email <span className="text-error">*</span>
          </label>
          <input
            name="email"
            value={guestInfo.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass("email")}
            placeholder="example@email.com"
            type="email"
          />
          {errors.email && touched.email && (
            <p className="text-error text-sm flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {errors.email}
            </p>
          )}
        </div>

        {/* Ghi chú */}
        <div className="space-y-2 group">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
            Ghi chú cho Barber
          </label>
          <textarea
            name="notes"
            value={guestInfo.notes}
            onChange={handleChange}
            className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg p-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all resize-none"
            placeholder="Bạn có yêu cầu đặc biệt nào không?..."
            rows="4"
          ></textarea>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-on-primary py-5 px-8 font-headline-sm text-headline-sm font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(233,193,118,0.3)] active:scale-[0.98] transition-all duration-300 flex justify-center items-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Đang xử lý... <span className="material-symbols-outlined animate-spin">refresh</span>
              </span>
            ) : (
              "Xác Nhận & Đặt Lịch"
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="md:w-1/3 border-2 border-outline-variant text-on-surface-variant py-5 px-8 font-headline-sm text-headline-sm font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary active:scale-[0.98] transition-all duration-300"
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}
