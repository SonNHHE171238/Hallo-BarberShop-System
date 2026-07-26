import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { importReceiptService } from '@/services/importReceipt.service';

export default function ImportProductModal({ isOpen, onClose, onSuccess, userRole }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts('');
    } else {
      // Reset state on close
      setSearchQuery('');
      setSelectedItems([]);
      setNote('');
    }
  }, [isOpen]);

  const fetchProducts = async (search) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/products?limit=100&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setProducts(res.data.data.products || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const handleSelectItem = (product) => {
    const exists = selectedItems.find(item => item.productId === product._id);
    if (!exists) {
      setSelectedItems([...selectedItems, { productId: product._id, name: product.name, image: product.image, stock: product.stock, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    // Filter out non-numeric characters
    const numericValue = String(newQuantity).replace(/[^0-9]/g, '');
    
    let qty = numericValue === '' ? '' : parseInt(numericValue, 10);
    if (qty !== '' && qty < 1) qty = 1;

    setSelectedItems(selectedItems.map(item => 
      item.productId === productId ? { ...item, quantity: qty } : item
    ));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để nhập');
      return;
    }

    const invalidItems = selectedItems.filter(item => item.quantity === '' || item.quantity < 1);
    if (invalidItems.length > 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ (lớn hơn 0) cho tất cả sản phẩm');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        note
      };

      const res = await importReceiptService.createReceipt(payload);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-container-high rounded-xl border border-outline-variant shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
          <h2 className="text-xl font-headline-md text-primary uppercase tracking-wider">Tạo Phiếu Nhập Hàng</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left side: Search & Select */}
          <div className="w-full md:w-1/2 border-r border-outline-variant flex flex-col p-4 bg-surface-container-lowest overflow-hidden">
            <h3 className="font-bold text-on-surface mb-2 uppercase text-sm tracking-wider">Tìm kiếm sản phẩm</h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4 shrink-0">
              <input 
                type="text" 
                placeholder="Tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
              <button type="submit" className="bg-primary text-on-primary px-3 py-2 rounded font-bold hover:brightness-110 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
            </form>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {loading ? (
                <p className="text-center text-on-surface-variant text-sm mt-4">Đang tải...</p>
              ) : products.length === 0 ? (
                <p className="text-center text-on-surface-variant text-sm mt-4">Không tìm thấy sản phẩm</p>
              ) : (
                products.map(product => {
                  const isSelected = selectedItems.some(item => item.productId === product._id);
                  return (
                    <div 
                      key={product._id} 
                      onClick={() => !isSelected && handleSelectItem(product)}
                      className={`flex items-center gap-3 p-2 rounded border ${isSelected ? 'bg-surface-bright/20 border-primary cursor-not-allowed opacity-60' : 'bg-surface-container border-outline-variant hover:border-primary cursor-pointer'}`}
                    >
                      <div className="w-10 h-10 shrink-0 bg-surface-container-highest rounded overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-on-surface truncate">{product.name}</p>
                        <p className="text-xs text-on-surface-variant">Tồn kho hiện tại: {product.stock}</p>
                      </div>
                      {isSelected && <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right side: Selected Items & Submit */}
          <div className="w-full md:w-1/2 flex flex-col p-4 bg-surface-container-low overflow-hidden">
            <h3 className="font-bold text-on-surface mb-2 uppercase text-sm tracking-wider">Danh sách nhập</h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-4">
              {selectedItems.length === 0 ? (
                <p className="text-center text-on-surface-variant text-sm mt-4 italic">Chưa chọn sản phẩm nào</p>
              ) : (
                selectedItems.map(item => (
                  <div key={item.productId} className="bg-surface-container rounded p-3 border border-outline-variant flex items-center gap-3 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface truncate" title={item.name}>{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-on-surface-variant uppercase">SL:</span>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        className="w-16 bg-surface-container-highest border border-outline-variant rounded px-2 py-1 text-sm text-center text-on-surface"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-on-surface-variant hover:text-error transition-colors shrink-0 p-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="shrink-0 pt-4 border-t border-outline-variant flex flex-col gap-3">
              <textarea 
                placeholder="Ghi chú (tùy chọn)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none h-16"
              ></textarea>
              
              <div className="bg-surface-bright/20 p-3 rounded-lg border border-primary/30 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">info</span>
                <p className="text-xs text-on-surface-variant">
                  {userRole === 'admin' 
                    ? "Phiếu nhập sẽ được duyệt tự động và cập nhật số lượng tồn kho ngay lập tức." 
                    : "Phiếu nhập sẽ được gửi đến Admin để chờ duyệt. Tồn kho chỉ được cập nhật sau khi Admin duyệt."}
                </p>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-bold uppercase border border-outline-variant text-on-surface-variant rounded hover:bg-surface-bright/10"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="px-4 py-2 text-sm font-bold uppercase bg-primary text-on-primary rounded hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Đang xử lý...' : (userRole === 'admin' ? 'Xác Nhận Nhập' : 'Gửi Yêu Cầu')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
