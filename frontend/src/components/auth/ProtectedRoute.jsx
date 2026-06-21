"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary font-display-lg text-2xl animate-pulse">
        Loading Heritage...
      </div>
    );
  }

  return <>{children}</>;
}
