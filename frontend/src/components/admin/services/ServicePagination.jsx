import React from 'react';

export default function ServicePagination({ page = 1, pages = 1, total = 0, onPageChange }) {
  const start = total === 0 ? 0 : (page - 1) * 5 + 1;
  const end = total === 0 ? 0 : Math.min(page * 5, total);
  const maxButtons = 5;
  const half = Math.floor(maxButtons / 2);
  let startPage = Math.max(1, page - half);
  let endPage = Math.min(pages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <div className="px-8 py-4 bg-surface-container-low flex flex-col md:flex-row justify-between items-center border-t border-outline-variant/30 rounded-b-lg gap-4">
      <span className="text-on-surface-variant font-label-md text-[12px]">
        HIỂN THỊ {start}-{end} TRÊN TỔNG SỐ {total} DỊCH VỤ
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-10 h-10 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary transition-colors rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        {pageNumbers.map((current) => (
          <button
            key={current}
            type="button"
            onClick={() => onPageChange && onPageChange(current)}
            className={`w-10 h-10 flex items-center justify-center rounded-md font-label-md transition-colors ${current === page ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:border-primary'}`}
          >
            {current}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(page + 1)}
          disabled={page >= pages}
          className="w-10 h-10 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary transition-colors rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
