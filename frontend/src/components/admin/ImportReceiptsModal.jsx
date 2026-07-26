import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { importReceiptService } from '@/services/importReceipt.service';
import { format } from 'date-fns';

export default function ImportReceiptsModal({ isOpen, onClose, userRole }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchReceipts();
    }
  }, [isOpen, statusFilter]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await importReceiptService.getReceipts(statusFilter);
      if (res.success) {
        setReceipts(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Bạn có chắc chắn duyệt phiếu này? Số lượng tồn kho sẽ được cập nhật.')) return;
    try {
      setProcessingId(id);
      const res = await importReceiptService.approveReceipt(id);
      if (res.success) {
        toast.success('Đã duyệt phiếu');
        fetchReceipts();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi duyệt phiếu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Bạn có chắc chắn TỪ CHỐI phiếu này?')) return;
    try {
      setProcessingId(id);
      const res = await importReceiptService.rejectReceipt(id);
      if (res.success) {
        toast.success('Đã từ chối phiếu');
        fetchReceipts();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi từ chối phiếu');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 border border-yellow-500/50 rounded text-xs font-bold uppercase">Chờ duyệt</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-500/20 text-green-600 border border-green-500/50 rounded text-xs font-bold uppercase">Đã duyệt</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/20 text-red-600 border border-red-500/50 rounded text-xs font-bold uppercase">Từ chối</span>;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-container-high rounded-xl border border-outline-variant shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
          <h2 className="text-xl font-headline-md text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span>
            {userRole === 'admin' ? 'Quản Lý Phiếu Nhập Hàng' : 'Lịch Sử Nhập Hàng Của Bạn'}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 border-b border-outline-variant bg-surface-container flex gap-2 shrink-0">
          <button 
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${statusFilter === '' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-outline-variant hover:bg-surface-bright/10 text-on-surface-variant'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${statusFilter === 'pending' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-outline-variant hover:bg-surface-bright/10 text-on-surface-variant'}`}
          >
            Chờ Duyệt
          </button>
          <button 
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${statusFilter === 'approved' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-outline-variant hover:bg-surface-bright/10 text-on-surface-variant'}`}
          >
            Đã Duyệt
          </button>
          <button 
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${statusFilter === 'rejected' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-outline-variant hover:bg-surface-bright/10 text-on-surface-variant'}`}
          >
            Từ Chối
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-surface-container-lowest">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-on-surface-variant">Đang tải dữ liệu...</span>
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-[64px] mb-4">inbox</span>
              <p>Chưa có phiếu nhập nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map(receipt => (
                <div key={receipt._id} className="bg-surface-container border border-outline-variant rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4">
                  
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-on-surface-variant">Mã phiếu:</span>
                      <span className="text-sm text-primary font-mono">{receipt._id.slice(-6).toUpperCase()}</span>
                      {getStatusBadge(receipt.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div className="flex gap-2">
                        <span className="text-on-surface-variant">Ngày tạo:</span>
                        <span className="text-on-surface font-semibold">{format(new Date(receipt.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-on-surface-variant">Người tạo:</span>
                        <span className="text-on-surface font-semibold">{receipt.createdBy?.name || 'Không rõ'}</span>
                      </div>
                      {receipt.approvedBy && (
                        <div className="flex gap-2">
                          <span className="text-on-surface-variant">Người duyệt:</span>
                          <span className="text-on-surface font-semibold">{receipt.approvedBy?.name || 'Không rõ'}</span>
                        </div>
                      )}
                    </div>
                    
                    {receipt.note && (
                      <div className="bg-surface-container-highest p-2 rounded text-sm italic text-on-surface-variant border-l-2 border-primary/50 mt-1">
                        "{receipt.note}"
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <p className="text-sm font-bold text-on-surface mb-2 uppercase tracking-wider">Chi tiết sản phẩm</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {receipt.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-surface-container-highest p-2 rounded border border-outline-variant/50">
                            <div className="w-8 h-8 rounded bg-surface-container shrink-0 flex items-center justify-center overflow-hidden">
                              {item.productId?.image ? (
                                <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate" title={item.productId?.name}>{item.productId?.name || 'Sản phẩm đã xóa'}</p>
                              <p className="text-xs text-primary font-bold">+ {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Admin on Pending receipts */}
                  {userRole === 'admin' && receipt.status === 'pending' && (
                    <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-outline-variant pt-4 md:pt-0 md:pl-4 shrink-0">
                      <button 
                        onClick={() => handleApprove(receipt._id)}
                        disabled={processingId === receipt._id}
                        className="flex-1 md:flex-none md:w-full bg-green-600 text-white px-4 py-2 rounded font-bold uppercase text-sm hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        Duyệt
                      </button>
                      <button 
                        onClick={() => handleReject(receipt._id)}
                        disabled={processingId === receipt._id}
                        className="flex-1 md:flex-none md:w-full bg-surface-container-highest text-error border border-error/50 px-4 py-2 rounded font-bold uppercase text-sm hover:bg-error hover:text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        Từ Chối
                      </button>
                    </div>
                  )}
                  
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
