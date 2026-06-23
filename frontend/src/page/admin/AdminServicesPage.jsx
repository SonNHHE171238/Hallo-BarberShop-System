"use client";

import React, { useEffect, useState } from 'react';
import ServicePageHeader from '@/components/admin/services/ServicePageHeader';
import ServiceFilterBar from '@/components/admin/services/ServiceFilterBar';
import ServiceTable from '@/components/admin/services/ServiceTable';
import ServicePagination from '@/components/admin/services/ServicePagination';
import { serviceService } from '@/services/service.service';

const defaultServiceForm = {
  name: '',
  description: '',
  price: '',
  durationMinutes: 30,
  category: 'cut',
  isActive: true,
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
        limit: 5,
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
      isActive: service.isActive !== undefined ? service.isActive : true,
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
    const { name, value, type, checked } = event.target;
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

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      durationMinutes: Number(formData.durationMinutes),
      category: formData.category,
      isActive: formData.isActive,
    };

    if (!payload.name || Number.isNaN(payload.price) || payload.price < 0 || payload.durationMinutes <= 0) {
      setFormError('Tên dịch vụ, giá và thời lượng phải hợp lệ và không được âm.');
      setFormLoading(false);
      return;
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
    <div className="max-w-container-max mx-auto w-full">
      <ServicePageHeader onCreate={openForm} />
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-6 shadow-2xl shadow-black/5 mb-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm">{formData.id ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h3>
                  <p className="text-body-sm text-on-surface-variant">
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {formLoading && <span className="font-medium text-on-surface-variant">Đang gửi...</span>}
                  <button type="button" onClick={closeForm} className="text-on-surface-variant px-3 py-2 hover:text-primary">Đóng</button>
                </div>
              </div>

              {formError ? <div className="mb-5 rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{formError}</div> : null}
              {formSuccess ? <div className="mb-5 rounded-2xl bg-success/10 border border-success/50 px-4 py-3 text-success">{formSuccess}</div> : null}

              <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">Tên dịch vụ</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-3xl border border-outline-variant bg-surface p-4 text-on-surface"
                    placeholder="Ví dụ: Cắt tóc nam"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">Giá (VNĐ)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-3xl border border-outline-variant bg-surface p-4 text-on-surface"
                    placeholder="Ví dụ: 250000"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="font-label-sm text-on-surface-variant">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-3xl border border-outline-variant bg-surface p-4 text-on-surface"
                    placeholder="Mô tả ngắn về dịch vụ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">Thời lượng (phút)</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-outline-variant bg-surface p-4 text-on-surface"
                    placeholder="Ví dụ: 45"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-outline-variant bg-surface p-4 text-on-surface"
                  >
                    <option value="cut">Cắt</option>
                    <option value="perm">Uốn</option>
                    <option value="color">Hóa chất</option>
                    <option value="combo">Combo</option>
                    <option value="styling">Styling</option>
                    <option value="treatment">Chăm sóc</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-on-surface-variant">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border outline-none text-primary focus:ring-primary"
                    />
                    Kích hoạt dịch vụ ngay
                  </label>
                </div>
                <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-3xl border border-outline-variant bg-transparent px-8 py-4 text-on-surface transition-colors hover:border-primary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="rounded-3xl bg-primary text-on-primary px-8 py-4 font-semibold hover:bg-primary-fixed-dim transition-colors"
                  >
                    Lưu dịch vụ
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}

      {error ? (
        <div className="mb-6 rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{error}</div>
      ) : null}

      <ServiceFilterBar search={search} onSearch={setSearch} category={categoryFilter} onCategoryChange={(c) => setCategoryFilter(c)} total={total} />
      <div className="flex flex-col">
        <ServiceTable services={services} loading={loading} onEdit={openEditForm} onDelete={async (service) => {
          if (!confirm(`Xóa dịch vụ "${service.name}"?`)) return;
          try {
            await serviceService.deleteService(service._id || service.id);
            setServices((prev) => prev.filter((s) => !(s._id === (service._id || service.id) || s.id === (service._id || service.id))));
          } catch (err) {
            alert(err.message || 'Lỗi khi xóa dịch vụ');
          }
        }} />
        <ServicePagination page={page} pages={pages} total={total} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
