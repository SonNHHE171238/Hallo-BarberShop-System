"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SharedProfilePage from '@/components/profile/SharedProfilePage';

export default function CustomerProfilePage() {
  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Navbar />
      <main className="pt-20">
        <SharedProfilePage />
      </main>
      <Footer />
    </div>
  );
}
