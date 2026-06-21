"use client";

import React from 'react';
import ServicePageHeader from '@/components/admin/services/ServicePageHeader';
import ServiceFilterBar from '@/components/admin/services/ServiceFilterBar';
import ServiceTable from '@/components/admin/services/ServiceTable';
import ServicePagination from '@/components/admin/services/ServicePagination';

export default function AdminServicesPage() {
  return (
    <div className="max-w-container-max mx-auto w-full">
      <ServicePageHeader />
      <ServiceFilterBar />
      <div className="flex flex-col">
        <ServiceTable />
        <ServicePagination />
      </div>
    </div>
  );
}
