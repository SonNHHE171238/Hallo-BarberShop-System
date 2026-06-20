import React from "react";

export default function StaffFooter() {
  return (
    <footer className="border-t border-outline-variant/30 py-6 text-center text-[10px] uppercase tracking-[0.2em] text-on-surface-variant bg-surface mt-auto">
      &copy; {new Date().getFullYear()} HALLO BARBER. All rights reserved.
    </footer>
  );
}
