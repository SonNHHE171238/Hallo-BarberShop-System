import React from 'react';

export default function ServiceTable({ services = [], loading = false, onEdit, onDelete }) {
  const formatService = (service) => ({
    id: service._id || service.id || service.name,
    name: service.name || 'Không tên',
    category: service.category || 'Khác',
    price: typeof service.price === 'number' ? `${service.price.toLocaleString('vi-VN')} VNĐ` : (service.price || '0 VNĐ'),
    duration: service.durationMinutes ? `${service.durationMinutes} phút` : (service.duration || '0 phút'),
    status: service.isActive === false ? 'paused' : 'active',
    image: (service.images && service.images[0]) || service.image || 'https://placehold.co/100x100?text=No+Image',
  });

  const renderedServices = services.map((service) => ({ raw: service, formatted: formatService(service) }));

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="bg-surface-container-high border-b border-outline-gold">
              <th className="px-4 py-3 font-bold text-primary uppercase tracking-wider text-[11px] bg-surface-container-high">Dịch Vụ</th>
              <th className="px-4 py-3 font-bold text-primary uppercase tracking-wider text-[11px] bg-surface-container-high">Giá Niêm Yết</th>
              <th className="px-4 py-3 font-bold text-primary uppercase tracking-wider text-[11px] bg-surface-container-high">Thời Lượng</th>
              <th className="px-4 py-3 font-bold text-primary uppercase tracking-wider text-[11px] bg-surface-container-high text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {renderedServices.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-on-surface-variant font-body-md">
                  Chưa có dịch vụ nào.
                </td>
              </tr>
            )}
            {renderedServices.map(({ raw, formatted }) => (
              <tr key={formatted.id} className="hover:bg-surface-bright/5 transition-all duration-300 ease-in-out group hover:-translate-y-[1px]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-surface-container overflow-hidden border border-outline-variant rounded-md shrink-0">
                      <img 
                        src={formatted.image} 
                        alt={formatted.name}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                      />
                    </div>
                    <div>
                      <div className="font-bold text-body-md text-on-surface">{formatted.name}</div>
                      <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-0.5">{formatted.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-body-md text-gold-dim">{formatted.price}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="font-body-sm">{formatted.duration}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit && onEdit(raw)} className="p-1.5 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                    <button onClick={() => onDelete && onDelete(raw)} className="p-1.5 hover:text-error transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
