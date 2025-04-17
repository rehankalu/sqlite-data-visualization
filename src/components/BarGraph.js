//TODO: Update to selectively display the count (y-axis) vs. category (x-axis)

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ScatterPlot({ data, xAxis, yAxis, category }) {
  // Group data by legend field to create multiple series
  const groupedData = data.reduce((groups, item) => {
    const key = category ? item[category] : 'All Data';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  // Generate colors for each series
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey={xAxis} 
          name={xAxis} 
          label={{ value: xAxis, position: 'insideBottomRight', offset: -5 }} 
        />
        <YAxis 
          type="number" 
          dataKey={yAxis} 
          name={yAxis} 
          label={{ value: yAxis, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        
        {Object.entries(groupedData).map(([key, items], index) => (
          <Scatter 
            key={key} 
            name={key} 
            data={items} 
            fill={colors[index % colors.length]} 
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default ScatterPlot;