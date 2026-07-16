import React from "react";
import BarberProfilePage from "@/page/shop/BarberProfilePage";

export function generateMetadata({ params }) {
  return {
    title: `Barber Profile | HALLO BARBER`,
    description: "Hồ sơ chuyên gia cắt tóc tại Hallo Barber.",
  };
}

export default async function Page({ params }) {
  // Extract id from params
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  return <BarberProfilePage id={id} />;
}
