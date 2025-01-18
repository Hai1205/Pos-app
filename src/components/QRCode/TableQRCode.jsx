import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const TableQRCode = ({ table }) => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const loginURL = `${baseURL}?login?table_id=${table.id}`;

  return (
    <div className="flex flex-col items-center">
      <QRCodeCanvas value={loginURL} size={200} />
      <p className="mt-4 text-center text-sm text-gray-700">
        Quét mã QR để đăng nhập vào {table.name}
      </p>
    </div>
  );
};

export default TableQRCode;
