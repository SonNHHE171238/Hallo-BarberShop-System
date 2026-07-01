"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CustomDropdown = ({ options, value, onChange, placeholder, onAddClick, addLabel, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-surface-container-lowest border p-2.5 rounded-lg font-body-md transition-all flex items-center justify-between cursor-pointer ${
          hasError 
            ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
            : isOpen 
              ? 'border-primary ring-1 ring-primary' 
              : 'border-outline-variant hover:border-primary'
        }`}
      >
        <span className={displayValue !== placeholder ? 'text-on-surface' : 'text-on-surface-variant'}>
          {displayValue}
        </span>
        <span className={`material-symbols-outlined text-outline-variant transition-transform text-[20px] ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg shadow-xl overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 cursor-pointer hover:bg-surface-bright/20 transition-colors ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
          {onAddClick && (
            <div 
              className="border-t border-outline-variant px-4 py-2.5 bg-primary/10 hover:bg-primary/20 cursor-pointer text-primary font-bold text-sm flex items-center gap-1 transition-colors"
              onClick={() => {
                setIsOpen(false);
                onAddClick();
              }}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {addLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AdminProductModal({ isOpen, onClose, productId, onSuccess }) {
  const isEditMode = !!productId;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    categoryId: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    imageFile: null,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Nested Modals State
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: "", description: "" });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Reset and fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setFormData({
        name: "",
        brand: "",
        categoryId: "",
        description: "",
        price: "",
        stock: "",
        image: "",
        imageFile: null,
      });
      
      const fetchOptions = async () => {
        try {
          const [catRes, brandRes] = await Promise.all([
            axios.get("http://localhost:5000/api/categories"),
            axios.get("http://localhost:5000/api/products/brands")
          ]);
          if (catRes.data.success) setCategories(catRes.data.data);
          if (brandRes.data.success) setBrands(brandRes.data.data);
        } catch (error) {
          console.error("Error fetching options:", error);
          toast.error("Không thể tải danh mục và hãng.");
        }
      };
      
      fetchOptions();

      if (isEditMode) {
        setInitialLoading(true);
        const fetchProduct = async () => {
          try {
            const res = await axios.get(`http://localhost:5000/api/products/${productId}`);
            if (res.data.success) {
              const prod = res.data.data;
              setFormData({
                name: prod.name || "",
                brand: prod.brand || "",
                categoryId: prod.categoryId?._id || prod.categoryId || "",
                description: prod.description || "",
                price: prod.price || "",
                stock: prod.stock || "",
                image: prod.image || "",
                imageFile: null,
              });
            }
          } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Không thể tải thông tin sản phẩm.");
            onClose(); // Close on failure
          } finally {
            setInitialLoading(false);
          }
        };
        fetchProduct();
      }
    }
  }, [isOpen, productId, isEditMode, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "brand" && value === "ADD_NEW_BRAND") {
      setShowBrandModal(true);
      return;
    }
    if (name === "categoryId" && value === "ADD_NEW_CATEGORY") {
      setShowCategoryModal(true);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ 
        ...prev, 
        imageFile: file,
        image: URL.createObjectURL(file) 
      }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleCreateBrand = () => {
    if (!newBrandName.trim()) {
      toast.error("Vui lòng nhập tên hãng");
      return;
    }
    if (!brands.includes(newBrandName.trim())) {
      setBrands((prev) => [...prev, newBrandName.trim()]);
    }
    setFormData((prev) => ({ ...prev, brand: newBrandName.trim() }));
    setNewBrandName("");
    setShowBrandModal(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    try {
      setIsCreatingCategory(true);
      const res = await axios.post("http://localhost:5000/api/categories", newCategoryData, { withCredentials: true });
      if (res.data.success) {
        const newCat = res.data.data;
        setCategories((prev) => [...prev, newCat]);
        setFormData((prev) => ({ ...prev, categoryId: newCat._id }));
        setNewCategoryData({ name: "", description: "" });
        setShowCategoryModal(false);
        toast.success("Tạo danh mục thành công");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo danh mục");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const missingFields = [];

    if (!formData.name.trim()) { newErrors.name = "Tên sản phẩm không được để trống."; missingFields.push("Tên sản phẩm"); }
    if (!formData.categoryId) { newErrors.categoryId = "Vui lòng chọn danh mục."; missingFields.push("Danh mục"); }
    if (formData.price === "" || Number(formData.price) < 0) { newErrors.price = "Giá bán phải từ 0 trở lên."; missingFields.push("Giá bán"); }
    if (formData.stock === "" || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) { newErrors.stock = "Tồn kho phải là số nguyên dương."; missingFields.push("Số lượng tồn kho"); }
    if (!formData.image.trim() && !formData.imageFile) { newErrors.image = "Vui lòng chọn ảnh."; missingFields.push("Đường dẫn ảnh"); }

    setErrors(newErrors);
    return missingFields;
  };

  const handleSubmit = async () => {
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      toast.error(`Vui lòng kiểm tra lại:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    setLoading(true);
    try {
      let payload;
      const headers = { withCredentials: true };

      if (formData.imageFile) {
        payload = new FormData();
        payload.append("name", formData.name);
        payload.append("brand", formData.brand);
        payload.append("categoryId", formData.categoryId);
        payload.append("description", formData.description);
        payload.append("price", Number(formData.price));
        payload.append("stock", Number(formData.stock));
        payload.append("image", formData.imageFile);
        headers["Content-Type"] = "multipart/form-data";
      } else {
        payload = {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        };
      }

      let res;
      if (isEditMode) {
        res = await axios.put(`http://localhost:5000/api/products/${productId}`, payload, { headers });
      } else {
        res = await axios.post("http://localhost:5000/api/products", payload, { headers });
      }

      if (res.data.success) {
        toast.success(isEditMode ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-obsidian/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface text-on-surface rounded-xl shadow-2xl w-full max-w-[1000px] max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low shrink-0">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              {isEditMode ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface-container-lowest/50">
          {initialLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="text-on-surface-variant animate-pulse">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Form Details */}
              <div className="lg:col-span-8 space-y-4">
                {/* General Info */}
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    <h3 className="font-headline-sm text-body-lg font-bold">Thông tin cơ bản</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Tên sản phẩm <span className="text-error">*</span></label>
                      <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-surface-container-lowest border p-2.5 rounded-lg text-on-surface font-body-md focus:ring-1 transition-all ${errors.name ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`} 
                        placeholder="Ví dụ: Sáp vuốt tóc Reuzel Blue Strong Hold" 
                        type="text"
                      />
                      {errors.name && <p className="text-error text-[10px] mt-1 font-bold">{errors.name}</p>}
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Tên hãng</label>
                      <div className="relative">
                        <CustomDropdown 
                          options={brands.map(b => ({ value: b, label: b }))}
                          value={formData.brand}
                          onChange={(val) => handleChange({ target: { name: 'brand', value: val } })}
                          placeholder="Chọn hãng sản xuất"
                          onAddClick={() => handleChange({ target: { name: 'brand', value: 'ADD_NEW_BRAND' } })}
                          addLabel="Thêm hãng mới"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Danh mục <span className="text-error">*</span></label>
                      <div className="relative">
                        <CustomDropdown 
                          options={categories.map(c => ({ value: c._id, label: c.name }))}
                          value={formData.categoryId}
                          onChange={(val) => handleChange({ target: { name: 'categoryId', value: val } })}
                          placeholder="Chọn danh mục"
                          onAddClick={() => handleChange({ target: { name: 'categoryId', value: 'ADD_NEW_CATEGORY' } })}
                          addLabel="Thêm danh mục mới"
                          hasError={!!errors.categoryId}
                        />
                      </div>
                      {errors.categoryId && <p className="text-error text-[10px] mt-1 font-bold">{errors.categoryId}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Mô tả sản phẩm</label>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant p-2.5 rounded-lg text-on-surface font-body-md resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        placeholder="Nhập mô tả chi tiết về sản phẩm..." 
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Inventory & Price */}
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    <h3 className="font-headline-sm text-body-lg font-bold">Giá & Kho hàng</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Giá bán <span className="text-error">*</span></label>
                      <div className="relative">
                        <input 
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className={`w-full bg-surface-container-lowest border p-2.5 pr-14 rounded-lg text-on-surface font-body-md font-label-md focus:ring-1 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.price ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`} 
                          placeholder="0" 
                          type="number"
                          min="0"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">VNĐ</span>
                      </div>
                      {errors.price && <p className="text-error text-[10px] mt-1 font-bold">{errors.price}</p>}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Tồn kho <span className="text-error">*</span></label>
                      <input 
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className={`w-full bg-surface-container-lowest border p-2.5 rounded-lg text-on-surface font-body-md font-label-md focus:ring-1 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.stock ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`} 
                        placeholder="0" 
                        type="number"
                        min="0"
                      />
                      {errors.stock && <p className="text-error text-[10px] mt-1 font-bold">{errors.stock}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Media */}
              <div className="lg:col-span-4 h-full">
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    <h3 className="font-headline-sm text-body-lg font-bold">Hình ảnh</h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Ảnh sản phẩm <span className="text-error">*</span></label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={`w-full bg-surface-container-lowest border p-2.5 rounded-lg text-on-surface font-body-md focus:ring-1 transition-all ${errors.image ? 'border-error focus:border-error focus:ring-error mb-1' : 'border-outline-variant focus:border-primary focus:ring-primary mb-4'}`} 
                    />
                    {errors.image && <p className="text-error text-[10px] mb-4 font-bold">{errors.image}</p>}
                    
                    <div className={`w-full min-h-[150px] border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-surface-container-lowest/30 relative flex-1 ${errors.image ? 'border-error' : 'border-outline-variant'}`}>
                      {formData.image ? (
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-full h-full object-contain absolute inset-0 p-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x400?text=L%E1%BB%97i+%E1%BA%A3nh";
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">image_not_supported</span>
                          <p className="text-on-surface-variant font-label-md text-sm">Chưa có ảnh</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-outline-variant bg-surface-container-low shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors font-label-md uppercase tracking-wider text-[12px]"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || initialLoading}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-fixed-dim transition-all active:scale-95 font-label-md uppercase tracking-wider text-[12px] shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
            {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>

      </div>

      {/* --- Nested Modals --- */}
      
      {/* 1. Add Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBrandModal(false)} />
          <div className="relative bg-surface border border-outline-variant rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-headline-sm text-primary font-bold mb-4">Thêm Hãng Mới</h3>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Tên hãng</label>
            <input 
              autoFocus
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant p-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary mb-6"
              placeholder="Nhập tên hãng..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowBrandModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded">Hủy</button>
              <button onClick={handleCreateBrand} className="px-4 py-2 text-sm bg-primary text-on-primary font-bold rounded hover:brightness-110">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
          <div className="relative bg-surface border border-outline-variant rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-headline-sm text-primary font-bold mb-4">Thêm Danh Mục Mới</h3>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Tên danh mục</label>
            <input 
              autoFocus
              type="text"
              value={newCategoryData.name}
              onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-surface-container-lowest border border-outline-variant p-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary mb-4"
              placeholder="VD: Thuốc nhuộm, Sữa tắm..."
            />
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Mô tả (tùy chọn)</label>
            <textarea 
              value={newCategoryData.description}
              onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-surface-container-lowest border border-outline-variant p-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary mb-6 resize-none"
              placeholder="Nhập mô tả..."
              rows={2}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded">Hủy</button>
              <button 
                onClick={handleCreateCategory} 
                disabled={isCreatingCategory}
                className="px-4 py-2 text-sm bg-primary text-on-primary font-bold rounded hover:brightness-110 disabled:opacity-50"
              >
                {isCreatingCategory ? "Đang tạo..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
