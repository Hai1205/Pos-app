import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const pdfGenerator = (data, type) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set document metadata
  doc.setProperties({
    title: `Báo Cáo ${getTitleByType(type)}`,
    author: 'Hệ Thống Quản Lý'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Company header
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text('CÔNG TY KINH DOANH', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BÁO CÁO CHI TIẾT', pageWidth / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(20, 30, pageWidth - 20, 30);

  // Render report based on type
  switch(type) {
    case 'revenue':
      renderRevenueReport(doc, data);
      break;
    case 'deadProducts':
      renderDeadProductsReport(doc, data);
      break;
    case 'productTrends':
      renderProductTrendsReport(doc, data);
      break;
  }

  // Footer with page number and date
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Ngày in: ${new Date().toLocaleDateString('vi-VN')}`, 
      pageWidth - 20, pageHeight - 10, { align: 'right' });
    doc.text(`Trang ${i}/${totalPages}`, 
      20, pageHeight - 10, { align: 'left' });
  }

  // Save PDF
  doc.save(`Bao_Cao_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
};

const getTitleByType = (type) => {
  switch(type) {
    case 'revenue': return 'Doanh Thu';
    case 'deadProducts': return 'Sản Phẩm Không Bán';
    case 'productTrends': return 'Xu Hướng Sản Phẩm';
    default: return 'Báo Cáo';
  }
};

const renderRevenueReport = (doc, compareRevenue) => {
  const pageWidth = doc.internal.pageSize.width;
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Title
  doc.setFontSize(14);
  doc.text('BÁO CÁO SO SÁNH DOANH THU', pageWidth / 2, 40, { align: 'center' });

  // Current Period
  doc.autoTable({
    head: [['Chỉ Số', 'Kỳ Hiện Tại']],
    body: [
      ['Thời Gian', `${new Date(compareRevenue.current_period.start).toLocaleDateString('vi-VN')} - ${new Date(compareRevenue.current_period.end).toLocaleDateString('vi-VN')}`],
      ['Tổng Doanh Thu', formatCurrency(compareRevenue.current_period.revenue)],
      ['Số Đơn Hàng', compareRevenue.current_period.order_count.toString()],
      ['Sản Phẩm Bán', compareRevenue.current_period.product_sold_count.toString()]
    ],
    startY: 50,
    theme: 'striped'
  });

  // Previous Period
  doc.autoTable({
    head: [['Chỉ Số', 'Kỳ Trước']],
    body: [
      ['Thời Gian', `${new Date(compareRevenue.previous_period.start).toLocaleDateString('vi-VN')} - ${new Date(compareRevenue.previous_period.end).toLocaleDateString('vi-VN')}`],
      ['Tổng Doanh Thu', formatCurrency(compareRevenue.previous_period.revenue)],
      ['Số Đơn Hàng', compareRevenue.previous_period.order_count.toString()],
      ['Sản Phẩm Bán', compareRevenue.previous_period.product_sold_count.toString()]
    ],
    startY: doc.lastAutoTable.finalY + 10,
    theme: 'striped'
  });

  // Change Percentage
  doc.autoTable({
    head: [['Chỉ Số', 'Giá Trị']],
    body: [
      ['Tỷ Lệ Thay Đổi', `${compareRevenue.change_percentage.toFixed(2)}%`]
    ],
    startY: doc.lastAutoTable.finalY + 10,
    theme: 'striped'
  });
};

const renderDeadProductsReport = (doc, deadProducts) => {
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(14);
  doc.text('BÁO CÁO SẢN PHẨM KHÔNG BÁN', pageWidth / 2, 40, { align: 'center' });

  // Dead Products Table
  doc.autoTable({
    head: [['Tên Sản Phẩm', 'Ngày Bán Cuối', 'Số Ngày Không Bán']],
    body: deadProducts.map(product => [
      product.name, 
      product.last_sale_date ? new Date(product.last_sale_date).toLocaleDateString('vi-VN') : 'Chưa từng bán',
      product.days_since_last_sale !== null ? product.days_since_last_sale.toString() : 'Không có thông tin'
    ]),
    startY: 50,
    theme: 'striped'
  });
};

const renderProductTrendsReport = (doc, productTrends) => {
  const pageWidth = doc.internal.pageSize.width;
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Title
  doc.setFontSize(14);
  doc.text('BÁO CÁO XU HƯỚNG SẢN PHẨM', pageWidth / 2, 40, { align: 'center' });

  // Product Trends Table
  doc.autoTable({
    head: [['Sản Phẩm', 'Doanh Thu', 'Số Lượng', 'Số Lần Bán']],
    body: productTrends.map(product => [
      product.product__name,
      formatCurrency(product.total_revenue),
      product.total_quantity.toString(),
      product.monthly_sales.toString()
    ]),
    startY: 50,
    theme: 'striped'
  });
};
