"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { bookingService } from '@/services/booking.service';

export default function AddItemsModal({ isOpen, onClose, bookingId, onAddSuccess }) {
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [servicesRes, productsRes] = await Promise.all([
        bookingService.getServices().catch(() => null),
        axios.get('http://localhost:5000/api/products?limit=1000', { withCredentials: true }).catch(() => null)
      ]);
      
      let combined = [];

      if (servicesRes && servicesRes.services) {
        const srvs = servicesRes.services.map(s => ({ ...s, itemType: 'service' }));
        combined = [...combined, ...srvs];
      }

      if (productsRes && productsRes.data && productsRes.data.success) {
        const prods = productsRes.data.data.products.map(p => ({ ...p, itemType: 'product' }));
        combined = [...combined, ...prods];
      }
      
      setAllItems(combined);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách SP/DV');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchItems();
      setSelectedServices([]);
      setSelectedProducts([]);
      setSearchTerm('');
    }
  }, [isOpen, fetchItems]);

  const displayedItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allItems;
    return allItems.filter(i => 
      (i.name || '').toLowerCase().includes(term) || 
      (i.description || '').toLowerCase().includes(term)
    );
  }, [allItems, searchTerm]);

  const handleSelectItem = (item) => {
    if (item.itemType === 'service') {
      setSelectedServices(prev => {
        if (prev.some(s => s._id === item._id)) {
          return prev.filter(s => s._id !== item._id);
        }
        return [...prev, item];
      });
    } else {
      setSelectedProducts(prev => {
        const existing = prev.find(p => p.productId === item._id);
        if (existing) return prev; // Do not add again, user will use plus button
        return [...prev, { productId: item._id, quantity: 1, name: item.name, price: item.price, stock: item.stock }];
      });
    }
  };

  const updateProductQuantity = (productId, delta) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const newQ = p.quantity + delta;
        if (newQ > p.stock) {
          toast.error(`Sản phẩm này chỉ còn ${p.stock} trong kho!`);
          return p;
        }
        if (newQ < 1) return p;
        return { ...p, quantity: newQ };
      }
      return p;
    }));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const handleSave = async () => {
    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 SP/DV');
      return;
    }

    try {
      const payload = {
        newServices: selectedServices.map(s => s._id),
        newProducts: selectedProducts.map(p => ({ productId: p.productId, quantity: p.quantity }))
      };
      const res = await axios.put(`http://localhost:5000/api/staff/bookings/${bookingId}/add-items`, payload, {
        withCredentials: true
      });
      if (res.data?.success) {
        toast.success('Đã thêm thành công!');
        onAddSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-high border border-outline-variant w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container">
          <h2 className="font-headline-sm text-xl text-primary font-bold">Thêm Sản Phẩm / Dịch Vụ</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Selection */}
          <div className="flex-1 flex flex-col border-r border-outline-variant/30">
            <div className="p-4 border-b border-outline-variant/30">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                <input 
                  type="text"
                  placeholder="Tìm kiếm SP / DV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-sm text-on-surface"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isLoading ? (
                <div className="text-center py-10 text-on-surface-variant">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {displayedItems.map(item => {
                    const isService = item.itemType === 'service';
                    const isSelected = isService 
                      ? selectedServices.some(s => s._id === item._id)
                      : selectedProducts.some(p => p.productId === item._id);
                    
                    return (
                      <div 
                        key={item._id}
                        onClick={() => handleSelectItem(item)}
                        className={`bg-surface-container-low border p-4 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50'}`}
                      >
                        <h4 className="font-bold text-sm text-on-surface mb-1">{item.name}</h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-primary font-bold">{(item.price || 0).toLocaleString('vi-VN')} đ</span>
                          {isService ? (
                            <span className="text-on-surface-variant">{item.durationMinutes} phút</span>
                          ) : (
                            <span className="text-on-surface-variant">Kho: {item.stock}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="w-80 bg-surface-container-low flex flex-col">
            <div className="p-4 border-b border-outline-variant/30">
              <h3 className="font-bold text-on-surface">Đã chọn</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Selected Services */}
              {selectedServices.map(s => (
                <div key={s._id} className="bg-surface-container border border-outline-variant/30 p-3 rounded-lg flex justify-between items-center">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                    <p className="text-xs text-primary font-bold">{(s.price || 0).toLocaleString('vi-VN')} đ</p>
                  </div>
                  <button onClick={() => handleSelectItem(s)} className="text-error hover:text-red-400">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}

              {/* Selected Products */}
              {selectedProducts.map(p => (
                <div key={p.productId} className="bg-surface-container border border-outline-variant/30 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-on-surface truncate flex-1">{p.name}</p>
                    <button onClick={() => removeProduct(p.productId)} className="text-error hover:text-red-400 ml-2">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-primary font-bold">{(p.price || 0).toLocaleString('vi-VN')} đ</p>
                    <div className="flex items-center gap-2 bg-surface-container-high rounded px-1">
                      <button onClick={() => updateProductQuantity(p.productId, -1)} className="text-on-surface-variant hover:text-white px-1">-</button>
                      <span className="text-xs font-bold w-4 text-center">{p.quantity}</span>
                      <button onClick={() => updateProductQuantity(p.productId, 1)} className="text-on-surface-variant hover:text-white px-1">+</button>
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedServices.length === 0 && selectedProducts.length === 0 && (
                <p className="text-center text-on-surface-variant text-sm mt-4">Chưa chọn SP/DV nào</p>
              )}
            </div>
            
            <div className="p-4 border-t border-outline-variant/30">
              <button 
                onClick={handleSave}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
