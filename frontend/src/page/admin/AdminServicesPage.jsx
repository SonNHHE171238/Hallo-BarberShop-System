"use client";

import React, { useEffect, useState } from 'react';
import ServiceTable from '@/components/admin/services/ServiceTable';
import ServicePagination from '@/components/admin/services/ServicePagination';
import { serviceService } from '@/services/service.service';

const defaultServiceForm = {
  name: '',
  description: '',
  price: '',
  durationMinutes: 30,
  category: 'cut',
  imageFile: null,
  imagePreview: '',
  existingImageUrl: '',
};

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultServiceForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadServices = async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: opts.search !== undefined ? opts.search : search,
        category: opts.category !== undefined ? opts.category : (categoryFilter === 'all' ? '' : categoryFilter),
        page: opts.page || page,
        limit: 9,
      };
      const response = await serviceService.getAllServices(params);
      setServices(response.services || []);
      if (response.pagination) {
        setTotal(response.pagination.total || 0);
        setPage(response.pagination.page || 1);
        setPages(response.pagination.pages || 1);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadServices({ search, category: categoryFilter === 'all' ? '' : categoryFilter, page: 1 }), 350);
    return () => clearTimeout(t);
  }, [search, categoryFilter]);

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setFormData(defaultServiceForm);
    setFormOpen(true);
  };

  const openEditForm = (service) => {
    const imageUrl = (service.images && service.images[0]) || service.image || '';
    setFormError('');
    setFormSuccess('');
    setFormData({
      ...defaultServiceForm,
      id: service._id || service.id,
      name: service.name || '',
      description: service.description || '',
      price: service.price !== undefined ? service.price : '',
      durationMinutes: service.durationMinutes !== undefined ? service.durationMinutes : (service.duration || 30),
      category: service.category || 'cut',
      imageFile: null,
      imagePreview: imageUrl,
      imageBase64: '',
      existingImageUrl: imageUrl,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError('');
    setFormSuccess('');
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pages || newPage === page) return;
    setPage(newPage);
    await loadServices({ page: newPage });
  };

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (name === 'imageFile' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    if (!formData.name.trim() || Number.isNaN(Number(formData.price)) || Number(formData.price) < 0 || Number(formData.durationMinutes) <= 0) {
      setFormError('Tên dịch vụ, giá và thời lượng phải hợp lệ và không được âm.');
      setFormLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('price', Number(formData.price));
    payload.append('durationMinutes', Number(formData.durationMinutes));
    payload.append('category', formData.category);

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

    try {
      let response;
      if (formData.id) {
        response = await serviceService.updateService(formData.id, payload);
        const updatedService = response.service || response;
        setFormSuccess('Cập nhật dịch vụ thành công.');
        await loadServices({ page });
      } else {
        response = await serviceService.createService(payload);
        setFormSuccess('Tạo dịch vụ thành công.');
        setServices((prev) => [response.service || response, ...prev]);
      }

      setFormOpen(false);
    } catch (err) {
      setFormError(err.message || 'Có lỗi khi tạo/cập nhật dịch vụ.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-4 w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden">



      <div className="bg-surface-container-highest/60 backdrop-blur-md rounded-lg overflow-hidden border border-outline-variant flex-1 flex flex-col min-h-0">

        {/* Filter Bar Integrated */}
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-body-md hidden sm:inline whitespace-nowrap">Danh mục:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-surface-container border border-outline-variant px-3 py-2 rounded focus:ring-1 focus:ring-primary text-body-md outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="cut">Cắt</option>
              <option value="perm">Uốn</option>
              <option value="color">Hóa chất</option>
              <option value="combo">Combo</option>
              <option value="styling">Styling</option>
              <option value="treatment">Chăm sóc</option>
            </select>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-on-surface pl-8"
              />
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[18px] pointer-events-none">search</span>
            </div>

            <button
              onClick={openForm}
              className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded hover:brightness-110 active:scale-95 transition-all font-bold uppercase tracking-wider text-[13px]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm mới
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1 custom-scrollbar relative">
          <ServiceTable services={services} loading={loading} onEdit={openEditForm} onDelete={async (service) => {
            if (!confirm(`Xóa dịch vụ "${service.name}"?`)) return;
            try {
              await serviceService.deleteService(service._id || service.id);
              setServices((prev) => prev.filter((s) => !(s._id === (service._id || service.id) || s.id === (service._id || service.id))));
            } catch (err) {
              alert(err.message || 'Lỗi khi xóa dịch vụ');
            }
          }} />
        </div>

        <div className="border-t border-outline-variant shrink-0 bg-surface-container-highest/60">
          <ServicePagination page={page} pages={pages} total={total} onPageChange={handlePageChange} />
        </div>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto custom-scrollbar">
            <section className="rounded-2xl border border-outline-gold bg-surface-container-low p-5 shadow-2xl shadow-black/5 mb-0">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-headline-sm text-primary">{formData.id ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h3>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  {formLoading && <span className="font-medium text-on-surface-variant text-sm">Đang gửi...</span>}
                  <button type="button" onClick={closeForm} className="text-on-surface-variant px-2 py-1 hover:text-error text-sm font-bold">Đóng</button>
                </div>
              </div>

              {formError ? <div className="mb-4 rounded-xl bg-error/10 border border-error/50 px-3 py-2 text-error text-sm">{formError}</div> : null}
              {formSuccess ? <div className="mb-4 rounded-xl bg-success/10 border border-success/50 px-3 py-2 text-success text-sm">{formSuccess}</div> : null}

              <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Tên dịch vụ</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                    placeholder="Ví dụ: Cắt tóc nam"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Giá (VNĐ)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Ví dụ: 250000"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary outline-none custom-scrollbar"
                    placeholder="Mô tả ngắn về dịch vụ"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Thời lượng (phút)</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Ví dụ: 45"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary outline-none"
                  >
                    <option value="cut">Cắt</option>
                    <option value="perm">Uốn</option>
                    <option value="color">Hóa chất</option>
                    <option value="combo">Combo</option>
                    <option value="styling">Styling</option>
                    <option value="treatment">Chăm sóc</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Ảnh minh họa (Bắt buộc nếu chưa có ảnh)</label>
                  <div className="flex gap-4">
                    {formData.imagePreview && (
                      <img src={formData.imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-outline-variant shrink-0" />
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-3 text-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      <span className="font-bold text-[13px]">Chọn ảnh (PNG, JPG)</span>
                      <input
                        type="file"
                        name="imageFile"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2 mt-2 border-t border-outline-variant flex justify-end">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-primary text-on-primary px-6 py-2 rounded font-bold uppercase tracking-wider text-[13px] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {formLoading ? 'Đang lưu...' : 'Lưu dịch vụ'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}

      {error ? (
        <div className="mt-4 rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{error}</div>
      ) : null}
    </div>
  );
}
