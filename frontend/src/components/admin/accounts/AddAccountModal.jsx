import React, { useState } from 'react';
import { adminAccountService } from '@/services/adminAccount.service';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

export default function AddAccountModal({ isOpen, onClose }) {
    const { mutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff'
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        setIsLoading(true);
        try {
            await adminAccountService.createAccount(formData);
            toast.success('Tạo tài khoản mới thành công!');
            
            // Refresh table data
            mutate('/api/admin/accounts');
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'staff'
            });
            onClose();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo tài khoản');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface border border-outline-variant rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-headline-md text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">person_add</span>
                        Thêm Tài Khoản Mới
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-error transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                    <form id="add-account-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2 group">
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
                                Họ và Tên <span className="text-error">*</span>
                            </label>
                            <input 
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                                placeholder="Vd: Nguyễn Văn A" 
                                type="text" 
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
                                Địa chỉ Email <span className="text-error">*</span>
                            </label>
                            <input 
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                                placeholder="Vd: admin@hallobarber.vn" 
                                type="email" 
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
                                Số Điện Thoại
                            </label>
                            <input 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                                placeholder="Vd: 090 123 4567" 
                                type="tel" 
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
                                Mật Khẩu <span className="text-error">*</span>
                            </label>
                            <input 
                                required
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all" 
                                placeholder="Ít nhất 6 ký tự" 
                                type="password" 
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider group-focus-within:text-primary transition-colors">
                                Vai Trò (Chức vụ) <span className="text-error">*</span>
                            </label>
                            <div className="relative">
                                <select 
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container border border-outline-variant text-on-surface rounded p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md appearance-none cursor-pointer transition-all"
                                >
                                    <option value="admin">Quản trị viên (Admin)</option>
                                    <option value="staff">Nhân viên Lễ tân (Staff)</option>
                                    <option value="barber">Thợ cắt tóc (Barber)</option>
                                    <option value="customer">Khách hàng (Customer)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-outline-variant/50 bg-surface-container-lowest flex justify-end gap-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded border border-outline-variant text-on-surface hover:border-error hover:text-error transition-colors disabled:opacity-50"
                    >
                        Hủy Bỏ
                    </button>
                    <button 
                        form="add-account-form"
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded bg-primary text-on-primary font-semibold hover:scale-95 transition-transform duration-200 shadow-[0_0_15px_rgba(255,222,165,0.15)] flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">check</span>
                        )}
                        {isLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                    </button>
                </div>
            </div>
        </div>
    );
}
