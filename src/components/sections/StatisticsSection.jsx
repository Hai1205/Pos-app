import React, { useState, useEffect } from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Loader2, AlertCircle, RefreshCw, Calendar, DollarSign, TrendingUp, Users, PieChart } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const apiUrl = import.meta.env.VITE_API_URL;

const StatisticsSection = () => {
  const [timePeriod, setTimePeriod] = useState('month');
  const [topLimit, setTopLimit] = useState(5);
  const { statistics, loading, error, actions } = useStatistics(apiUrl);

  useEffect(() => {
    actions.fetchTopProducts({ limit: topLimit, time_period: timePeriod });
    actions.fetchTopCustomers({ limit: topLimit, time_period: timePeriod });
    actions.fetchCategorySales({ limit: topLimit, time_period: timePeriod });
    if (timePeriod === 'week') {
      actions.fetchLast7DaysRevenue();
    } else if (timePeriod === 'month') {
      actions.fetchMonthlyRevenue();
    } else if (timePeriod === 'year') {
      actions.fetchYearlyRevenue();
    }
  }, [timePeriod, topLimit]);

  const handleRefresh = () => {
    console.log('Current timePeriod:', timePeriod);
    actions.refreshAllStatistics();
    actions.fetchTopProducts({ limit: topLimit, time_period: timePeriod });
    actions.fetchTopCustomers({ limit: topLimit, time_period: timePeriod });
    actions.fetchCategorySales({ limit: topLimit, time_period: timePeriod });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-red-500">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h2>
        <p>{error}</p>
      </div>
    );
  }

  const topProductsData = {
    labels: statistics.topProducts.map(product => product.product__name),
    datasets: [{
      data: statistics.topProducts.map(product => product.total_sold),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(78, 205, 196, 0.8)',
        'rgba(255, 99, 132, 0.8)',
      ],
    }]
  };

  const revenueData = {
    labels: timePeriod === 'week' 
      ? statistics.last7DaysRevenue.map(item => item.order_date__date)
      : timePeriod === 'month'
      ? statistics.monthlyRevenue.map(item => item.month)
      : statistics.yearlyRevenue.map(item => item.year),
    datasets: [{
      label: 'Doanh thu',
      data: timePeriod === 'week'
        ? statistics.last7DaysRevenue.map(item => item.total_revenue)
        : timePeriod === 'month'
        ? statistics.monthlyRevenue.map(item => item.revenue)
        : statistics.yearlyRevenue.map(item => item.total_revenue),
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const categorySalesData = {
    labels: statistics.categorySales.map(category => category.product__category__name),
    datasets: [{
      label: 'Doanh số theo danh mục',
      data: statistics.categorySales.map(category => category.total_revenue),
      backgroundColor: 'rgba(255, 159, 64, 0.8)',
      borderColor: 'rgb(255, 159, 64)',
    }]
  };

  const totalRevenue = timePeriod === 'week'
    ? statistics.last7DaysRevenue.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0)
    : timePeriod === 'month'
    ? statistics.monthlyRevenue.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0)
    : statistics.yearlyRevenue.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);

  const roundedTotalRevenue = totalRevenue.toFixed(3);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Thống kê bán hàng</h1>
          <div className="flex items-center space-x-4">
            <select
              value={timePeriod}
              onChange={(e) => {
                console.log('Time period changing from', timePeriod, 'to', e.target.value);
                setTimePeriod(e.target.value);
              }}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
            </select>
            <button 
              onClick={handleRefresh}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <DollarSign className="w-12 h-12 text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-gray-900">{Number(roundedTotalRevenue).toLocaleString()} VNĐ</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <TrendingUp className="w-12 h-12 text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Sản phẩm bán chạy</h3>
              <p className="text-2xl font-bold text-gray-900">{statistics.topProducts[0]?.product__name || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <Users className="w-12 h-12 text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Khách hàng hàng đầu</h3>
              <p className="text-2xl font-bold text-gray-900">{statistics.topCustomers[0]?.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <Calendar className="w-12 h-12 text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Thời gian</h3>
              <p className="text-2xl font-bold text-gray-900">{timePeriod === 'week' ? 'Tuần này' : timePeriod === 'month' ? 'Tháng này' : 'Năm nay'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Top {topLimit} sản phẩm bán chạy</h3>
            <div className="h-80">
              <Pie 
                data={topProductsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              {timePeriod === 'week' ? 'Doanh thu 7 ngày gần nhất' : 
               timePeriod === 'month' ? 'Doanh thu hàng tháng' : 'Doanh thu hàng năm'}
            </h3>
            <div className="h-80">
              {timePeriod === 'week' ? (
                <Line 
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Doanh thu (VNĐ)'
                        }
                      }
                    }
                  }}
                />
              ) : timePeriod === 'month' ? (
                <Bar 
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Doanh thu (VNĐ)'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Doanh thu (VNĐ)'
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Doanh số theo danh mục</h3>
            <div className="h-80">
              <Bar
                data={categorySalesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Doanh số (VNĐ)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-xl font-semibold p-4 border-b text-gray-700">Top {topLimit} Khách hàng</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.topCustomers.slice(0, topLimit).map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.total_spent.toLocaleString()} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsSection;
