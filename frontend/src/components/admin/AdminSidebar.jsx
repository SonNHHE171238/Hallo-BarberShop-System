"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tổng quan', href: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Lịch hẹn', href: '/admin/appointments', icon: 'calendar_month' },
    { name: 'Dịch vụ', href: '/admin/services', icon: 'cut' },
    { name: 'Kho hàng', href: '/admin/inventory', icon: 'inventory_2' },
    { name: 'Nhân viên', href: '/admin/staff', icon: 'group' },
    { name: 'Phân tích', href: '/admin/analytics', icon: 'analytics' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-surface-obsidian/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 md:w-20 lg:w-64 flex-shrink-0 border-r border-outline-gold bg-surface-container-lowest flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between lg:justify-start px-4 lg:px-6 border-b border-outline-gold">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-wider truncate">HALLO BARBER</span>
          <button className="md:hidden text-on-surface-variant hover:text-primary" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 lg:px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              title={item.name}
              className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:py-2.5 rounded transition-colors group ${
                isActive 
                  ? 'bg-surface-container-high text-primary border border-outline-gold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container border border-transparent'
              }`}
            >
              <span 
                className={`material-symbols-outlined ${isActive ? 'text-primary' : ''}`} 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md hidden lg:inline uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile Area */}
      <div className="p-3 lg:p-4 border-t border-outline-gold">
        <div className="flex items-center justify-center lg:justify-start gap-3 p-2 rounded hover:bg-surface-container cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded border border-primary flex items-center justify-center font-headline-sm text-primary flex-shrink-0">
            A
          </div>
          <div className="flex flex-col hidden lg:flex truncate">
            <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight truncate uppercase tracking-tighter">Quản trị viên</span>
            <span className="font-label-md text-[10px] text-primary truncate uppercase tracking-widest">Quản lý hệ thống</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
