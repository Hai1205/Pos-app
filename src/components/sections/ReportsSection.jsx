import React, { useState, useEffect, useRef } from 'react';
import { useReports } from '../../hooks/useReports';
import { BarChart, Package, RefreshCcw, TrendingUp, Download } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFExportButton } from '../PDFExportButton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const reportSectionRef = useRef(null);
  const {
    compareRevenue,
    deadProducts,
    productTrends,
    loading,
    error,
    actions: { fetchCompareRevenue, fetchDeadProducts, fetchProductTrends, refreshReports }
  } = useReports(apiUrl);

  const [currentPeriod, setCurrentPeriod] = useState('month');
  const [previousPeriod, setPreviousPeriod] = useState('month');
  const [thresholdDays, setThresholdDays] = useState(90);
  const [trendMonths, setTrendMonths] = useState(6);
  const [activeTab, setActiveTab] = useState('revenue');
  const [deadProductsPeriod, setDeadProductsPeriod] = useState('month');
  const [productTrendsPeriod, setProductTrendsPeriod] = useState('month');

  useEffect(() => {
    refreshReports();
  }, []);

  const handleRefresh = () => {
    refreshReports();
  };

  const exportToPDF = async () => {
    const input = reportSectionRef.current;
    const canvas = await html2canvas(input, { 
      scale: 2,
      useCORS: true,
      logging: false 
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Bao_Cao_${new Date().toLocaleDateString('vi-VN')}.pdf`);
  };

  const handlePeriodChange = async (period, type) => {
    if (type === 'current') {
      setCurrentPeriod(period);
      await fetchCompareRevenue({ 
        current_period: period, 
        previous_period: previousPeriod 
      });
    } else {
      setPreviousPeriod(period);
      await fetchCompareRevenue({ 
        current_period: currentPeriod, 
        previous_period: period 
      });
    }
  };

  const handleDeadProductsPeriodChange = async (period) => {
    setDeadProductsPeriod(period);
    await fetchDeadProducts(period, thresholdDays);
  };

  const handleProductTrendsPeriodChange = async (period) => {
    setProductTrendsPeriod(period);
    await fetchProductTrends(period, trendMonths);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">{error}</div>;
  }

  const trendChartData = {
    labels: productTrends.map(item => item.product__name),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: productTrends.map(item => item.total_revenue),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Số lượng bán',
        data: productTrends.map(item => item.total_quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y-axis-2',
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Xu hướng sản phẩm',
      },
    },
    scales: {
      'y-axis-1': {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
        },
      },
      'y-axis-2': {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng bán',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div ref={reportSectionRef} className="container mx-auto p-4 space-y-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Báo cáo</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Làm mới
          </button>
          <PDFExportButton
            data={activeTab === 'revenue' ? compareRevenue : activeTab === 'deadProducts' ? deadProducts : productTrends}
            type={activeTab}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
          >
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </PDFExportButton>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {['revenue', 'deadProducts', 'productTrends'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg transition duration-300 ease-in-out ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'revenue' && <BarChart className="inline-block mr-2 h-5 w-5" />}
              {tab === 'deadProducts' && <Package className="inline-block mr-2 h-5 w-5" />}
              {tab === 'productTrends' && <TrendingUp className="inline-block mr-2 h-5 w-5" />}
              {tab === 'revenue' && 'So sánh doanh thu'}
              {tab === 'deadProducts' && 'Sản phẩm không bán được'}
              {tab === 'productTrends' && 'Xu hướng sản phẩm'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'revenue' && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">So sánh doanh thu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ hiện tại</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={currentPeriod}
                onChange={(e) => handlePeriodChange(e.target.value, 'current')}
              >
                {['week', 'month', 'quarter', 'year'].map(period => (
                  <option key={period} value={period}>
                    {period === 'week' ? 'Tuần' : 
                     period === 'month' ? 'Tháng' : 
                     period === 'quarter' ? 'Quý' : 'Năm'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ trước</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={previousPeriod}
                onChange={(e) => handlePeriodChange(e.target.value, 'previous')}
              >
                {['week', 'month', 'quarter', 'year'].map(period => (
                  <option key={period} value={period}>
                    {period === 'week' ? 'Tuần' : 
                     period === 'month' ? 'Tháng' : 
                     period === 'quarter' ? 'Quý' : 'Năm'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {compareRevenue && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-blue-700">Kỳ hiện tại</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(compareRevenue.current_period.start)} - {formatDate(compareRevenue.current_period.end)}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(compareRevenue.current_period.revenue)}</p>
                  <p className="text-sm text-gray-600">Đơn hàng: {compareRevenue.current_period.order_count}</p>
                  <p className="text-sm text-gray-600">Sản phẩm bán: {compareRevenue.current_period.product_sold_count}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-green-700">Kỳ trước</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(compareRevenue.previous_period.start)} - {formatDate(compareRevenue.previous_period.end)}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(compareRevenue.previous_period.revenue)}</p>
                  <p className="text-sm text-gray-600">Đơn hàng: {compareRevenue.previous_period.order_count}</p>
                  <p className="text-sm text-gray-600">Sản phẩm bán: {compareRevenue.previous_period.product_sold_count}</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Tỷ lệ thay đổi</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {compareRevenue.change_percentage > 0 ? (
                    <span className="text-green-500">+{compareRevenue.change_percentage.toFixed(2)}%</span>
                  ) : (
                    <span className="text-red-500">{compareRevenue.change_percentage.toFixed(2)}%</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'deadProducts' && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sản phẩm không bán được</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ phân tích</label>
            <select
              className="w-full md:w-auto border border-gray-300 rounded-md shadow-sm px-3 py-2"
              value={deadProductsPeriod}
              onChange={(e) => handleDeadProductsPeriodChange(e.target.value)}
            >
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {deadProducts.length > 0 ? (
              deadProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.last_sale_date
                      ? `Ngày cuối bán: ${formatDate(product.last_sale_date)}`
                      : 'Chưa từng bán'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.days_since_last_sale !== null
                      ? `Số ngày từ lần bán cuối: ${product.days_since_last_sale}`
                      : 'Không có thông tin số ngày'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Không có sản phẩm không bán được</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'productTrends' && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Xu hướng sản phẩm</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ phân tích</label>
            <select
              className="w-full md:w-auto border border-gray-300 rounded-md shadow-sm px-3 py-2"
              value={productTrendsPeriod}
              onChange={(e) => handleProductTrendsPeriodChange(e.target.value)}
            >
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
            </select>
          </div>
          <div className="h-96">
            <Bar data={trendChartData} options={trendChartOptions} />
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Chi tiết xu hướng sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng bán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lần bán</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productTrends.map((product) => (
                    <tr key={product.product__id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product__name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.total_revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.total_quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.monthly_sales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;

