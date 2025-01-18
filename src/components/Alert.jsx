// src/components/Alert.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

const Alert = ({ title, description, variant = "info", onClose }) => {
  const variantStyles = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800"
  };

  return (
    <div className={`p-4 rounded-md shadow-md flex items-start ${variantStyles[variant] || variantStyles.info}`}>
      <AlertCircle className="mr-3 h-5 w-5" />
      <div className="flex-1">
        <div className="font-bold">{title}</div>
        <div>{description}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-gray-600 hover:text-gray-800">
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
