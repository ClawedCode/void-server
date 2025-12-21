import React from 'react';

function ToggleSwitch({ enabled, onChange, disabled = false, label }) {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className={`text-sm font-medium ${enabled ? 'text-success' : 'text-text-tertiary'}`}>
          {label}
        </span>
      )}
      <label className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`
          w-11 h-6
          bg-gray-600
          peer-focus:outline-none
          peer-focus:ring-2
          peer-focus:ring-primary
          rounded-full
          peer
          peer-checked:after:translate-x-full
          rtl:peer-checked:after:-translate-x-full
          peer-checked:after:border-white
          after:content-['']
          after:absolute
          after:top-[2px]
          after:start-[2px]
          after:bg-white
          after:border-gray-300
          after:border
          after:rounded-full
          after:h-5
          after:w-5
          after:transition-all
          peer-checked:bg-green-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `} />
      </label>
    </div>
  );
}

export default ToggleSwitch;
