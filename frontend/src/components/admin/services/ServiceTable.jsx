import React from 'react';

const defaultServices = [
  {
    id: 1,
    name: 'Cắt tóc nam',
    category: 'Classic Grooming',
    price: '250.000 VNĐ',
    duration: '45 phút',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfYIqdCm1LaMvF6epXi0HcefqvKiBIZcRABkf74sfrluGp3pZiJYELifa1M27QE1PR4Ai5_oKy-dupBCToqQAlms-wLfzqyEGDi2swfIehE17O5aI0SUD3JnKurITVxOWSTZweJLRgGc9xcC46vGp23GCmEdKLjY-vHfOvQtFS7x2wXjOpiNZLq7ytdDgvje4NAFe7B-kQF6DFLbl3UdWdDW7CKgkTmtkgOnAMvT7Xj_jeaPF9sdKRiORSafEU5pjbRBX2QV5ZwYv3',
  },
  {
    id: 2,
    name: 'Cạo mặt & Massage',
    category: 'Relaxation Ritual',
    price: '150.000 VNĐ',
    duration: '30 phút',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhMXY76dnFJzvvVoLq2Jj03HGFxkB44siWMFC9l_0GdlzFTBuCtqc_Lj2iVcs-DRf62yHwY8yLrcPRivLauLVo690NLCKZkIKgUMmmmdTi7_0aXLCYBhHacD_Ev4OSce3pDpBOlo_E47UBPXwFxGgjQU0x9AzJwCptyTetYdtN2AG6_Q3GQ5EdNMbacFQBUSY_9oSdPnrgm49PD7tOxgvlFIon2NpANzDDMn0T9Ue7rvil3yJ_1zE90YGJ7hrsnanfHlAdwjfS7udQ',
  },
  {
    id: 3,
    name: 'Combo VIP',
    category: 'Signature Experience',
    price: '500.000 VNĐ',
    duration: '90 phút',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_HE6aCAcKJF3fL0F_q4OQzXyZmd5nwwAaHFTlIVtQ_1n32wyl-oYH-QUhC1VzqF8GM8RXTpdIx2JfmQZzsLYpSSpnQP57S0ia5cT2n5V8kaikf0HADH2OFOAcluiR2OyUPDAZYWDzLdfJtXGUkCpDE00t_kzFDMAQMtFcRukuEIdnTMtS33w3uCjMDzt00WQOz9o8udTi0AxNOKMkhwPIkVrwODZNj5bLwXwuBlw-khYa9hvKEXjOlPD7dFCwc3-Cyu755FHKw76L',
  },
  {
    id: 4,
    name: 'Nhuộm tóc',
    category: 'Style Transformation',
    price: '350.000 VNĐ',
    duration: '60 phút',
    status: 'paused',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcfPuczMa83pCwAW7GjvwRuVoe_YX7SEDCUmTZf1u_O7EMlgJiLXHYjwptKMDm8wZeNPU4SeNw9j2BKASAC2QV06YNaP1hWdSlYARN3x-yoKyMa1DUU5_1uUnQ7kLHD_1sD09ughGDj6mU6lj3mzhQySs0ODy_YlxIMcIoXP38F6FpxIE2v5yW0rCwqCYkgG_dIIFcs4VRMw0TvvlmwIqKubEFyLVE0k5w7UZG_-V_L8F0bcAirKghTTcFj53I-wwsquJRNrOilvSS',
  },
];

export default function ServiceTable({ services = [], loading = false, onEdit, onDelete }) {
  const formatService = (service) => ({
    id: service._id || service.id || service.name,
    name: service.name || 'Không tên',
    category: service.category === 'perm'
      ? 'Uốn'
      : service.category === 'color'
        ? 'Hóa chất'
        : service.category === 'treatment'
          ? 'Chăm sóc'
          : service.category === 'cut'
            ? 'Cắt'
            : (service.category || 'Khác'),
    price: typeof service.price === 'number' ? `${service.price.toLocaleString('vi-VN')} VNĐ` : (service.price || '0 VNĐ'),
    duration: service.durationMinutes ? `${service.durationMinutes} phút` : (service.duration || '0 phút'),
    status: service.isActive === false ? 'paused' : 'active',
    image: (service.images && service.images[0]) || service.image || 'https://via.placeholder.com/100',
  });

  const renderedServices = services.map((service) => ({ raw: service, formatted: formatService(service) }));

  return (
    <div className="glass-panel overflow-hidden shadow-2xl rounded-t-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-gold">
              <th className="px-8 py-5 font-headline-sm text-primary uppercase tracking-widest text-[12px]">Dịch Vụ</th>
              <th className="px-8 py-5 font-headline-sm text-primary uppercase tracking-widest text-[12px]">Giá Niêm Yết</th>
              <th className="px-8 py-5 font-headline-sm text-primary uppercase tracking-widest text-[12px]">Thời Lượng</th>
              <th className="px-8 py-5 font-headline-sm text-primary uppercase tracking-widest text-[12px]">Trạng Thái</th>
              <th className="px-8 py-5 font-headline-sm text-primary uppercase tracking-widest text-[12px] text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
                    <p className="text-body-md font-medium">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>
            ) : renderedServices.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-5xl text-outline-variant">search_off</span>
                    <p className="text-body-md font-medium">Không tìm thấy kết quả phù hợp</p>
                    <p className="text-body-sm text-on-surface-variant">Vui lòng thử lại với từ khóa khác</p>
                  </div>
                </td>
              </tr>
            ) : (
              renderedServices.map(({ raw, formatted }) => (
                <tr key={formatted.id} className="hover:bg-surface-bright/5 transition-all duration-300 ease-in-out group hover:-translate-y-[2px]">
                  <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-surface-container overflow-hidden border border-outline-variant rounded-md">
                      <img 
                        src={formatted.image} 
                        alt={formatted.name}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                      />
                    </div>
                    <div>
                      <div className="font-playfair text-headline-sm text-on-surface">{formatted.name}</div>
                      <div className="text-on-surface-variant text-[12px] font-label-md uppercase tracking-tighter">{formatted.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-playfair text-headline-sm text-gold-dim">{formatted.price}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                    <span className="font-body-md">{formatted.duration}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {formatted.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[11px] font-label-md uppercase tracking-wider rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-bright/20 border border-outline-variant text-on-surface-variant text-[11px] font-label-md uppercase tracking-wider rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                      Tạm dừng
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit && onEdit(raw)} className="p-2 hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                    <button onClick={() => onDelete && onDelete(raw)} className="p-2 hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
