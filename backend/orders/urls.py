from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_order, name='create_order'),
    path('', views.get_orders, name='get_orders'),
    path('order/<int:order_id>/items/', views.get_order_items, name='get_order_items'),
    path('order/<int:order_id>/status/', views.update_order_status, name='update_order_status'), 
    path('order/<int:order_id>/status/view/', views.get_order_status, name='get_order_status'),
    path('customer/<str:customer_phone>/orders/', views.get_customer_orders, name='get_customer_orders'),
    path('customer/<str:customer_phone>/orders/<int:order_id>/', views.get_customer_order_detail, name='get_customer_order_detail'),
]