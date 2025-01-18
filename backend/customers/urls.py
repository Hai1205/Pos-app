from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_customer, name='login_customer'),
    path('', views.get_customers, name='get_customers'),
    path('points/', views.get_customer_points, name='get_customer_points'),
    path('create/', views.create_customer, name='create_customer'),
    path('update/<str:phone>/', views.update_customer, name='update_customer'),
    path('delete/<str:phone>/', views.delete_customer, name='delete_customer'),
    path('register_member/', views.register_member, name='register_member'),
    path('check_membership/', views.check_membership, name='check_membership'),
    path('get_total_customers/', views.get_total_customers, name='get_total_customers'),
    path('info/', views.get_customer_info, name='get_customer_info'),
]