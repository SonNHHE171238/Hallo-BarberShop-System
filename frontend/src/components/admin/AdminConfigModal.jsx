"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminConfigModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'brands'
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', logoUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'categories') {
        const res = await axios.get('http://localhost:5000/api/categories?includeInactive=true');
        if (res.data.success) setCategories(res.data.data);
      } else {
        const res = await axios.get('http://localhost:5000/api/brands?includeInactive=true');
        if (res.data.success) setBrands(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setIsEditing(null);
      setFormData({ name: '', description: '', logoUrl: '', logoFile: null });
    }
  }, [isOpen, activeTab, fetchData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'categories') {
        const res = await axios.get('http://localhost:5000/api/categories?includeInactive=true');
        if (res.data.success) setCategories(res.data.data);
      } else {
        const res = await axios.get('http://localhost:5000/api/brands?includeInactive=true');
        if (res.data.success) setBrands(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(item._id);
    setFormData({ 
        name: item.name, 
        description: item.description || '', 
        logoUrl: item.logoUrl || '',
        logoFile: null
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: '', description: '', logoUrl: '', logoFile: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Tên không được để trống');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = activeTab === 'categories' 
        ? 'http://localhost:5000/api/categories' 
        : 'http://localhost:5000/api/brands';

      let payload;
      let headers = { withCredentials: true };

      if (activeTab === 'brands') {
        payload = new FormData();
        payload.append('name', formData.name);
        payload.append('description', formData.description);
        if (formData.logoFile) {
          payload.append('logo', formData.logoFile);
        } else if (formData.logoUrl) {
          payload.append('logoUrl', formData.logoUrl);
        }
      } else {
        payload = formData;
      }

      let res;
      if (isEditing) {
        res = await axios.put(`${url}/${isEditing}`, payload, headers);
      } else {
        res = await axios.post(url, payload, headers);
      }

      if (res.data.success) {
        toast.success(isEditing ? 'Cập nhật thành công' : 'Thêm mới thành công');
        handleCancelEdit();
        fetchData();
        if (onSuccess) onSuccess(); // Notify parent to reload data if needed
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;

    try {
      const url = activeTab === 'categories' 
        ? `http://localhost:5000/api/categories/${id}` 
        : `http://localhost:5000/api/brands/${id}`;

      const res = await axios.delete(url, { withCredentials: true });
      if (res.data.success) {
        toast.success('Xóa thành công');
        fetchData();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa do ràng buộc dữ liệu');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface-container-high rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">settings_applications</span>
            Cấu hình Danh mục & Hãng
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-bright/20 text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant px-6 bg-surface-container">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'categories' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Danh mục
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'brands' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Hãng (Thương hiệu)
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Form Side */}
          <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-outline-variant bg-surface-container-highest/30">
            <h3 className="font-bold text-on-surface mb-4">
              {isEditing ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'categories' ? 'Danh mục' : 'Hãng'}
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-outline mb-1">Tên {activeTab === 'categories' ? 'danh mục' : 'hãng'}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-sm focus:border-primary outline-none text-on-surface"
                  placeholder="Nhập tên..."
                />
              </div>

              {activeTab === 'brands' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-outline mb-1">Logo Hãng (Tùy chọn)</label>
                  <div className="flex items-center gap-3">
                    {(formData.logoUrl || formData.logoFile) ? (
                      <div className="relative w-12 h-12 rounded border border-outline-variant shrink-0 bg-white">
                        <img 
                          src={formData.logoFile ? URL.createObjectURL(formData.logoFile) : formData.logoUrl} 
                          alt="preview" 
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, logoUrl: '', logoFile: null})}
                          className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center hover:brightness-110"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="w-12 h-12 rounded border border-dashed border-outline-variant flex items-center justify-center shrink-0 cursor-pointer hover:bg-surface-bright/10 text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setFormData({...formData, logoFile: e.target.files[0]});
                            }
                          }}
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <span className="text-xs text-on-surface-variant">Tải ảnh lên từ máy tính của bạn</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-outline mb-1">Mô tả (Tùy chọn)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-sm focus:border-primary outline-none text-on-surface min-h-[80px]"
                  placeholder="Nhập mô tả..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {isEditing && (
                  <button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 border border-outline-variant text-on-surface-variant rounded hover:bg-surface-bright transition-colors text-sm font-bold uppercase"
                  >
                    Hủy
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-on-primary rounded hover:brightness-110 transition-colors text-sm font-bold uppercase disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>

          {/* Table Side */}
          <div className="w-full md:w-2/3 flex flex-col h-full bg-surface-container-low overflow-hidden">
            <div className="overflow-auto custom-scrollbar flex-1 p-6">
              {loading ? (
                <div className="text-center text-outline py-8">Đang tải dữ liệu...</div>
              ) : (
                <table className="w-full min-w-[500px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="py-2 px-3 text-xs uppercase tracking-widest text-outline font-bold">Tên</th>
                      <th className="py-2 px-3 text-xs uppercase tracking-widest text-outline font-bold hidden sm:table-cell">Mô tả</th>
                      <th className="py-2 px-3 text-xs uppercase tracking-widest text-outline font-bold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'categories' ? (
                      categories.length === 0 ? (
                        <tr><td colSpan="3" className="py-4 text-center text-outline">Chưa có danh mục nào</td></tr>
                      ) : (
                        categories.map(cat => (
                          <tr key={cat._id} className="border-b border-outline-variant/30 hover:bg-surface-bright/5">
                            <td className="py-3 px-3 font-medium text-on-surface">{cat.name}</td>
                            <td className="py-3 px-3 text-sm text-on-surface-variant hidden sm:table-cell truncate max-w-[200px]">{cat.description || '-'}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleEdit(cat)} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      brands.length === 0 ? (
                        <tr><td colSpan="3" className="py-4 text-center text-outline">Chưa có hãng nào</td></tr>
                      ) : (
                        brands.map(brand => (
                          <tr key={brand._id} className="border-b border-outline-variant/30 hover:bg-surface-bright/5">
                            <td className="py-3 px-3 flex items-center gap-3">
                              {brand.logoUrl ? (
                                <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 rounded object-cover border border-outline-variant bg-white" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-surface-container border border-outline-variant flex items-center justify-center">
                                  <span className="material-symbols-outlined text-sm text-outline">image</span>
                                </div>
                              )}
                              <span className="font-medium text-on-surface">{brand.name}</span>
                            </td>
                            <td className="py-3 px-3 text-sm text-on-surface-variant hidden sm:table-cell truncate max-w-[150px]">{brand.description || '-'}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleEdit(brand)} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={() => handleDelete(brand._id, brand.name)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
