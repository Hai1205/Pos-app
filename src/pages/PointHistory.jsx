import React, { useEffect, useState } from 'react';

export default function PointHistory() {
  const [pointHistory, setPointHistory] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(0);

  const userPhone = localStorage.getItem('userPhone'); 

  console.log('User Phone:', userPhone); 

  const fetchPointHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem(`${userPhone}_pointHistory`)) || [];
      console.log('Fetched Point History:', history);
      const points = parseInt(localStorage.getItem(`${userPhone}_currentPoints`), 10) || 0;
      console.log('Fetched Current Points:', points); 

      setPointHistory(history);
      setCurrentPoints(points);
    } catch (error) {
      console.error('Error fetching point history or current points:', error);
    }
  };

  useEffect(() => {
    if (userPhone) {
      fetchPointHistory(); 
    } else {
      console.warn('No user phone found in localStorage.');
    }
  }, []); 

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Lịch sử tích điểm</h2>
      <div className="mb-4 font-semibold">Điểm hiện tại: {currentPoints}</div>
      <div className="overflow-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">Ngày</th>
              <th className="py-2 px-4 border">Điểm Cộng</th>
              <th className="py-2 px-4 border">Điểm Trừ</th>
              <th className="py-2 px-4 border">Điểm Hiện Tại</th>
            </tr>
          </thead>
          <tbody>
            {pointHistory.length > 0 ? (
              pointHistory.map((entry, index) => (
                <tr key={index} className="text-center">
                  <td className="py-2 px-4 border">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border text-green-600">
                    {entry.points_added !== undefined ? `+${entry.points_added}` : '-'}
                  </td>
                  <td className="py-2 px-4 border text-red-600">
                    {entry.points_deducted !== undefined ? `-${entry.points_deducted}` : '-'}
                  </td>
                  <td className="py-2 px-4 border">{entry.current_points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  Không có lịch sử tích điểm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
