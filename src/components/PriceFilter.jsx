import React from 'react';
import { ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react';

const PriceFilter = ({ onSortChange }) => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <span className="text-gray-700 font-medium hidden lg:block">Sắp xếp theo giá:</span>
      <button
        onClick={() => onSortChange('asc')}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 "
      >
        <ArrowUpNarrowWide className="h-4 w-4 mr-2" />
        Thấp đến cao
      </button>
      <button
        onClick={() => onSortChange('desc')}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 "
      >
        <ArrowDownNarrowWide className="h-4 w-4 mr-2 " />
        Cao đến thấp
      </button>
    </div>
  );
};

export default PriceFilter;
