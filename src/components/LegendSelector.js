import React from 'react';

function LegendSelector({ options, value, onChange }) {
  return (
    <div className="legend-selector">
      <label>Legend Field:</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">None</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default LegendSelector;