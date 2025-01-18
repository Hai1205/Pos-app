import { 
  Pizza, 
  Coffee, 
  LayoutGrid, 
  File,
  Users, 
  BarChart3, 
  User,
  Table2, 
  ShieldCheck,
  FileChartColumn,

} from 'lucide-react';
import { PERMISSIONS } from '../constants/permissions';
import ProductsSection from '../components/sections/ProductsSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import TablesSection from '../components/sections/TablesSection';
import InvoicesSection from '../components/sections/InvoicesSection';
import CustomersSection from '../components/sections/CustomersSection';
import StatisticsSection from '../components/sections/StatisticsSection';
import StaffsSection from '../components/sections/StaffsSection';
import PermissionsSection from '../components/sections/PermissionsSection';
import ReportsSection from '../components/sections/ReportsSection';

export const menuItems = [
  { 
    name: 'Sản phẩm',
    icon: LayoutGrid, 
    permission: PERMISSIONS.MANAGE_PRODUCTS,
    submenu: [
      {
        name: 'Tất cả sản phẩm',
        icon: Pizza, 
        component: ProductsSection,
      },
      {
        name: 'Loại sản phẩm',
        icon: Coffee, 
        component: CategoriesSection,
      },
    ]
  },
  {
    name: 'Bàn',
    icon: Table2, 
    component: TablesSection,
    permission: PERMISSIONS.MANAGE_TABLES
  },
  {
    name: 'Hóa đơn',
    icon: File, 
    component: InvoicesSection,
    permission: PERMISSIONS.MANAGE_ORDERS
  },
  {
    name: 'Khách hàng',
    icon: Users, 
    component: CustomersSection,
    permission: PERMISSIONS.MANAGE_ACCOUNTS
  },
  {
    name: 'Nhân viên',
    icon: User, 
    component: StaffsSection,
    permission: PERMISSIONS.MANAGE_STAFF
  },
  {
    name: 'Thống kê',
    icon: BarChart3, 
    component: StatisticsSection,
    permission: PERMISSIONS.VIEW_STATISTICS
  },
  {
    name: 'Báo cáo',
    icon: FileChartColumn, 
    component: ReportsSection,
    permission: PERMISSIONS.MANAGE_REPORTS
  },
  {
    name: 'Phân quyền',
    icon: ShieldCheck,
    component: PermissionsSection,
    permission: PERMISSIONS.MANAGE_PERMISSIONS
  }
];
