from rest_framework import serializers
from django.utils import timezone

class ProductStatisticSerializer(serializers.Serializer):
    product__id = serializers.IntegerField()
    product__name = serializers.CharField()
    total_sold = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class CustomerStatisticSerializer(serializers.Serializer):
    phone = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField(allow_null=True)
    is_member = serializers.BooleanField()
    points = serializers.IntegerField()
    total_spent = serializers.IntegerField()
    # Fields cho time period specific
    period_spent = serializers.IntegerField(required=False)
    period_orders = serializers.IntegerField(required=False)

class DailyRevenueSerializer(serializers.Serializer):
    order_date__date = serializers.DateField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    order_count = serializers.IntegerField()

class MonthlyRevenueSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    order_count = serializers.IntegerField()

class YearlyRevenueSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    order_count = serializers.IntegerField()

class DateTimeRangeSerializer(serializers.Serializer):
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)

class ComparativeRevenueSerializer(serializers.Serializer):
    current_period = serializers.DictField()
    previous_period = serializers.DictField()
    change_percentage = serializers.FloatField
    order_count = serializers.DictField(required=False)
    product_sold_count = serializers.DictField(required=False)

class DeadProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    last_sale_date = serializers.DateTimeField(allow_null=True)
    sales_count = serializers.IntegerField()
    total_quantity_sold = serializers.IntegerField()
    days_since_last_sale = serializers.SerializerMethodField()

    def get_days_since_last_sale(self, obj):
        if obj.get('last_sale_date'):
            return (timezone.now() - obj['last_sale_date']).days
        return None

class CategorySalesSerializer(serializers.Serializer):
    product__category__id = serializers.IntegerField()
    product__category__name = serializers.CharField()
    total_sold = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    product_count = serializers.IntegerField()

