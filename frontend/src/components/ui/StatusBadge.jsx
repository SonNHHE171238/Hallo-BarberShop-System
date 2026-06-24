import React from 'react';

const StatusBadge = ({ status, className = "" }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return {
          text: "ĐANG CHỜ",
          classes: "bg-outline-gold/20 text-on-surface-variant border border-outline-gold"
        };
      case "in_progress":
      case "checked_in":
        return {
          text: "ĐANG PHỤC VỤ",
          classes: "bg-secondary/20 text-secondary border border-secondary/50"
        };
      case "completed":
        return {
          text: "HOÀN THÀNH",
          classes: "bg-primary/20 text-primary border border-primary/50"
        };
      case "cancelled":
      case "no_show":
      case "rejected":
        return {
          text: "ĐÃ HỦY",
          classes: "bg-error/10 text-error-container border border-error/20"
        };
      default:
        return {
          text: status || "UNKNOWN",
          classes: "bg-surface-container-high text-on-surface border border-outline"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge px-3 py-1 rounded-full text-[10px] inline-block uppercase font-label-md tracking-widest ${config.classes} ${className}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;
