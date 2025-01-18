import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Tìm sản phẩm..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="text-gray-400" size={20} />
      </div>
    </div>
  );
}