"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingHistoryCard from "@/components/customer/BookingHistoryCard";
import Link from "next/link";

function GuestBookingHistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get("phone");
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput && searchInput.length >= 9) {
      router.push(`/lookup/bookings?phone=${searchInput}`);
    }
  };

  useEffect(() => {
    if (!phone) {
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/bookings/lookup/${phone}`);
        if (res.data.success) {
          setResults(res.data.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Lookup error:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [phone]);

  if (!phone) {
    return (
      <main className="pt-32 pb-24 lg:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex-grow w-full flex flex-col items-center">
        <div className="w-full max-w-3xl z-10">
          <div className="text-center mb-12">
            <h1 className="font-headline-lg text-headline-lg md:text-5xl text-primary mb-4 tracking-tight italic">Tra cứu lịch hẹn</h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg max-w-md mx-auto">
              Nhập số điện thoại bạn đã dùng để kiểm tra thông tin các lịch hẹn tại Hallo Barber.
            </p>
          </div>
          <div className="bg-surface-container border border-outline-variant p-8 md:p-12 rounded-xl shadow-2xl relative mx-auto max-w-xl">
            <form onSubmit={handleSearch} className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-primary uppercase tracking-widest" htmlFor="phone">Số điện thoại</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within/input:text-primary transition-colors">call</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface py-4 pl-12 pr-4 rounded-lg focus:outline-none focus:border-primary transition-all duration-300 font-body-md text-body-md placeholder:text-outline/50" 
                    id="phone" 
                    placeholder="Nhập số điện thoại của bạn" 
                    type="tel"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/10 flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined">search</span>
                TRA CỨU
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 lg:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex-grow w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-outline-variant pb-6">
        <div>
          <Link href="/lookup/bookings" className="text-primary font-label-md uppercase tracking-widest hover:text-primary-fixed flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Tra cứu số khác
          </Link>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 serif-heading">Lịch sử đặt lịch</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Kết quả tra cứu cho số điện thoại: <strong className="text-primary">{phone}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20">
        {loading ? (
          <div className="text-center py-12 text-primary flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <span>Đang tải lịch sử...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-surface-container-low border border-error/30 rounded-xl">
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <p className="text-error font-body-lg">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">event_busy</span>
            <p className="text-on-surface-variant font-body-lg mb-6">Không tìm thấy lịch hẹn nào liên kết với số điện thoại này.</p>
            <Link href="/booking" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-headline-sm hover:opacity-90 transition-all">
              <span className="material-symbols-outlined">calendar_month</span>
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          results.map((booking, idx) => (
            <BookingHistoryCard 
              key={booking._id || idx} 
              booking={booking}
              hideActions={true} 
              disableHover={true}
              isGuest={true}
              guestPhone={phone}
            />
          ))
        )}
      </div>
    </main>
  );
}

export default function GuestBookingHistoryPage() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative selection:bg-primary selection:text-on-primary">
      <Navbar />
      <Suspense fallback={
        <main className="pt-32 flex-grow flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </main>
      }>
        <GuestBookingHistoryContent />
      </Suspense>
      <Footer />
    </div>
  );
}
