import React from 'react';
import POSBookingPage from '@/page/staff/POSBookingPage';

export const metadata = {
  title: 'Hallo Barber POS | Walk-in Booking',
  description: 'Point of sale interface for staff walk-in bookings.',
};

export default function POSRoute() {
  return <POSBookingPage />;
}
