from django.db import models
from django.db.models import Sum, Count, F, Avg, Max, Q
from django.utils import timezone
from django.db.models.functions import ExtractMonth, ExtractYear
from datetime import timedelta
from orders.models import Order, OrderItem
from products.models import Product 
from customers.models import Customer
from datetime import timedelta

class ProductStatistic(models.Model):
    @classmethod
    def get_top_selling_products(cls, time_period=None, limit=10):
        """
        Lấy danh sách sản phẩm bán chạy nhất
        time_period: 'week', 'month', 'year' hoặc None cho tất cả thời gian
        """
        queryset = OrderItem.objects

        if time_period:
            now = timezone.now()
            if time_period == 'week':
                start_date = now - timedelta(days=7)
            elif time_period == 'month':
                start_date = now - timedelta(days=30)
            elif time_period == 'year':
                start_date = now - timedelta(days=365)
            
            queryset = queryset.filter(order__order_date__gte=start_date)

        return queryset.values(
            'product__id',
            'product__name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price'))
        ).order_by('-total_sold')[:limit]

    @classmethod
    def get_category_sales(cls, time_period=None, limit=10):
        """
        Lấy thống kê bán hàng theo danh mục sản phẩm
        time_period: 'week', 'month', 'year' hoặc None cho tất cả thời gian
        """
        queryset = OrderItem.objects

        if time_period:
            now = timezone.now()
            if time_period == 'week':
                start_date = now - timedelta(days=7)
            elif time_period == 'month':
                start_date = now - timedelta(days=30)
            elif time_period == 'year':
                start_date = now - timedelta(days=365)
            
            queryset = queryset.filter(order__order_date__gte=start_date)

        return queryset.values(
            'product__category__id',
            'product__category__name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price')),
            product_count=Count('product', distinct=True)
        ).order_by('-total_sold')[:limit]

class CustomerStatistic(models.Model):
    @classmethod
    def get_top_customers(cls, time_period=None, limit=10):
        """
        Lấy danh sách top khách hàng dựa trên total_spent
        time_period: 'week', 'month', 'year' hoặc None cho tất cả thời gian
        """
        base_query = Customer.objects.all()
        
        if time_period:
            now = timezone.now()
            if time_period == 'week':
                start_date = now - timedelta(days=7)
            elif time_period == 'month':
                start_date = now - timedelta(days=30)
            elif time_period == 'year':
                start_date = now - timedelta(days=365)

            return base_query.annotate(
                period_spent=Sum(
                    'order__final_amount',
                    filter=models.Q(order__order_date__gte=start_date)
                ),
                period_orders=Count(
                    'order',
                    filter=models.Q(order__order_date__gte=start_date)
                )
            ).values(
                'phone', 'name', 'email', 'is_member', 'points', 'total_spent',
                'period_spent', 'period_orders'
            ).order_by('-total_spent')[:limit]
        else:
            return base_query.values(
                'phone', 'name', 'email', 'is_member', 'points', 'total_spent'
            ).order_by('-total_spent')[:limit]

