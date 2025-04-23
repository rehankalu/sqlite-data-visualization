import React from 'react';
import DataPointSelector from './DataPointSelector';

function DataTable({ data, xAxis, yAxis, category }) {

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
        {data.map((item) => (
          <DataPointSelector
            key={item.id}
            dataPoint={item}
            xAxis={xAxis}
            yAxis={yAxis}
            category={category}
          />
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;