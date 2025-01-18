import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function DataTable({
  data,
  columns,
  title,
  searchPlaceholder,
  itemsPerPage = 5,
  searchFields = [],
  loading = false,
  error = null,
  actionButtons,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(columns[0].key);
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredItems = useMemo(() => {
    return data.filter(item => {
      if (!searchTerm) return true;
      return searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    }).sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (sortColumn.includes('date')) {
        return sortDirection === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? 1 : -1;
      if (aValue > bValue) return sortDirection === 'asc' ? -1 : 1;
      return 0;
    });
  }, [data, searchTerm, sortColumn, sortDirection, searchFields]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  if (loading) return <div className="text-center p-4 text-gray-600">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center p-4 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full overflow-hidden">
      <h2 className="text-2xl font-bold mb-2 text-gray-600">{title}</h2>
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(({ key, label, sortable = true }) => (
                    <th
                      key={key}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => sortable && handleSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        {sortable && <SortIcon column={key} />}
                      </div>
                    </th>
                  ))}
                  {actionButtons && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedItems.map((item, index) => (
                  <tr key={item.id || item.phone || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {columns.map(({ key, render }) => (
                      <td key={`${item.id || item.phone}-${key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {render ? render(item[key], item) : item[key]}
                      </td>
                    ))}
                    {actionButtons && (
                      <td key={`actions-${item.id || item.phone}`} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {actionButtons(item)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 sm:px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center ${
              currentPage === 1 ? 'invisible' : ''
            }`}
          >
            <div className="flex items-center">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Trước</span>
            </div>
          </button>
          <span className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 sm:px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center ${
              currentPage === totalPages ? 'invisible' : ''
            }`}
          >
            <div className="flex items-center">
              <span>Sau</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}