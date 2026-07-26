"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  const navGroups = [
    {
      title: "Chung",
      items: [
        { name: 'Tổng quan', href: '/admin/dashboard', icon: 'dashboard' },
        { name: 'Phân tích', href: '/admin/analytics', icon: 'analytics' },
      ]
    },
    {
      title: "Vận hành",
      items: [
        { name: 'Thu ngân (POS)', href: '/admin/pos', icon: 'point_of_sale' },
        { name: 'Lịch hẹn', href: '/admin/bookings', icon: 'calendar_month' },
        { name: 'Đơn hàng', href: '/admin/orders', icon: 'local_shipping' },
      ]
    },
    {
      title: "Kinh doanh",
      items: [
        { name: 'Dịch vụ', href: '/admin/services', icon: 'cut' },
        { name: 'Kho hàng', href: '/admin/products', icon: 'inventory_2' },
        { name: 'Quản lý Blog', href: '/admin/blogs', icon: 'description' },
        { name: 'Đánh giá', href: '/admin/feedbacks', icon: 'star' },
        { name: 'Mã giảm giá', href: '/admin/vouchers', icon: 'local_offer' },
      ]
    },
    {
      title: "Tổ chức",
      items: [
        { name: 'Tài khoản', href: '/admin/accounts', icon: 'manage_accounts' },
        { name: 'Lịch làm', href: '/admin/roster', icon: 'calendar_view_week' },
        { name: 'Nghỉ phép', href: '/admin/absences', icon: 'event_busy' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-surface-obsidian/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className={`fixed md:relative inset-y-0 left-0 flex-shrink-0 border-r border-outline-gold bg-surface-container-lowest flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isDesktopExpanded ? 'md:w-64' : 'md:w-20'
      } ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0'}`}>
        
        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary text-on-primary rounded-full items-center justify-center shadow-[0_0_10px_rgba(255,222,165,0.3)] hover:scale-110 transition-transform z-50 border border-surface-container-lowest"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isDesktopExpanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        {/* Brand Header */}
        <div className={`h-20 flex items-center px-4 lg:px-6 border-b border-outline-gold overflow-hidden ${isDesktopExpanded ? 'justify-between md:justify-start' : 'justify-center'}`}>
          <span className={`font-headline-sm text-headline-sm text-primary uppercase tracking-wider truncate transition-all duration-300 ${isDesktopExpanded ? 'opacity-100' : 'md:opacity-0 md:w-0'}`}>
            HALLO BARBER
          </span>
          <button className="md:hidden text-on-surface-variant hover:text-primary shrink-0 ml-auto" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 lg:px-4 flex flex-col gap-6 overflow-x-hidden custom-scrollbar">
        {navGroups.map((group, index) => (
          <div key={index} className="flex flex-col gap-2">
            {/* Group Header */}
            {isDesktopExpanded ? (
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-outline-variant mb-1 transition-opacity duration-300">
                {group.title}
              </span>
            ) : (
              <div className="w-8 h-px bg-outline-variant/30 mx-auto my-2 hidden md:block"></div>
            )}
            
            {/* Items */}
            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  className={`flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded transition-all duration-300 group ${
                    isActive
                      ? 'bg-surface-container-high text-primary border border-outline-gold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container border border-transparent'
                  } ${isDesktopExpanded ? 'justify-start' : 'md:justify-center'}`}
                >
                  <span
                    className={`material-symbols-outlined shrink-0 ${isActive ? 'text-primary' : ''}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className={`font-label-md text-label-md uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${isDesktopExpanded ? 'opacity-100 translate-x-0' : 'md:opacity-0 md:w-0 md:translate-x-4'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
