import React, { useState } from 'react';

function DataPointRow({ dataPoint, xAxis, yAxis, category }) {

    const [isChecked, setIsChecked] = useState(true);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    return (
        <tr>
            <td>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
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
    )

}

export default DataPointRow;