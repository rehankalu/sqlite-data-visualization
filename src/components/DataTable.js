import React from 'react';

import csv from "../images/csv.png"; 
import excel from "../images/excel.png"; 
import search from "../images/search.png"; 

function DataTable({ selectedTable, data, xAxis, yAxis, category, visible, handleToggleDataPoint }) {

  return (
    <div className="tabulation">
      <section className="table__header">
        <h1>{selectedTable}</h1>
        <div className="input-group">
          <input type="search" placeholder="Search Data..."></input>
          <img src={search} alt=""></img>
        </div>
        <div className="export__file">
          <label for="export-file" className="export__file-btn" title="Export File"></label>
          <input type="checkbox" id="export-file"></input>
          <div className="export__file-options">
            <label>Export As &nbsp; &#10140;</label>
            <label for="export-file" id="toCSV">CSV <img src={csv} alt=""></img></label>
            <label for="export-file" id="toEXCEL">EXCEL <img src={excel} alt=""></img></label>
          </div>
        </div>
      </section>
      <section className="table__body">
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
                    checked={visible[i] ?? true}
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
      </section>
    </div>

  );
}

export default DataTable;