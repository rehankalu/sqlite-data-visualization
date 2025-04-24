import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ScatterPlot({ data, xAxis, yAxis, category }) {
  // Group data by legend field to create multiple series
  // Each dataPointEntry corresponds to a row of the selected table in the database
  const groupedData = data.reduce((categories, dataPointEntry) => {
    const key = category ? dataPointEntry[category] : 'All Data';
    if (!categories[key]) categories[key] = [];
    categories[key].push(dataPointEntry);
    return categories;
  }, {});
  // If the user has selected a category with which to color-code the data, a `categories` dictionary will hold the sorted datapoints by their respective values of the category
  // e.g. data = {dpA, dpB, dpC} == {[category: "Puppy", x: 1, y: 2,...], [category: "Puppy", x: 3, y: 1,...], [category: "Kitten", x: 1, y: 2,...] ...} then -->
  // categories = {"Puppy": [dpA, dpB], "Kitten": [dpC]}

  // Generate colors for each series
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];

  // If axes have a defined reformatted name, apply it here
  const axisLabels = {
    company: 'Company',
    product: 'Product',
    rated_power: 'Power',
    max_output_voltage: 'Voltage',
    stack_mass: 'Stack Mass',
    stack_volume: 'Stack Volume'
  };
  
  const xLabel = axisLabels[xAxis] ? axisLabels[xAxis] : xAxis;
  const yLabel = axisLabels[yAxis] ? axisLabels[yAxis] : yAxis;

  const axisUnits = {
    rated_power: ['kW', 'hp'],
    max_output_voltage: 'V',
    stack_mass: ['kg', 'lbm'],
    stack_volume: ['L', 'gal', 'ft^3']
  }

  // Calculate axes domains
  const xData = data.map(dataPointEntry => dataPointEntry[xAxis]);
  const yData = data.map(dataPointEntry => dataPointEntry[yAxis]);

  const xMin = Math.min(...xData);
  const xMax = Math.max(...xData);
  const xBuffer = .1 * (xMax - xMin);
  const xDom = [10*Math.floor((xMin - xBuffer)/10), 10*Math.ceil((xMax + xBuffer)/10)];

  const yMin = Math.min(...yData);
  const yMax = Math.max(...yData);
  const yBuffer = .1 * (yMax - yMin);
  const yDom = [10*Math.floor((yMin - yBuffer)/10), 10*Math.ceil((yMax + yBuffer)/10)];

  // Pulled from https://recharts.org/en-US/examples/CustomContentOfTooltip
  // TODO: Adjust to display Company, Product, and displayed x, y values
  const CustomTooltip = ({ active, payload, xKey, yKey }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      // Assumes data always has a Company and Product name associated with the component
      return (
        <div className="custom-tooltip" style={{ background: '#fff', border: '1px solid #ccc', padding: '10px' }}>
          <p><strong>Company</strong>: {entry["Company"]}</p>
          <p><strong>Product</strong>: {entry["Product"]}</p>
          <p><strong>{xLabel}</strong>: {entry[xKey]} {axisUnits[xKey]}</p>
          <p><strong>{yLabel}</strong>: {entry[yKey]} {axisUnits[yKey]}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="90%">
      <ScatterChart
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={xDom}
          dataKey={xAxis}
          name={xAxis}
          label={{ value: xLabel, position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis
          type="number"
          domain={yDom}
          dataKey={yAxis}
          name={yAxis}
          label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={
            <CustomTooltip
              xKey={xAxis} yKey={yAxis}
            />}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
        />

        {/* Think: groupedData = categories == {"Puppy": [dpA, dpB], "Kitten": [dpC]} */}
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