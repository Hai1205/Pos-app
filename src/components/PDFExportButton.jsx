import React from 'react';
import { pdfGenerator } from '../utils/pdfGenerator';

export const PDFExportButton = ({ 
  data, 
  type, 
  className = "bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600", 
  children 
}) => {
  const handleExport = () => {
    pdfGenerator(data, type);
  };

  return (
    <button 
      onClick={handleExport}
      className={className}
    >
      {children || 'Xuất Báo Cáo'}
    </button>
  );
};

