"use client";
import React from "react";
import CustomerListTab from "@/components/admin/accounts/CustomerListTab";

export default function StaffCustomersPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden pt-24 pb-6 px-4 md:px-margin-desktop max-w-[1600px] mx-auto w-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-title-lg font-bold text-on-surface">Quản lý Khách hàng</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">Xem thông tin và lịch sử khách hàng</p>
      </div>
      <CustomerListTab role="staff" />
    </div>
  );
}
