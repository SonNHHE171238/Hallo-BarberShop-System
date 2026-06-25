import React from 'react';
import POSBookingPage from '@/page/staff/POSBookingPage';

export const metadata = {
  title: 'Hallo Barber Admin | Thu Ngân (POS)',
  description: 'Giao diện thu ngân dành cho quản trị viên.',
};

export default function AdminPOSRoute() {
  return <POSBookingPage />;
}
