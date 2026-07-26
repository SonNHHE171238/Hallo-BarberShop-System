import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function POSPaymentModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  const [method, setMethod] = useState('cash');
  const [qrData, setQrData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [orderCodeToPoll, setOrderCodeToPoll] = useState(null);

  // Auto poll when we have orderCode
  useEffect(() => {
    let intervalId;
    if (isPolling && orderCodeToPoll) {
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/orders/track/${orderCodeToPoll}`);
          if (res.data && res.data.success) {
            const order = res.data.data;
            if (order.paymentStatus === 'paid') {
              setIsPolling(false);
              clearInterval(intervalId);
              toast.success('Thanh toán thành công qua PayOS!');
              onClose(true); // Close and reset form
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isPolling, orderCodeToPoll, onClose]);

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (method === 'cash') {
      await onConfirm('cash');
    } else {
      const responseData = await onConfirm('payos');
      // If API returns qrCode, show it
      if (responseData && responseData.qrCode && responseData.data) {
        setQrData(responseData.qrCode);
        setOrderCodeToPoll(responseData.data.orderCode);
        setIsPolling(true);
      }
    }
  };

  const resetAndClose = () => {
    setMethod('cash');
    setQrData(null);
    setIsPolling(false);
    setOrderCodeToPoll(null);
    onClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-high rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in relative">
        {/* Header */}
        <div className="bg-surface-container p-6 border-b border-outline-variant flex justify-between items-center">
          <h2 className="text-xl font-headline-sm text-primary">
            {qrData ? 'Mã QR Thanh toán' : 'Chọn Phương Thức Thanh Toán'}
          </h2>
          {!qrData && (
            <button onClick={resetAndClose} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {!qrData ? (
            <div className="space-y-4">
              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${method === 'cash' ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-primary/50'}`}
                onClick={() => setMethod('cash')}
              >
                <span className="material-symbols-outlined text-3xl text-primary">payments</span>
                <div>
                  <h3 className="font-bold text-on-surface">Tiền mặt</h3>
                  <p className="text-sm text-on-surface-variant">Nhận tiền trực tiếp từ khách</p>
                </div>
                {method === 'cash' && <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>}
              </div>

              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${method === 'payos' ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-primary/50'}`}
                onClick={() => setMethod('payos')}
              >
                <span className="material-symbols-outlined text-3xl text-secondary">qr_code_scanner</span>
                <div>
                  <h3 className="font-bold text-on-surface">Chuyển khoản (PayOS)</h3>
                  <p className="text-sm text-on-surface-variant">Tạo mã QR tự động</p>
                </div>
                {method === 'payos' && <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={resetAndClose}
                  className="flex-1 px-4 py-2 rounded-md border border-outline text-on-surface hover:bg-surface-container transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleProcess}
                  className="flex-1 px-4 py-2 rounded-md bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Đang xử lý...</>
                  ) : (
                    'Thanh toán'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-on-surface-variant text-sm text-center">Khách hàng quét mã dưới đây bằng ứng dụng ngân hàng. Hệ thống sẽ tự động xác nhận.</p>
              
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <img src={qrData} alt="PayOS QR" className="w-64 h-64 object-contain" />
              </div>
              
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Đang chờ thanh toán...
              </div>

              <button 
                onClick={resetAndClose}
                className="w-full mt-4 px-4 py-2 rounded-md border border-outline text-on-surface hover:bg-surface-container transition-colors"
              >
                Đóng (Chờ sau)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
