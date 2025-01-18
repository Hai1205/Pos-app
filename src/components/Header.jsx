import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ShoppingBag, User, CreditCard, LogOut, UserCheck } from 'lucide-react';

const Header = ({ username, onLogout, isAuthenticated, isAdmin, isMember }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isAdmin) return null;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="text-xl font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            POS App
          </Link>

          {isAuthenticated && username && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-700 font-medium">{username}</span>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    to="/order-tracking"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Theo dõi đơn hàng</span>
                  </Link>

                  <Link
                    to="/point-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <CreditCard className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Lịch sử tích điểm</span>
                  </Link>

                  <Link
                    to="/customer-info"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Thông tin khách hàng</span>
                  </Link>

                  {!isMember && (
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserCheck className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Đăng ký thành viên</span>
                    </Link>
                  )}

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;