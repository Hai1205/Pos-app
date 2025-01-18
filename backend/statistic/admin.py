from django.contrib import admin
from .models import ProductStatistic, CustomerStatistic, RevenueStatistic

admin.site.register(ProductStatistic)
admin.site.register(CustomerStatistic)
admin.site.register(RevenueStatistic)
