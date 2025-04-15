import React from 'react';

function AxisSelector({ label, options, value, onChange }) {
  return (
    <div className="axis-selector">
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default AxisSelector;