import { useState, useEffect } from 'react';

export const useReports = (apiUrl) => {
  const [compareRevenue, setCompareRevenue] = useState(null);
  const [deadProducts, setDeadProducts] = useState([]);
  const [productTrends, setProductTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompareRevenue = async (params = { current_period: 'month', previous_period: 'month' }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${apiUrl}/statistic/compare-revenue/?${queryString}`);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      setCompareRevenue(data);
      return data;
    } catch (err) {
      console.error('Lỗi khi lấy so sánh doanh thu:', err);
      setError(err.message);
      throw err;
    }
  };

  const fetchDeadProducts = async (period = 'month', thresholdDays = 90) => {
    try {
      const response = await fetch(
        `${apiUrl}/statistic/dead-products/?period=${period}&threshold_days=${thresholdDays}`
      );
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      setDeadProducts(data);
      return data;
    } catch (err) {
      console.error('Lỗi khi lấy sản phẩm không bán được:', err);
      setError(err.message);
      throw err;
    }
  };
  
  const fetchProductTrends = async (period = 'month', months = 6) => {
    try {
      const response = await fetch(
        `${apiUrl}/statistic/product-trends/?period=${period}&months=${months}`
      );
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi HTTP ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      setProductTrends(data);
      return data;
    } catch (err) {
      console.error('Lỗi khi lấy xu hướng sản phẩm:', err);
      setError(err.message);
      throw err;
    }
  };

  const refreshReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCompareRevenue(),
        fetchDeadProducts(),
        fetchProductTrends()
      ]);
    } catch (err) {
      console.error('Lỗi khi refresh báo cáo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReports();
  }, [apiUrl]);

  return {
    compareRevenue,
    deadProducts,
    productTrends,
    loading,
    error,
    actions: {
      fetchCompareRevenue,
      fetchDeadProducts,
      fetchProductTrends,
      refreshReports
    }
  };
};
