import { useState, useEffect } from 'react';

export const useStatistics = (apiUrl) => {
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [last7DaysRevenue, setLast7DaysRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [categorySales, setCategorySales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (endpoint, setter, errorMessage) => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setter(data);
      return data;
    } catch (err) {
      console.error(errorMessage, err);
      setError(err.message);
      throw err;
    }
  };

  const fetchTotalProducts = () => fetchData('/products/get_total_products/', setTotalProducts, 'Lỗi khi lấy tổng số sản phẩm:');
  const fetchTotalCustomers = () => fetchData('/customers/get_total_customers/', setTotalCustomers, 'Lỗi khi lấy tổng số khách hàng:');
  const fetchLast7DaysRevenue = () => fetchData('/statistic/revenue/last-7-days/', setLast7DaysRevenue, 'Lỗi khi lấy doanh thu 7 ngày:');
  const fetchYearlyRevenue = () => fetchData('/statistic/revenue/yearly/', setYearlyRevenue, 'Lỗi khi lấy doanh thu theo năm:');

  const fetchTopProducts = async (params = { limit: 10, time_period: 'month' }) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchData(`/statistic/top-products/?${queryString}`, setTopProducts, 'Lỗi khi lấy top sản phẩm:');
  };

  const fetchTopCustomers = async (params = { limit: 10, time_period: 'month' }) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchData(`/statistic/top-customers/?${queryString}`, setTopCustomers, 'Lỗi khi lấy top khách hàng:');
  };

  const fetchCategorySales = async (params = { limit: 10, time_period: 'month' }) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchData(`/statistic/category-sales/?${queryString}`, setCategorySales, 'Lỗi khi lấy thống kê doanh số theo danh mục:');
  };

  const fetchMonthlyRevenue = async (year = new Date().getFullYear()) => {
    return fetchData(`/statistic/revenue/monthly/${year}/`, setMonthlyRevenue, 'Lỗi khi lấy doanh thu theo tháng:');
  };

  const refreshAllStatistics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTotalProducts(),
        fetchTotalCustomers(),
        fetchTopProducts(),
        fetchTopCustomers(),
        fetchLast7DaysRevenue(),
        fetchMonthlyRevenue(),
        fetchYearlyRevenue(),
        fetchCategorySales()
      ]);
    } catch (err) {
      console.error('Lỗi khi refresh dữ liệu thống kê:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllStatistics();
  }, [apiUrl]);

  return {
    products: { totalProducts },
    customers: { totalCustomers },
    statistics: {
      topProducts,
      topCustomers,
      last7DaysRevenue,
      monthlyRevenue,
      yearlyRevenue,
      categorySales
    },
    loading,
    error,
    actions: {
      fetchTotalProducts,
      fetchTotalCustomers,
      fetchTopProducts,
      fetchTopCustomers,
      fetchLast7DaysRevenue, 
      fetchMonthlyRevenue,
      fetchYearlyRevenue,
      fetchCategorySales,
      refreshAllStatistics
    }
  };
};
