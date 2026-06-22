"use client";

import React from 'react';
import AdminMetricsGrid from '@/components/admin/AdminMetricsGrid';
import AdminChartsAndRankings from '@/components/admin/AdminChartsAndRankings';
import AdminRecentAppointments from '@/components/admin/AdminRecentAppointments';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
      <AdminMetricsGrid />
      <AdminChartsAndRankings />
      <AdminRecentAppointments />
    </div>
  );
}
