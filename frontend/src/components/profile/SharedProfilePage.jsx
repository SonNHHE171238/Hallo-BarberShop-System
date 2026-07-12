"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function SharedProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        if (data && data.user) {
          setUser(data.user);
          setPhone(data.user.phone || "");
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin": return "Quản trị viên";
      case "barber": return "Thợ cắt tóc";
      case "staff": return "Nhân viên";
      case "customer": return "Khách hàng";
      default: return role;
    }
  };

  const getJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handlePhoneSave = async () => {
    if (phone !== user?.phone) {
      try {
        setMessage({ text: "Đang lưu số điện thoại...", type: "info" });
        await authService.updateProfile({ phone });
        setUser({ ...user, phone });
        setMessage({ text: "Cập nhật số điện thoại thành công!", type: "success" });
      } catch (error) {
        setMessage({ text: error.message || "Lỗi cập nhật số điện thoại", type: "error" });
        setPhone(user?.phone || ""); // revert
      }
    }
  };

  const handleSave = async () => {
    setMessage({ text: "", type: "" });
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return setMessage({ text: "Vui lòng nhập đầy đủ thông tin mật khẩu", type: "error" });
      }
      if (newPassword !== confirmPassword) {
        return setMessage({ text: "Mật khẩu xác nhận không khớp", type: "error" });
      }
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage({ text: "Đổi mật khẩu thành công!", type: "success" });
    } catch (error) {
      setMessage({ text: error.message || "Có lỗi xảy ra", type: "error" });
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setMessage({ text: "Đang tải ảnh lên...", type: "info" });
      const res = await authService.uploadAvatar(file);
      if (res && res.user) {
        setUser(res.user);
        setMessage({ text: "Cập nhật ảnh đại diện thành công!", type: "success" });
      }
    } catch (error) {
      setMessage({ text: error.message || "Có lỗi khi tải ảnh", type: "error" });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface">Đang tải...</div>;
  }

  return (
    <div className="w-full h-full lg:h-[calc(100vh-80px)] flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-2 tracking-tight">Thông tin cá nhân</h2>
            <div className="h-1 w-12 bg-primary"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-0">
              <div className="bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant p-8 text-center flex flex-col items-center rounded-xl">
                <label className="relative group cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-primary/30 p-1 group-hover:border-primary transition-all duration-500 bg-surface-container-highest flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img
                        className="w-full h-full object-cover rounded-full"
                        alt="Avatar"
                        src={user.avatarUrl}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[80px] text-on-surface-variant">person</span>
                    )}
                  </div>
                  <div className="absolute inset-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                    <span className="text-[10px] font-label-md text-primary uppercase tracking-widest">Thay đổi ảnh</span>
                  </div>
                </label>
                <div className="mt-6">
                  <h3 className="font-headline-sm text-headline-sm text-on-background">{user?.name || "Người dùng"}</h3>
                  <p className="font-label-md text-label-md text-primary mt-1 uppercase tracking-widest">{getRoleDisplay(user?.role)}</p>
                </div>
                <div className="w-full mt-8 pt-8 border-t border-outline-variant/20 flex justify-between gap-4">
                  {(user?.role !== 'admin' && user?.role !== 'staff') ? (
                    <div className="text-left">
                      <p className="text-[10px] text-outline uppercase tracking-tighter">Thành viên từ</p>
                      <p className="font-label-md text-on-surface">{getJoinDate(user?.createdAt)}</p>
                    </div>
                  ) : <div></div>}
                  <div className="text-right">
                    <p className="text-[10px] text-outline uppercase tracking-tighter">Trạng thái</p>
                    <p className="font-label-md text-primary">Đang hoạt động</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Settings Form */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Section: Personal Info */}
              <section className="bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-8">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="font-headline-sm text-headline-sm uppercase tracking-tight">Thông tin cơ bản</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-[12px] font-label-md text-outline uppercase tracking-widest ml-1">Họ và tên</label>
                    <input
                      className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-4 py-3 focus:border-primary transition-all rounded-sm font-body-md opacity-60 cursor-not-allowed outline-none"
                      readOnly
                      type="text"
                      value={user?.name || ""}
                    />
                    <p className="text-[10px] text-outline italic ml-1">* Liên hệ quản trị viên để thay đổi thông tin định danh.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-label-md text-outline uppercase tracking-widest ml-1">Số điện thoại</label>
                    <input
                      className="bg-surface-obsidian border border-outline-variant/30 text-on-surface px-4 py-3 focus:border-primary transition-all rounded-sm font-body-md outline-none"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={handlePhoneSave}
                    />
                    <p className="text-[10px] text-outline italic ml-1">* Tự động lưu khi nhập xong.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-label-md text-outline uppercase tracking-widest ml-1">Email</label>
                    <input
                      className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-4 py-3 focus:border-primary transition-all rounded-sm font-body-md opacity-60 cursor-not-allowed outline-none"
                      readOnly
                      type="email"
                      value={user?.email || ""}
                    />
                  </div>
                </div>
              </section>

              {/* Section: Security */}
              <section className="bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-8">
                  <span className="material-symbols-outlined text-primary">shield_lock</span>
                  <h3 className="font-headline-sm text-headline-sm uppercase tracking-tight">Bảo mật tài khoản</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-label-md text-outline uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-obsidian border border-outline-variant/30 text-on-surface px-4 py-3 focus:border-primary transition-all rounded-sm font-body-md outline-none"
                        placeholder="••••••••"
                        type={isCurrentPasswordVisible ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <span
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-primary"
                        onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                      >
                        {isCurrentPasswordVisible ? "visibility_off" : "visibility"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-label-md text-outline uppercase tracking-widest ml-1">Mật khẩu mới</label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-obsidian border border-outline-variant/30 text-on-surface px-4 py-3 focus:border-primary transition-all rounded-sm font-body-md outline-none"
                          type={isPasswordVisible ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <span
                          className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-primary"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                          {isPasswordVisible ? "visibility_off" : "visibility"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-label-md text-outline uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-obsidian border border-outline-variant/30 text-on-surface px-4 py-3 focus:border-primary transition-all rounded-sm font-body-md outline-none"
                          type={isConfirmPasswordVisible ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                          className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-primary"
                          onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        >
                          {isConfirmPasswordVisible ? "visibility_off" : "visibility"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {message.text && (
                  <div className={`mt-6 p-4 rounded-sm font-body-md flex items-center gap-3 ${message.type === 'error' ? 'bg-error-container text-on-error-container' : message.type === 'info' ? 'bg-surface-variant text-on-surface' : 'bg-primary-container text-on-primary-container'}`}>
                    <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : message.type === 'info' ? 'sync' : 'check_circle'}</span>
                    {message.text}
                  </div>
                )}

                {/* Form Actions for Password */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/20">
                  <button
                    onClick={() => router.back()}
                    className="w-full sm:w-auto px-8 py-3 border border-outline-variant text-on-surface-variant font-label-md text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors active:scale-95 rounded-sm"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary font-label-md text-sm font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/10 transition-all active:scale-95 rounded-sm"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

