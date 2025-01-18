from django.urls import path
from . import views

urlpatterns = [
    path('top-products/', views.get_top_products, name='top-products'),
    path('top-customers/', views.get_top_customers, name='top-customers'), 
    path('revenue/last-7-days/', views.get_last_7_days_revenue, name='last-7-days-revenue'),
    path('revenue/monthly/<int:year>/', views.get_monthly_revenue, name='monthly-revenue'),
    path('revenue/yearly/', views.get_yearly_revenue, name='yearly-revenue'),
    path('compare-revenue/', views.compare_revenue, name='compare-revenue'),
    path('dead-products/', views.dead_products, name='dead-products'),
    path('category-sales/', views.get_category_sales, name='category-sales'),
    path('product-trends/', views.product_trend_analysis, name='product-trends'),
]
