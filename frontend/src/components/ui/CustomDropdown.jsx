import React, { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div className="relative min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-surface-container border px-3 py-2 rounded focus:ring-1 focus:ring-primary text-body-md transition-all flex items-center justify-between cursor-pointer ${
          isOpen 
            ? 'border-primary ring-1 ring-primary' 
            : 'border-outline-variant hover:border-primary'
        }`}
      >
        <span className={displayValue !== placeholder ? 'text-on-surface' : 'text-on-surface-variant'}>
          {displayValue}
        </span>
        <span className={`material-symbols-outlined text-outline-variant transition-transform text-[20px] ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface-container-high border border-outline-variant rounded shadow-xl overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-surface-bright/20 transition-colors text-sm ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
