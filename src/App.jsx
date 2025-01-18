import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import HomePage from './pages/HomePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import LoginPage from './pages/LoginPage';
import LoginAdminPage from './pages/LoginAdminPage';
import AdminDashboard from './pages/AdminDashboard';
import RegisterMemberPage from './pages/RegisterMemberPage';
import Header from './components/Header';
import AdminHeader from './components/AdminHeader';
import Breadcrumb from './components/Breadcrumb';
import { checkPermission } from './utils/authUtils';
import { useAuth } from './hooks/useAuth';
import { useTables } from './hooks/useTables';
import PointHistory from './pages/PointHistory';
import { useSharedWebSocket } from './hooks/useSharedWebSocket';
import useOrderStatusUpdate from './hooks/useOrderStatusUpdate';
import { OrderProvider } from './contexts/OrderContext';
import CustomerInfoPage from './pages/CustomerInfoPage';

function AppContent() {
  const { releaseTable } = useTables();
  const [isMember, setIsMember] = useState(false);
  const { orders, setOrders } = useSharedWebSocket();

  useOrderStatusUpdate();

  const updateMemberStatus = (status) => {
    setIsMember(status);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    localStorage.getItem('isAuthenticated') === 'true'
  );
  
  const [username, setUsername] = useState(() => 
    localStorage.getItem('username') || ''
  );
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => 
    localStorage.getItem('isAdminAuthenticated') === 'true'
  );

  const { clearAuth } = useAuth();

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('username', username);
    localStorage.setItem('isAdminAuthenticated', isAdminAuthenticated);
  }, [isAuthenticated, username, isAdminAuthenticated]);

  const checkMember = async () => {
    const userPhone = localStorage.getItem('userPhone');
  
    if (!userPhone) {
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/check_membership/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userPhone}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setIsMember(data.is_member);
      }
    } catch (error) {
      console.error("Lỗi kiểm tra thành viên:", error);
    }
  };

  // checkmemmber khi đăng nhập
  useEffect(() => {
    if (isAuthenticated && !isAdminAuthenticated) {
      checkMember();
    }
  }, [isAuthenticated, isAdminAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setIsMember(false);
    releaseTable();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userPhone');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setUsername('');
    clearAuth();
  };

  const handleAdminLogin = (account) => {
    setIsAdminAuthenticated(true);
    setUsername(account.username);
    localStorage.setItem('userRole', account.role);
  };

  const paypalOptions  = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture"
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Router>
        {isAdminAuthenticated ? (
            <AdminHeader 
              username={username}
              onLogout={handleAdminLogout}
              orders={orders}
            />
          ) : (
            <Header 
              username={username} 
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdminAuthenticated}
              isMember={isMember}
            />
          )}
          <div className="flex-1">
            <Breadcrumb />
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <LoginPage
                      setIsAuthenticated={setIsAuthenticated}
                      setUsername={setUsername}
                    />
                  )
                }
              />
              
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <HomePage onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

<Route
                path="/customer-info"
                element={
                  isAuthenticated ? (
                    <CustomerInfoPage apiUrl={import.meta.env.VITE_API_URL} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />


              <Route
                path="/order-tracking"
                element={
                  isAuthenticated ? (
                    <OrderTrackingPage apiUrl={import.meta.env.VITE_API_URL}/>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              
              <Route
                path="/payment"
                element={
                  isAuthenticated ? (
                    <PaymentPage />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              
              <Route
                path="/payment-success"
                element={
                  isAuthenticated ? (
                    <PaymentSuccessPage />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />


              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <RegisterMemberPage 
                    updateMemberStatus={updateMemberStatus}/>
                  ) : (
                    <Navigate to="/register" />
                  ) 
                }
              />
              <Route
  path="/point-history"
  element={
    isAuthenticated ? (
      <PointHistory />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

              <Route
                path="/admin"
                element={
                  isAdminAuthenticated && checkPermission(localStorage.getItem('userRole')) ? (
                    <AdminDashboard onLogout={handleAdminLogout}
                    orders={orders} 
                    setOrders={setOrders} />
                  ) : (
                    <Navigate to="/admin-login" />
                  )
                }
              />
              
              <Route
                path="/admin-login"
                element={
                  isAdminAuthenticated ? (
                    <Navigate to="/admin" />
                  ) : (
                    <LoginAdminPage onLogin={handleAdminLogin} />
                  )
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
        
        <ToastContainer />
      </div>
    </PayPalScriptProvider>
  );
}

function App() {
  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  );
}

export default App;