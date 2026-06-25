import BarberAppointments from "@/page/barber/bookings/BarberAppointments";

export const metadata = {
  title: "Lịch hẹn | Barber",
  description: "Trang danh sách lịch hẹn của thợ",
};

export default function BookingsPage() {
  return <BarberAppointments />;
}
