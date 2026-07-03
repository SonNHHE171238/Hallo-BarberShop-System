import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { subDays, startOfYear } from 'date-fns';

export default function BookingHistoryFilter({
  isOpen,
  onClose,
  filters,
  setFilters,
  availableServices,
  availableBarbers,
  onApply,
  onReset
}) {
  if (!isOpen) return null;

  // Handle Status Change
  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  // Handle Date Quick Selects
  const handleQuickSelect = (type) => {
    const today = new Date();
    if (type === '30days') {
      setFilters(prev => ({
        ...prev,
        dateRange: { from: subDays(today, 30), to: today }
      }));
    } else if (type === 'thisYear') {
      setFilters(prev => ({
        ...prev,
        dateRange: { from: startOfYear(today), to: today }
      }));
    }
  };

  // Handle Service Toggle
  const toggleService = (serviceId) => {
    setFilters(prev => {
      const isSelected = prev.services.includes(serviceId);
      return {
        ...prev,
        services: isSelected 
          ? prev.services.filter(id => id !== serviceId)
          : [...prev.services, serviceId]
      };
    });
  };

  // Handle Barber Toggle
  const toggleBarber = (barberId) => {
    setFilters(prev => {
      const isSelected = prev.barbers.includes(barberId);
      return {
        ...prev,
        barbers: isSelected 
          ? prev.barbers.filter(id => id !== barberId)
          : [...prev.barbers, barberId]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      {/* Filter Panel */}
      <aside className="relative w-full md:w-[480px] h-full bg-surface-container border-l border-outline-variant flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6 border-b border-outline-variant bg-surface-obsidian">
          <h2 className="font-headline-md text-headline-md tracking-tight">Bộ lọc lịch sử</h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-2 -mr-2 rounded-full hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-8 space-y-10">
          
          {/* Status Filter */}
          <section>
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">TRẠNG THÁI</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'pending', label: 'Đang chờ' },
                { id: 'completed', label: 'Hoàn thành' },
                { id: 'cancelled', label: 'Đã hủy' }
              ].map(statusOption => (
                <button
                  key={statusOption.id}
                  onClick={() => handleStatusChange(statusOption.id)}
                  className={`px-5 py-2.5 rounded-full font-body-md text-body-md transition-all ${
                    filters.status === statusOption.id 
                      ? 'border border-primary bg-primary text-on-primary' 
                      : 'border border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface bg-transparent'
                  }`}
                >
                  {statusOption.label}
                </button>
              ))}
            </div>
          </section>

          {/* Date Range Filter */}
          <section className="date-picker-wrapper">
            <style dangerouslySetInnerHTML={{__html: `
              .date-picker-wrapper .react-datepicker-wrapper { width: 100%; }
              .date-picker-wrapper .react-datepicker__input-container input {
                width: 100%;
                background-color: var(--color-surface-obsidian, #131313);
                border: 1px solid var(--color-outline-variant, #4e4639);
                border-radius: 0.25rem;
                padding: 0.75rem 1rem;
                color: var(--color-on-surface, #e5e2e1);
                outline: none;
                transition: all 0.2s;
                cursor: pointer;
              }
              .date-picker-wrapper .react-datepicker__input-container input:focus {
                border-color: var(--color-primary, #ffdea5);
                box-shadow: 0 0 0 1px var(--color-primary, #ffdea5);
              }
              .date-picker-wrapper .react-datepicker {
                background-color: var(--color-surface-container, #201f1f);
                border: 1px solid var(--color-outline-variant, #4e4639);
                font-family: inherit;
                color: var(--color-on-surface, #e5e2e1);
              }
              .date-picker-wrapper .react-datepicker__header {
                background-color: var(--color-surface-obsidian, #131313);
                border-bottom: 1px solid var(--color-outline-variant, #4e4639);
              }
              .date-picker-wrapper .react-datepicker__current-month,
              .date-picker-wrapper .react-datepicker-time__header,
              .date-picker-wrapper .react-datepicker-year-header {
                color: var(--color-on-surface, #e5e2e1);
              }
              .date-picker-wrapper .react-datepicker__day-name,
              .date-picker-wrapper .react-datepicker__day,
              .date-picker-wrapper .react-datepicker__time-name {
                color: var(--color-on-surface-variant, #d1c5b4);
              }
              .date-picker-wrapper .react-datepicker__day:hover {
                background-color: var(--color-surface-container-high, #2a2a2a);
              }
              .date-picker-wrapper .react-datepicker__day--selected, 
              .date-picker-wrapper .react-datepicker__day--in-selecting-range, 
              .date-picker-wrapper .react-datepicker__day--in-range {
                background-color: var(--color-primary, #ffdea5);
                color: var(--color-on-primary, #412d00);
              }
            `}} />
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">KHOẢNG THỜI GIAN</h3>
            <div className="grid grid-cols-2 gap-4 relative z-20">
              <div>
                <label className="block text-xs text-on-surface-variant mb-2">Từ ngày</label>
                <div className="relative">
                  <DatePicker
                    selected={filters.dateRange.from}
                    onChange={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))}
                    selectsStart
                    startDate={filters.dateRange.from}
                    endDate={filters.dateRange.to}
                    placeholderText="Chọn ngày"
                    dateFormat="MMM dd, yyyy"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">calendar_month</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-2">Đến ngày</label>
                <div className="relative">
                  <DatePicker
                    selected={filters.dateRange.to}
                    onChange={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))}
                    selectsEnd
                    startDate={filters.dateRange.from}
                    endDate={filters.dateRange.to}
                    minDate={filters.dateRange.from}
                    placeholderText="Hôm nay"
                    dateFormat="MMM dd, yyyy"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">calendar_month</span>
                </div>
              </div>
            </div>
            {/* Quick Select Dates */}
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => handleQuickSelect('30days')}
                className="text-sm text-primary hover:text-primary-container transition-colors underline decoration-primary/30 underline-offset-4"
              >
                30 ngày qua
              </button>
              <button 
                onClick={() => handleQuickSelect('thisYear')}
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors underline decoration-outline-variant underline-offset-4"
              >
                Năm nay
              </button>
            </div>
          </section>

          {/* Service Type Filter */}
          {availableServices.length > 0 && (
            <section>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">LOẠI DỊCH VỤ</h3>
              <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-outline-variant rounded bg-surface-obsidian">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-surface-container-high z-10">
                    <tr className="border-b border-outline-variant">
                      <th className="p-3 font-label-md text-xs text-on-surface-variant uppercase tracking-widest w-12">Chọn</th>
                      <th className="p-3 font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Tên dịch vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {availableServices.map(service => {
                      const isSelected = filters.services.includes(service.id);
                      return (
                        <tr 
                          key={service.id} 
                          onClick={() => toggleService(service.id)}
                          className="group hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          <td className="p-3">
                            <div className={`relative flex items-center justify-center w-5 h-5 rounded border transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant group-hover:border-outline'}`}>
                              {isSelected && <span className="material-symbols-outlined text-[16px] text-primary">check</span>}
                            </div>
                          </td>
                          <td className={`p-3 font-body-md transition-colors ${isSelected ? 'text-on-surface group-hover:text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                            {service.name}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Barber Filter */}
          {availableBarbers.length > 0 && (
            <section>
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-4">THỢ CẮT TÓC</h3>
              <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-outline-variant rounded bg-surface-obsidian">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-surface-container-high z-10">
                    <tr className="border-b border-outline-variant">
                      <th className="p-3 font-label-md text-xs text-on-surface-variant uppercase tracking-widest w-12">Chọn</th>
                      <th className="p-3 font-label-md text-xs text-on-surface-variant uppercase tracking-widest">Tên thợ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {availableBarbers.map(barber => {
                      const isSelected = filters.barbers.includes(barber.id);
                      return (
                        <tr 
                          key={barber.id} 
                          onClick={() => toggleBarber(barber.id)}
                          className="group hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          <td className="p-3">
                            <div className={`relative flex items-center justify-center w-5 h-5 rounded border transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant group-hover:border-outline'}`}>
                              {isSelected && <span className="material-symbols-outlined text-[16px] text-primary">check</span>}
                            </div>
                          </td>
                          <td className="p-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-surface-obsidian overflow-hidden border border-outline-variant transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                              {barber.avatarUrl ? (
                                <img alt={barber.name} className="w-full h-full object-cover" src={barber.avatarUrl} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant font-label-md text-xs">
                                  {barber.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className={`font-body-md transition-colors ${isSelected ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                              {barber.name}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
        
        {/* Footer Actions */}
        <footer className="p-6 border-t border-outline-variant bg-surface-obsidian flex gap-4">
          <button 
            onClick={onReset}
            className="flex-1 py-4 border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md tracking-wider uppercase rounded"
          >
            THIẾT LẬP LẠI
          </button>
          <button 
            onClick={onApply}
            className="flex-[2] py-4 bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md tracking-wider uppercase rounded shadow-lg"
          >
            ÁP DỤNG BỘ LỌC
          </button>
        </footer>
      </aside>
      
      {/* Required CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4e4639;
            border-radius: 4px;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />
    </div>
  );
}