class RevenueStatistic(models.Model):
    @classmethod
    def get_last_7_days(cls):
        """Lấy doanh thu 7 ngày gần nhất"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=6)  # 7 ngày tính tính hôm nay luôn
        
        return Order.objects.filter(
            order_date__date__gte=start_date,
            order_date__date__lte=end_date
        ).values('order_date__date').annotate(
            total_revenue=Sum('final_amount'),
            order_count=Count('id')
        ).order_by('order_date__date')

    @classmethod
    def get_monthly_revenue(cls, year):
        """Lấy doanh thu theo tháng của năm chỉ định"""
        return Order.objects.filter(
            order_date__year=year
        ).annotate(
            month=ExtractMonth('order_date')
        ).values('month').annotate(
            revenue=Sum('final_amount'),
            order_count=Count('id')
        ).order_by('month')

    @classmethod
    def get_yearly_revenue(cls):
        """Lấy doanh thu theo năm"""
        return Order.objects.annotate(
            year=ExtractYear('order_date')
        ).values('year').annotate(
            total_revenue=Sum('final_amount'),
            order_count=Count('id')
        ).order_by('year')

class ComparativeReportStatistic:
    @classmethod
    def compare_revenue_periods(cls, current_period, previous_period='month'):
        """
        So sánh doanh thu, số lượng đơn hàng và số lượng sản phẩm bán được giữa các kỳ
        current_period: 'week', 'month', 'quarter', 'year'
        previous_period: 'week', 'month', 'quarter', 'year'
        """
        now = timezone.now()
        
        # Xác định khoảng thời gian hiện tại
        if current_period == 'week':
            current_start = now - timedelta(days=7)
        elif current_period == 'month':
            current_start = now - timedelta(days=30)
        elif current_period == 'quarter':
            current_start = now - timedelta(days=90)
        elif current_period == 'year':
            current_start = now - timedelta(days=365)
        else:
            raise ValueError("Kỳ không hợp lệ cho current_period")

        current_end = now

        # Xác định khoảng thời gian trước đó
        if previous_period == 'week':
            previous_start = current_start - timedelta(days=7)
        elif previous_period == 'month':
            previous_start = current_start - timedelta(days=30)
        elif previous_period == 'quarter':
            previous_start = current_start - timedelta(days=90)
        elif previous_period == 'year':
            previous_start = current_start - timedelta(days=365)
        else:
            raise ValueError("Kỳ không hợp lệ cho previous_period")

        previous_end = current_start

        # Doanh thu
        current_revenue = Order.objects.filter(
            order_date__gte=current_start,
            order_date__lte=current_end
        ).aggregate(total=Sum('final_amount'))['total'] or 0

        previous_revenue = Order.objects.filter(
            order_date__gte=previous_start,
            order_date__lte=previous_end
        ).aggregate(total=Sum('final_amount'))['total'] or 0

        # Số lượng đơn hàng
        current_order_count = Order.objects.filter(
            order_date__gte=current_start,
            order_date__lte=current_end
        ).count()

        previous_order_count = Order.objects.filter(
            order_date__gte=previous_start,
            order_date__lte=previous_end
        ).count()

        # Số lượng sản phẩm bán được
        current_product_sold = OrderItem.objects.filter(
            order__order_date__gte=current_start,
            order__order_date__lte=current_end
        ).aggregate(total=Sum('quantity'))['total'] or 0

        previous_product_sold = OrderItem.objects.filter(
            order__order_date__gte=previous_start,
            order__order_date__lte=previous_end
        ).aggregate(total=Sum('quantity'))['total'] or 0

        # Tính phần trăm thay đổi doanh thu
        if previous_revenue > 0:
            change_percentage = ((current_revenue - previous_revenue) / previous_revenue) * 100
        else:
            change_percentage = 100 if current_revenue > 0 else 0

        # Kết quả trả về
        return {
            'current_period': {
                'start': current_start,
                'end': current_end,
                'revenue': current_revenue,
                'order_count': current_order_count,
                'product_sold_count': current_product_sold
            },
            'previous_period': {
                'start': previous_start,
                'end': previous_end,
                'revenue': previous_revenue,
                'order_count': previous_order_count,
                'product_sold_count': previous_product_sold
            },
            'change_percentage': change_percentage
        }

    @classmethod
    def identify_dead_products(cls, period='month', threshold_days=90, min_sales_count=0):
        now = timezone.now()

        period_map = {
            'week': now - timedelta(days=7),
            'month': now - timedelta(days=30),
            'quarter': now - timedelta(days=90),
            'year': now - timedelta(days=365)
        }
        
        start_date = period_map.get(period, now - timedelta(days=30))

        dead_products = Product.objects.annotate(
            last_sale_date=Max('orderitem__order__order_date'),
            sales_count=Count('orderitem__id', filter=Q(orderitem__order__order_date__gte=start_date)),
            total_quantity_sold=Sum('orderitem__quantity', filter=Q(orderitem__order__order_date__gte=start_date), default=0)
        ).filter(
            Q(last_sale_date__lt=start_date) | Q(last_sale_date__isnull=True),
            sales_count__lte=min_sales_count,
            total_quantity_sold=0
        ).values(
            'id', 
            'name', 
            'last_sale_date', 
            'sales_count', 
            'total_quantity_sold'
        )
        
        return dead_products
    
    @classmethod
    def product_trend_analysis(cls, period='month', months=6):
        now = timezone.now()
        period_map = {
            'week': now - timedelta(days=7),
            'month': now - timedelta(days=30),
            'quarter': now - timedelta(days=90),
            'year': now - timedelta(days=365)
        }
        
        start_date = period_map.get(period, now - timedelta(days=30))

        product_trend = OrderItem.objects.filter(
            order__order_date__range=[start_date, now]
        ).values(
            'product__id',
            'product__name'
        ).annotate(
            monthly_sales=Count('id', distinct=True),
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price'))
        ).order_by('-total_revenue')

        return product_trend
    
    