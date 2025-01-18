from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_products, name='products'),
    path('create/', views.create_product, name='create-product'),
    path('update/<int:pk>/', views.update_product, name='update-product'),
    path('delete/<int:pk>/', views.delete_product, name='delete-product'),
    path('detail/<int:pk>/', views.get_product_detail, name='product-detail'),
    path('toggle-status/<int:pk>/', views.toggle_product_status, name='toggle-product-status'),
    path('get_total_products/', views.get_total_products, name='get_total_products'),
]