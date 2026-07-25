"use client";

import React, { useEffect, useState } from 'react';
import { voucherService } from '@/services/voucher.service';

const defaultVoucherForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderValue: 0,
  maxDiscountAmount: '',
  validFrom: '',
  validUntil: '',
  usageLimit: 100,
  usageLimitPerUser: 1,
  isActive: true,
  isPublic: true,
  voucherType: 'all',
};

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function getLocalDatetimeString(date = new Date()) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultVoucherForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadVouchers = async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: opts.search !== undefined ? opts.search : search,
        page: opts.page || page,
        limit: 10,
      };
      const response = await voucherService.getAllVouchers(params);
      setVouchers(response.data || []);
      if (response.pagination) {
        setTotal(response.pagination.total || 0);
        setPage(response.pagination.page || 1);
        setPages(response.pagination.pages || 1);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVouchers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadVouchers({ search, page: 1 }), 500);
    return () => clearTimeout(t);
  }, [search]);

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setFormData(defaultVoucherForm);
    setFormOpen(true);
  };

  const openEditForm = (voucher) => {
    setFormError('');
    setFormSuccess('');
    setFormData({
      id: voucher._id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscountAmount: voucher.maxDiscountAmount || '',
      validFrom: formatDateForInput(voucher.validFrom),
      validUntil: formatDateForInput(voucher.validUntil),
      usageLimit: voucher.usageLimit,
      usageLimitPerUser: voucher.usageLimitPerUser || 1,
      isActive: voucher.isActive,
      isPublic: voucher.isPublic !== undefined ? voucher.isPublic : true,
      voucherType: voucher.voucherType || 'all',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const discountValueNum = Number(formData.discountValue);
      if (formData.discountType === 'percentage' && (discountValueNum < 0 || discountValueNum > 100)) {
        setFormError('Giá trị giảm theo phần trăm chỉ được từ 0 đến 100.');
        setFormLoading(false);
        return;
      }

      const validFromDate = new Date(formData.validFrom);
      const validUntilDate = new Date(formData.validUntil);

      if (validFromDate >= validUntilDate) {
        setFormError('Ngày kết thúc phải sau ngày bắt đầu.');
        setFormLoading(false);
        return;
      }

      if (!formData.id && validUntilDate < new Date()) {
        setFormError('Ngày kết thúc không được ở trong quá khứ.');
        setFormLoading(false);
        return;
      }

      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        usageLimit: Number(formData.usageLimit),
        usageLimitPerUser: Number(formData.usageLimitPerUser),
      };
      
      if (formData.maxDiscountAmount) {
        payload.maxDiscountAmount = Number(formData.maxDiscountAmount);
      } else {
        payload.maxDiscountAmount = null;
      }

      if (formData.id) {
        await voucherService.updateVoucher(formData.id, payload);
        setFormSuccess('Cập nhật voucher thành công.');
      } else {
        await voucherService.createVoucher(payload);
        setFormSuccess('Tạo voucher mới thành công.');
      }
      loadVouchers();
      setTimeout(() => closeForm(), 1500);
    } catch (err) {
      setFormError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;
    try {
      await voucherService.deleteVoucher(id);
      loadVouchers();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa voucher');
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-6 py-4 w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="bg-surface-container-highest/60 backdrop-blur-md rounded-lg border border-outline-variant flex-1 flex flex-col min-h-0">
        
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="text-title-lg font-bold">Quản lý Mã Giảm Giá</div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end relative">
            <input 
              type="text" 
              placeholder="Tìm theo mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-sm focus:border-primary outline-none"
            />
            <button 
              onClick={openForm}
              className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded hover:brightness-110 active:scale-95 transition-all text-sm font-bold"
            >
              Thêm mới
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar relative p-4">
          {loading ? (
            <div>Đang tải...</div>
          ) : error ? (
            <div className="text-error">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant bg-surface-container-low">
                  <th className="p-3 font-bold">Mã</th>
                  <th className="p-3 font-bold">Loại</th>
                  <th className="p-3 font-bold">Giá trị</th>
                  <th className="p-3 font-bold">Hiệu lực</th>
                  <th className="p-3 font-bold">Đã dùng/Tổng</th>
                  <th className="p-3 font-bold">Trạng thái</th>
                  <th className="p-3 font-bold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="p-3 font-bold text-primary">{v.code}</td>
                    <td className="p-3">{v.discountType === 'percentage' ? 'Phần trăm (%)' : 'Giảm thẳng (VNĐ)'}</td>
                    <td className="p-3">{v.discountType === 'percentage' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}</td>
                    <td className="p-3 text-[12px] text-on-surface-variant">
                      Từ: {new Date(v.validFrom).toLocaleDateString('en-GB')}<br/>
                      Đến: {new Date(v.validUntil).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3">{v.usedCount} / {v.usageLimit}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-1 rounded text-xs font-bold ${v.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                          {v.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                        <span className={`w-fit px-2 py-1 rounded text-xs font-bold ${v.isPublic ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {v.isPublic ? 'Công khai' : 'Riêng tư'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditForm(v)} className="text-primary hover:underline font-bold text-[13px]">Sửa</button>
                        <button onClick={() => handleDelete(v._id)} className="text-error hover:underline font-bold text-[13px]">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-outline-variant shrink-0 bg-surface-container-highest/60 p-3 flex justify-between items-center text-sm">
          <div>Trang {page} / {pages} (Tổng {total})</div>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => { setPage(page-1); loadVouchers({ page: page - 1 }); }} className="px-3 py-1 bg-surface-container border border-outline-variant rounded disabled:opacity-50">Trước</button>
            <button disabled={page >= pages} onClick={() => { setPage(page+1); loadVouchers({ page: page + 1 }); }} className="px-3 py-1 bg-surface-container border border-outline-variant rounded disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className="w-full max-w-xl max-h-[90vh] overflow-auto custom-scrollbar">
            <section className="rounded-2xl bg-surface-container-low p-5 shadow-2xl shadow-black/5">
              <h3 className="font-bold text-headline-sm text-primary mb-4">{formData.id ? 'Sửa Voucher' : 'Tạo Voucher'}</h3>
              
              {formError && <div className="mb-4 text-error text-sm">{formError}</div>}
              {formSuccess && <div className="mb-4 text-success text-sm">{formSuccess}</div>}

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Mã giảm giá</label>
                  <input name="code" value={formData.code} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded uppercase text-sm" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Loại giảm</label>
                  <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm">
                    <option value="percentage">Theo %</option>
                    <option value="fixed_amount">Số tiền cố định</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Phạm vi áp dụng</label>
                  <select name="voucherType" value={formData.voucherType} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm">
                    <option value="all">Mọi hóa đơn (Cả cắt tóc & mua hàng)</option>
                    <option value="booking_only">Chỉ áp dụng Đặt lịch cắt tóc</option>
                    <option value="product_only">Chỉ áp dụng Mua sáp/sản phẩm</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Giá trị giảm</label>
                  <input name="discountValue" type="number" min="0" max={formData.discountType === 'percentage' ? "100" : undefined} value={formData.discountValue} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Đơn tối thiểu</label>
                  <input name="minOrderValue" type="number" min="0" value={formData.minOrderValue} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" />
                </div>

                {formData.discountType === 'percentage' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase">Giảm tối đa (VNĐ)</label>
                    <input name="maxDiscountAmount" type="number" min="0" value={formData.maxDiscountAmount} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" placeholder="Không bắt buộc" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Lượt dùng tổng</label>
                  <input name="usageLimit" type="number" min="1" value={formData.usageLimit} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Lượt dùng mỗi người</label>
                  <input name="usageLimitPerUser" type="number" min="1" value={formData.usageLimitPerUser} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Từ ngày</label>
                  <input name="validFrom" type="datetime-local" min={!formData.id ? getLocalDatetimeString() : undefined} value={formData.validFrom} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase">Đến ngày</label>
                  <input name="validUntil" type="datetime-local" min={formData.validFrom || (!formData.id ? getLocalDatetimeString() : undefined)} value={formData.validUntil} onChange={handleChange} required className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary outline-none p-2 rounded text-sm" />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2 pt-2 border-t border-outline-variant flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 accent-primary" />
                    Kích hoạt
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 accent-primary" />
                    Công khai (Public)
                  </label>
                </div>

                <div className="md:col-span-2 pt-2 border-t flex justify-end gap-2">
                  <button type="button" onClick={closeForm} className="px-4 py-2 text-sm font-bold">Hủy</button>
                  <button type="submit" disabled={formLoading} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50">Lưu</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
