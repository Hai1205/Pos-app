from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_tables, name='get_tables'),
    path('<int:table_id>/', views.get_table, name='get_table'),
    path('create/', views.create_table, name='create_table'),
    path('<int:table_id>/update/', views.update_table, name='update_table'),
    path('<int:table_id>/delete/', views.delete_table, name='delete_table'),
    path('<int:table_id>/assign-customer/', views.assign_customer_to_table,  name='assign_customer_to_table'),
    path('<int:table_id>/remove-customer/',  views.remove_customer_from_table,  name='remove_customer_from_table'),
    path('<int:table_id>/customers/',  views.get_table_customers,  name='get_table_customers'),
    path('<int:table_id>/availability/',  views.check_table_availability,  name='check_table_availability')
]
