from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import ProductStatistic, CustomerStatistic, RevenueStatistic
from .serializers import ProductStatisticSerializer, CustomerStatisticSerializer, DailyRevenueSerializer, MonthlyRevenueSerializer, YearlyRevenueSerializer
from .models import ComparativeReportStatistic
from .serializers import (
    ComparativeRevenueSerializer, 
    DeadProductSerializer,
)
from .serializers import CategorySalesSerializer

@api_view(['GET'])
def get_top_products(request):
    """API lấy sản phẩm bán chạy"""
    try:
        limit = int(request.query_params.get('limit', 10))
        time_period = request.query_params.get('time_period')

        if time_period and time_period not in ['week', 'month', 'year']:
            return Response(
                {'error': 'time_period không hợp lệ. Chọn: week, month, year'},
                status=status.HTTP_400_BAD_REQUEST
            )

        top_products = ProductStatistic.get_top_selling_products(
            time_period=time_period,
            limit=limit
        )
        serializer = ProductStatisticSerializer(top_products, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy thống kê sản phẩm bán chạy',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_top_customers(request):
    """API lấy khách hàng mua nhiều"""
    try:
        limit = int(request.query_params.get('limit', 10))
        time_period = request.query_params.get('time_period')

        if time_period and time_period not in ['week', 'month', 'year']:
            return Response(
                {'error': 'time_period không hợp lệ. Chọn: week, month, year'},
                status=status.HTTP_400_BAD_REQUEST
            )

        top_customers = CustomerStatistic.get_top_customers(
            time_period=time_period,
            limit=limit
        )
        serializer = CustomerStatisticSerializer(top_customers, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy thống kê khách hàng',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_last_7_days_revenue(request):
    """API lấy doanh thu 7 ngày gần nhất"""
    try:
        revenue_data = RevenueStatistic.get_last_7_days()
        serializer = DailyRevenueSerializer(revenue_data, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy doanh thu 7 ngày gần đây',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_monthly_revenue(request, year=None):
    """API lấy doanh thu theo tháng"""
    try:
        if year is None:
            year = timezone.now().year
            
        revenue_data = RevenueStatistic.get_monthly_revenue(year=year)
        serializer = MonthlyRevenueSerializer(revenue_data, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy doanh thu theo tháng',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_yearly_revenue(request):
    """API lấy doanh thu theo năm"""
    try:
        revenue_data = RevenueStatistic.get_yearly_revenue()
        serializer = YearlyRevenueSerializer(revenue_data, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy doanh thu theo năm',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_category_sales(request):
    """API lấy thống kê bán hàng theo danh mục"""
    try:
        limit = int(request.query_params.get('limit', 10))
        time_period = request.query_params.get('time_period')

        if time_period and time_period not in ['week', 'month', 'year']:
            return Response(
                {'error': 'time_period không hợp lệ. Chọn: week, month, year'},
                status=status.HTTP_400_BAD_REQUEST
            )

        category_sales = ProductStatistic.get_category_sales(
            time_period=time_period,
            limit=limit
        )
        serializer = CategorySalesSerializer(category_sales, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy thống kê bán hàng theo danh mục',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def compare_revenue(request):
    """
    API để so sánh doanh thu giữa các kỳ
    """
    try:
        current_period = request.query_params.get('current_period', 'month')
        previous_period = request.query_params.get('previous_period', 'month')

        valid_periods = ['week', 'month', 'quarter', 'year']
        if current_period not in valid_periods or previous_period not in valid_periods:
            return Response(
                {'error': 'Kỳ không hợp lệ. Chọn: week, month, quarter, year'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Gọi method so sánh doanh thu
        comparison = ComparativeReportStatistic.compare_revenue_periods(
            current_period, previous_period
        )
        return Response(comparison)
    except ValueError as ve:
        return Response(
            {'error': str(ve)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi so sánh doanh thu',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def dead_products(request):
    """API xác định sản phẩm không bán được"""
    try:
        period = request.query_params.get('period', 'month')
        threshold_days = int(request.query_params.get('threshold_days', 90))
        min_sales_count = int(request.query_params.get('min_sales_count', 0))

        products = ComparativeReportStatistic.identify_dead_products(
            period=period,
            threshold_days=threshold_days,
            min_sales_count=min_sales_count
        )
        serializer = DeadProductSerializer(products, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi xác định sản phẩm không bán được',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def product_trend_analysis(request):
    try:
        period = request.query_params.get('period', 'month')
        months = int(request.query_params.get('months', 6))
        
        trends = ComparativeReportStatistic.product_trend_analysis(
            period=period,
            months=months
        )
        return Response(trends)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)