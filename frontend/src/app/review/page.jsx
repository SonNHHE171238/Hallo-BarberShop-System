"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";

export default function ReviewSearchPage() {
  const router = useRouter();
  
  // States
  const [searchState, setSearchState] = useState(true);
  const [phone, setPhone] = useState("");
  
  // Mock Data for State 2
  const [bookingData, setBookingData] = useState(null);
  
  // Review Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/bookingfeedbacks/lookup/${phone}`);
      if (res.data.success) {
        setBookingData(res.data.data);
        setSearchState(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Không tìm thấy lịch sử chuyến cắt nào khả dụng.");
    }
  };

  const handleBackToSearch = () => {
    setSearchState(true);
    setBookingData(null);
    setPhone("");
    setRating(0);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Vui lòng chọn mức điểm đánh giá!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/bookingfeedbacks", {
        bookingId: bookingData.bookingId,
        rating,
        comment
      });
      if (res.data.success) {
        const { pointsEarned, totalPoints } = res.data.data;
        router.push(`/review/success?points=${pointsEarned}&total=${totalPoints}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-[120px] pb-24 lg:pb-32 px-margin-mobile md:px-margin-desktop">
        <div className="w-full max-w-container-max">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-4 uppercase tracking-widest">Lịch Sử Cắt Tóc</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Tra cứu thông tin dịch vụ gần nhất của bạn và để lại đánh giá để chúng tôi không ngừng nâng cao chất lượng.
            </p>
          </div>

          {/* STATE 1: Search Form */}
          {searchState && (
            <div className="max-w-md mx-auto bg-surface-container border border-outline-variant rounded-xl p-8 shadow-2xl transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center mb-6">
                <span className="material-symbols-outlined text-[48px] text-primary mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
                <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">Tìm Chuyến Cắt</h2>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-widest">Số Điện Thoại</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">call</span>
                    <input 
                      id="phone" 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg rounded-lg pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline" 
                      placeholder="Nhập số điện thoại..." 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200 flex justify-center items-center gap-2 uppercase tracking-widest"
                >
                  <span>Tra Cứu</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </form>
            </div>
          )}

          {/* STATE 2: Review & Details */}
          {!searchState && bookingData && (
            <div className="max-w-4xl mx-auto transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                
                {/* Left Col: Booking Details */}
                <div className="bg-surface-container border border-outline-variant rounded-xl p-8 flex flex-col h-full relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  
                  <h3 className="font-label-md text-label-md text-primary mb-6 uppercase tracking-widest flex items-center gap-2 border-b border-outline-variant/30 pb-4">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    {bookingData.customerDisplay}
                  </h3>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden flex-shrink-0">
                      <img src={bookingData.barberImage} alt="Barber" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Barber</p>
                      <p className="font-headline-md text-headline-md text-on-surface uppercase">{bookingData.barberName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-grow">
                    <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/50 shadow-inner">
                      <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-widest">Dịch Vụ</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface">{bookingData.serviceName}</p>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/50 flex justify-between items-center shadow-inner">
                      <div>
                        <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-widest">Thời Gian</p>
                        <p className="font-body-lg text-body-lg text-on-surface">{bookingData.time}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary/50 text-[32px]">event_available</span>
                    </div>
                  </div>
                </div>

                {/* Right Col: Rating Form */}
                <div className="bg-surface-container border border-outline-variant rounded-xl p-8 shadow-2xl">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-6 uppercase tracking-wider">Đánh Giá Trải Nghiệm</h3>
                  
                  <div className="space-y-8">
                    {/* ONLY ONE RATING CRITERIA AS PER DB DESIGN */}
                    <div className="text-center space-y-4 pt-4">
                      <p className="font-body-lg text-on-surface-variant">Bạn cảm thấy hài lòng với dịch vụ chứ?</p>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none hover:scale-110 transition-transform"
                          >
                            <span 
                              className="material-symbols-outlined text-[40px] transition-colors"
                              style={{ 
                                fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0",
                                color: rating >= star ? "#ffdea5" : "#4e4639"
                              }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Box */}
                    <div>
                      <label htmlFor="comments" className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-widest">
                        Góp Ý Thêm (Tùy Chọn)
                      </label>
                      <textarea 
                        id="comments" 
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md rounded-lg p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-outline" 
                        placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
                      ></textarea>
                    </div>

                    <button 
                      onClick={handleSubmitReview}
                      className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200 uppercase tracking-widest shadow-[0_0_20px_rgba(233,193,118,0.2)]"
                    >
                      Gửi Đánh Giá
                    </button>
                  </div>
                </div>
              </div>

              {/* Back to search */}
              <div className="text-center mt-8">
                <button 
                  onClick={handleBackToSearch}
                  className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md underline decoration-outline-variant underline-offset-4 hover:decoration-primary"
                >
                  Tra cứu số điện thoại khác
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
