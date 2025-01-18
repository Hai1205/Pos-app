// DateFilter.js
import React from 'react';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div className="flex space-x-2 mb-4">
    <label>
      Từ ngày:
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="border rounded px-2 py-1"
      />
    </label>
    <label>
      Đến ngày:
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="border rounded px-2 py-1"
      />
    </label>
  </div>
);

export default DateFilter;
