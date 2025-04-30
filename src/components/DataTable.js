import React from 'react';

function DataTable({ data, xAxis, yAxis, category, visible, handleToggleDataPoint }) {

  return (
    <table className="dataTable">
      <thead>
        <tr key="header">
          <th>Shown</th>
          <th>Product</th>
          <th>Company</th>
          {xAxis && (
            <th>{xAxis}</th>
          )}
          {yAxis && (
            <th>{yAxis}</th>
          )}
          {category && (
            <th>{category}</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((dataPoint, i) => (

          <tr key={i}>
            <td>
              <input
                type="checkbox"
                checked={visible[i]}
                onChange={(e) => handleToggleDataPoint(e.target.checked, i)}
              />
            </td>
            <td>{dataPoint.Product}</td>
            <td>{dataPoint.Company}</td>
            {xAxis && (
              <td>{dataPoint[xAxis]}</td>
            )}
            {yAxis && (
              <td>{dataPoint[yAxis]}</td>
            )}
            {category && (
              <td>{dataPoint[category]}</td>
            )}
          </tr>

        ))}
      </tbody>
    </table>
  );
}

export default DataTable;