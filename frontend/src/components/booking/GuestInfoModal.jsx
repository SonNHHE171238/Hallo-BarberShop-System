import React, { useState } from "react";

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

export default function GuestInfoModal({ onClose, bookingData }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      newErrors.phone = "Số điện thoại không đúng định dạng (VD: 0912345678).";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    const validationErrors = validate({ name, phone });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9+\s]/g, "");
    setPhone(val);
    if (touched.phone) {
      const err = validate({ name, phone: val });
      setErrors((prev) => ({ ...prev, phone: err.phone }));
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (touched.name) {
      const err = validate({ name: e.target.value, phone });
      setErrors((prev) => ({ ...prev, name: err.name }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validate({ name, phone });
    setErrors((prev) => ({ ...prev, [field]: err[field] }));
  };

  const inputClass = (field) =>
    `w-full bg-surface-container-highest border rounded-lg px-4 py-3 text-on-surface outline-none transition-all ${
      errors[field] && touched[field]
        ? "border-error focus:border-error focus:ring-1 focus:ring-error"
        : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
    }`;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="glass-card bg-surface-container-high p-8 rounded-xl max-w-md w-full border border-primary text-center shadow-[0_0_30px_rgba(233,193,118,0.2)]">
          <span className="material-symbols-outlined text-primary text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2 className="text-headline-md font-headline-md text-primary mb-2">Đặt Lịch Thành Công!</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Cảm ơn anh {name} đã đặt lịch. Chúng tôi sẽ liên hệ lại qua số {phone} để xác nhận trong ít phút tới.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline-sm hover:bg-primary-container transition-all"
          >
            Quay về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card bg-surface-container p-8 rounded-xl max-w-md w-full border border-outline-variant relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Thông Tin Liên Hệ</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          Vui lòng để lại thông tin để chúng tôi xác nhận lịch hẹn của bạn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Họ và Tên */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">
              Họ và Tên <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={() => handleBlur("name")}
              placeholder="VD: Nguyễn Văn A"
              className={inputClass("name")}
            />
            {errors.name && touched.name && (
              <p className="text-error text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">
              Số Điện Thoại <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur("phone")}
              placeholder="VD: 0912345678"
              className={inputClass("phone")}
            />
            {errors.phone && touched.phone && (
              <p className="text-error text-sm flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.phone}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-headline-sm mt-6 hover:bg-primary-container transition-all flex justify-center items-center gap-2"
          >
            <span>Hoàn Tất</span>
            <span className="material-symbols-outlined">done</span>
          </button>
        </form>
      </div>
    </div>
  );
}
