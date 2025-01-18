import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const hiddenPaths = ['/login', '/admin-login', '/admin'];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const breadcrumbMap = {
    '': 'Trang chủ',
    'order-tracking': 'Đơn hàng',
    'payment': 'Thanh toán',
    'payment-success': 'Thanh toán thành công',
    'register': 'Đăng ký thành viên',
    'point-history': 'Lịch sử dùng điểm',
    'customer-info': 'Thông tin khách hàng',
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      className="bg-white shadow-sm rounded-lg mx-4 mt-4 p-3" 
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-2">
        <motion.li 
          variants={itemVariants}
          className="flex items-center"
        >
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
            aria-label="Trang chủ"
          >
            <Home className="w-5 h-5 group-hover:text-blue-600" />
            <span className="ml-2 text-sm font-medium">Trang chủ</span>
          </Link>
        </motion.li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbMap[name] || name;

          return (
            <motion.li 
              key={name} 
              variants={itemVariants}
              className="flex items-center"
            >
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" aria-hidden="true" />
              {isLast ? (
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
                  aria-current="page"
                >
                  {displayName}
                </motion.span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:underline"
                >
                  {displayName}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumb;