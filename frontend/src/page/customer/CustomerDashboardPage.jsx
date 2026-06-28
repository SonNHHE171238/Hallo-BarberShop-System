"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { customerService } from "@/services/customer.service";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardHero from "@/components/customer/DashboardHero";
import NextBooking from "@/components/customer/NextBooking";
import LoyaltyStats from "@/components/customer/LoyaltyStats";
import RewardsSection from "@/components/customer/RewardsSection";
import CuratedProducts from "@/components/customer/CuratedProducts";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await customerService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md">
      {/* TopNavBar */}
      <Navbar />

      {/* Main Content Canvas */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-gutter py-12 flex flex-col gap-16">
        <DashboardHero userName={user?.name || ''} />
        
        {/* Bento Grid Dashboard */}
        <section className="bento-grid">
          {isLoading ? (
            <div className="col-span-12 py-12 flex justify-center text-primary">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ) : (
            <>
              <NextBooking appointment={dashboardData?.nextAppointment} />
              <LoyaltyStats stats={dashboardData?.loyaltyStats} />
            </>
          )}
        </section>

        <RewardsSection />
        <CuratedProducts />
      </main>

      <Footer />
    </div>
  );
}
