import React from 'react';

import csv from "../images/csv.png";
import excel from "../images/excel.png";
import search from "../images/search.png";

function DataTable({ selectedTable, data, xAxis, yAxis, category, visible, handleToggleDataPoint }) {

  function searchTable() {
    const searchElem = document.getElementById("searchDataTable");
    const searchStr = searchElem.value.toLowerCase();
    const table_rows = document.querySelectorAll('tbody tr');
    table_rows.forEach((row, i) => {
      let dataPointEntry = row.textContent.toLowerCase();
      row.classList.toggle('hide', dataPointEntry.indexOf(searchStr) < 0)
      row.style.setProperty('--delay', i / 25 + 's');
    })
    document.querySelectorAll('tr:not(.hide)').forEach((visible_row, i) => {
      visible_row.style.backgroundColor = i % 2 === 1 ? '#fffb' : "#d0d0f5";
    })
  }

  const sampleDataCols = Object.keys(data[0]).includes("Company");

  return (
    <div className="tabulation">
      <section className="table__header">
        <h1>{selectedTable}</h1>
        <div className="input-group">
          <input id="searchDataTable" type="search" placeholder="Search Data..." onInput={searchTable}></input>
          <img src={search} alt=""></img>
        </div>
        <div className="export__file">
          <label htmlFor="export-file" className="export__file-btn" title="Export File"></label>
          <input type="checkbox" id="export-file"></input>
          <div className="export__file-options">
            <label>Export As &nbsp; &#10140;</label>
            <label htmlFor="export-file" id="toCSV">CSV <img src={csv} alt=""></img></label>
            <label htmlFor="export-file" id="toEXCEL">EXCEL <img src={excel} alt=""></img></label>
          </div>
        </div>
      </section>
      <section className="table__body">
        <table className="dataTable">
          <thead>
            <tr key="header">
              <th>Shown</th>
              {sampleDataCols && (
                <th>Product</th>
              )}
              {sampleDataCols && (
                <th>Company</th>
              )}
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
                {sampleDataCols && (
                  <td>{dataPoint.Product}</td>
                )}
                {sampleDataCols && (
                  <td>{dataPoint.Company}</td>
                )}
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