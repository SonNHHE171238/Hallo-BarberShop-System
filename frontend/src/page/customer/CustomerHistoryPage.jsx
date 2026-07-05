"use client";

import React, { useState } from "react";
import useSWR from "swr";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { bookingService } from "@/services/booking.service";
import toast from "react-hot-toast";
import BookingHistoryFilter from "@/components/customer/BookingHistoryFilter";
import BookingHistoryCard from "@/components/customer/BookingHistoryCard";

export default function CustomerHistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const initialFilters = {
    status: 'all',
    dateRange: { from: null, to: null },
    services: [],
    barbers: []
  };
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetcher = async () => {
    const response = await bookingService.getMyBookings();
    return response?.bookings || [];
  };

  const { data: bookings = [], error, isLoading, mutate: fetchBookings } = useSWR('/api/bookings/my-history', fetcher, { 
    revalidateOnFocus: true 
  });

  if (error) {
    toast.error("Không thể tải lịch sử đặt lịch.");
  }

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Bạn có chắc chắn muốn huỷ lịch hẹn này không?")) {
      try {
        await bookingService.cancelBooking(bookingId);
        toast.success("Đã huỷ lịch hẹn thành công!");
        fetchBookings(); // Tải lại danh sách
      } catch (error) {
        toast.error(error.message || "Không thể huỷ lịch hẹn.");
      }
    }
  };

  const handleRebook = () => {
    // Placeholder cho tính năng đặt lại
    router.push("/booking");
  };

  const handleReview = () => {
    // Placeholder cho tính năng review
    toast("Tính năng đánh giá đang được phát triển!", { icon: "🚧" });
  };

  // Filter & Search Logic
  const { availableServices, availableBarbers } = React.useMemo(() => {
    const servicesMap = new Map();
    const barbersMap = new Map();
    
    bookings.forEach(b => {
      // Services
      if (b.services && b.services.length > 0) {
        b.services.forEach(s => {
          if (s && s._id) servicesMap.set(s._id, { id: s._id, name: s.name });
        });
      } else if (b.serviceId) {
        servicesMap.set(b.serviceId._id, { id: b.serviceId._id, name: b.serviceId.name });
      }
      
      // Barbers
      if (b.barberId && b.barberId.userId) {
        barbersMap.set(b.barberId._id, {
          id: b.barberId._id,
          name: b.barberId.userId.name,
          avatarUrl: b.barberId.userId.avatarUrl || b.barberId.profileImageUrl
        });
      }
    });
    
    return {
      availableServices: Array.from(servicesMap.values()),
      availableBarbers: Array.from(barbersMap.values())
    };
  }, [bookings]);

  const filteredBookings = bookings.filter((booking) => { 
    const searchMatch = booking.serviceId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (booking.services && booking.services.some(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                        booking.barberId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()); 
                        
    if (!searchMatch) return false;

    // Status
    if (activeFilters.status !== 'all') {
      if (activeFilters.status === 'pending' && !['pending', 'confirmed'].includes(booking.status)) return false;
      if (activeFilters.status === 'completed' && booking.status !== 'completed') return false;
      if (activeFilters.status === 'cancelled' && !['cancelled', 'no_show', 'rejected'].includes(booking.status)) return false;
    }
    
    // Date Range
    const bDate = new Date(booking.bookingDate);
    if (activeFilters.dateRange.from && bDate < activeFilters.dateRange.from) return false;
    if (activeFilters.dateRange.to) {
      const toDate = new Date(activeFilters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      if (bDate > toDate) return false;
    }

    // Services
    if (activeFilters.services.length > 0) {
      const bookingServiceIds = booking.services ? booking.services.map(s => s._id) : (booking.serviceId ? [booking.serviceId._id] : []);
      if (!bookingServiceIds.some(id => activeFilters.services.includes(id))) return false;
    }

    // Barbers
    if (activeFilters.barbers.length > 0) {
      const barberId = booking.barberId?._id;
      if (!barberId || !activeFilters.barbers.includes(barberId)) return false;
    }

    return true;
  });



  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="pt-32 pb-24 lg:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex-grow w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 serif-heading">Lịch sử đặt lịch</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Xem lại hành trình chăm sóc ngoại hình của bạn. Quản lý các cuộc hẹn sắp tới hoặc đặt lại những dịch vụ yêu thích từ quá khứ.
            </p>
          </div>
          {/* Search and Filter Bar */}
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[280px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container border border-outline-gold text-on-surface pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline transition-all"
                placeholder="Tìm dịch vụ hoặc barber..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setTempFilters(activeFilters);
                setIsFilterOpen(true);
              }}
              className="flex items-center gap-2 bg-surface-container border border-outline-gold px-6 py-3 rounded-xl text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:text-on-primary transition-colors">tune</span>
              <span className="font-label-md tracking-wider uppercase">Bộ Lọc</span>
              {(
                activeFilters.status !== 'all' || 
                activeFilters.services.length > 0 ||
                activeFilters.barbers.length > 0 ||
                activeFilters.dateRange.from || 
                activeFilters.dateRange.to
              ) && (
                <span className="ml-2 w-2 h-2 rounded-full bg-error group-hover:bg-on-primary"></span>
              )}
            </button>
          </div>
        </div>

        {/* Appointment Grid/List */}
        <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20">
          {isLoading ? (
            <div className="text-center py-12 text-primary flex flex-col items-center gap-4">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              <span>Đang tải lịch sử...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low border border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">event_busy</span>
              <p className="text-on-surface-variant font-body-lg">Không tìm thấy lịch hẹn nào phù hợp.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingHistoryCard 
                key={booking._id} 
                booking={booking}
                onCancel={handleCancelBooking}
                onRebook={handleRebook}
                onReview={handleReview}
              />
            ))
          )}
        </div>

      </main>

      {/* Filter Sidebar */}
      <BookingHistoryFilter 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={tempFilters}
        setFilters={setTempFilters}
        availableServices={availableServices}
        availableBarbers={availableBarbers}
        onApply={() => {
          setActiveFilters(tempFilters);
          setIsFilterOpen(false);
        }}
        onReset={() => {
          setTempFilters(initialFilters);
          setActiveFilters(initialFilters);
          setIsFilterOpen(false);
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
