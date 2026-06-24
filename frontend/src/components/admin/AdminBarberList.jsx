import React from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminBarberList({
    barbers,
    displayBarbers,
    selectedBarber,
    searchTerm,
    setSearchTerm,
    setSelectedBarber,
    initialBarber
}) {
    return (
        <section className="rounded-3xl border border-outline-gold bg-surface-container-low p-5 shadow-2xl shadow-black/5 flex flex-col h-full max-h-[800px]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-headline-sm text-headline-sm">Danh sách barber</h3>
                    <p className="text-body-sm text-on-surface-variant">Chọn barber để xem chi tiết hồ sơ và lịch.</p>
                </div>
                <span className="text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">{barbers.length > 0 && barbers[0].id !== 'empty' ? displayBarbers.length : 0} thợ</span>
            </div>
            <div className="mb-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên barber..."
                        className="w-full rounded-full border border-outline-gold bg-surface-container-high pl-12 pr-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>
            </div>
            <div className="space-y-3 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                {displayBarbers.map((barber) => (
                    <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all group ${selectedBarber.id === barber.id ? 'border-primary bg-surface shadow-md' : 'border-outline-gold bg-surface-container-high hover:border-primary hover:bg-surface'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-full flex items-center justify-center text-headline-sm transition-colors ${selectedBarber.id === barber.id ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant group-hover:text-primary'}`}>
                                {barber.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className={`font-semibold truncate ${selectedBarber.id === barber.id ? 'text-primary' : 'text-on-surface'}`}>{barber.name}</h4>
                                    <StatusBadge status={barber.status === 'active' ? 'completed' : 'cancelled'} className="shrink-0">
                                        {barber.status}
                                    </StatusBadge>
                                </div>
                                <p className="text-body-sm text-on-surface-variant truncate">{barber.email}</p>
                                <p className="text-body-sm text-on-surface-variant">{barber.phone}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
