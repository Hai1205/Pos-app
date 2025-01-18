import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PERMISSIONS } from '../constants/permissions';
import { menuItems } from '../config/menuItems';
import { Loader2 } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';

const CustomAlert = ({ children, variant }) => (
  <div className={`p-4 mb-4 rounded ${variant === 'destructive' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
    {children}
  </div>
);

const AdminDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { permissions, loading, error, hasPermission } = useAuth();

  const filterMenuItems = (items) => {
    return items.filter(item => 
      !item.permission || hasPermission(item.permission)
    ).map(item => ({
      ...item,
      submenu: item.submenu ? item.submenu.filter(() => !item.permission || hasPermission(item.permission)) : undefined
    }));
  };

  const allowedMenuItems = filterMenuItems(menuItems);

  useEffect(() => {
    if (allowedMenuItems.length > 0 && !activeSection) {
      const firstItem = allowedMenuItems[0];
      if (firstItem.submenu && firstItem.submenu.length > 0) {
        setActiveSection(firstItem.submenu[0].name);
      } else {
        setActiveSection(firstItem.name);
      }
    }
  }, [allowedMenuItems, activeSection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <CustomAlert variant="destructive">
          <p>{error}</p>
        </CustomAlert>
      </div>
    );
  }

  const findActiveComponent = (items) => {
    for (const item of items) {
      if (item.name === activeSection) {
        return item.component;
      }
      if (item.submenu) {
        const subComponent = findActiveComponent(item.submenu);
        if (subComponent) {
          return subComponent;
        }
      }
    }
    return null;
  };

  const ActiveComponent = findActiveComponent(menuItems);

  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] bg-gray-100">
      <DashboardSidebar
        menuItems={allowedMenuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;