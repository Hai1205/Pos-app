from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login, name='login'),
    path('create/', views.create_account, name='create'),
    path('', views.get_accounts, name='get_accounts'),
    path('get-role', views.get_role_choices, name='get_role'),
    path('staff/', views.get_staffs, name='get_staff'),
    path('staff/<int:staff_id>/', views.get_staff_detail, name='staff_detail'),
    path('staff/create/', views.create_staff, name='create_staff'),
    path('staff/update/', views.update_staff, name='update_staff'),
    path('change_password/', views.change_password, name='change_password'),
]
