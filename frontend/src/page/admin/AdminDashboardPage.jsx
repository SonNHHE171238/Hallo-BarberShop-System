"use client";

import React from 'react';
import AdminMetricsGrid from '@/components/admin/AdminMetricsGrid';
import AdminChartsAndRankings from '@/components/admin/AdminChartsAndRankings';
import AdminRecentBookings from '@/components/admin/AdminRecentBookings';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
      <AdminMetricsGrid />
      <AdminChartsAndRankings />
      <AdminRecentBookings />
    </div>
  );
}
