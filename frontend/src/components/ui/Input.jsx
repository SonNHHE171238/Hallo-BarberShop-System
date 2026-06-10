import React from "react";

export default function Input({
  label,
  id,
  name,
  type = "text",
  placeholder,
  required = false,
  icon,
  rightElement,
  value,
  onChange,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label
            className="block font-label-sm text-label-sm text-on-surface-variant"
            htmlFor={id}
          >
            {label}
          </label>
        )}
        {rightElement && rightElement}
      </div>
      <div className="relative">
        {icon && (
          <span
            className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-secondary px-2"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
        )}
        <input
          className={`w-full bg-transparent border-0 border-b border-outline text-on-surface font-body-md py-3 focus:ring-0 focus:border-primary transition-colors placeholder-outline-variant ${
            icon ? "pl-10" : "pl-0"
          }`}
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
