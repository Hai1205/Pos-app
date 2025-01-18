import React, { useState } from 'react';
import { X, Menu as MenuIcon, ChevronDown, ChevronUp } from 'lucide-react';

const DashboardSidebar = ({
  menuItems,
  activeSection,
  setActiveSection,
  isOpen,
  setIsOpen,
  onLogout
}) => {
  // mặc định là đóng
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (itemName) => {
    // đóng mở sub menu
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  const renderMenuItem = (item) => (
    <div key={item.name} className="relative">
      <button
        onClick={() => {
          if (item.name === 'Đăng xuất') {
            onLogout();
          } else if (item.submenu) {
            toggleSubmenu(item.name);
          } else {
            setActiveSection(item.name);
          }
        }}
        className={`w-full text-left px-4 py-4 ${
          activeSection === item.name 
            ? "bg-blue-500 text-white shadow-md" 
            : "text-gray-600 hover:bg-gray-200"
        } ${
          isOpen 
            ? "flex items-center justify-between" 
            : "flex flex-col items-center space-y-1"
        }`}
      >
        <div className={`flex items-center ${isOpen ? "space-x-4" : "flex-col"}`}>
          <item.icon className={`h-5 w-5 ${isOpen ? "mr-2" : "mb-1"}`} />
          <span className={`${isOpen ? "none" : "text-xs"} whitespace-nowrap`}>
            {item.name}
          </span>
        </div>
        {item.submenu && isOpen && (
          openSubmenu === item.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {item.submenu && isOpen && openSubmenu === item.name && (
        <div className="bg-gray-50">
          {item.submenu.map((subItem) => (
            <button
              key={subItem.name}
              onClick={() => {
                setActiveSection(subItem.name);
              }}
              className={`w-full text-left px-6 py-2 ${
                activeSection === subItem.name 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-200"
              } flex items-center space-x-2`}
            >
              <subItem.icon className="h-4 w-4" />
              <span>{subItem.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside className={`bg-white shadow-lg transition-all duration-300 ease-in-out
      ${isOpen ? "w-64" : "w-20"} fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} p-4`}>
          {isOpen && <span className="text-xl font-bold text-gray-800">Quản trị</span>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
