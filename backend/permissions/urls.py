from django.urls import path
from . import views

app_name = 'permissions'

urlpatterns = [
    path('roles/', views.get_roles, name='list_roles'),
    path('all/', views.get_all_permissions, name='get_all_permissions'),
    path('list/', views.get_permissions, name='list_permissions'),
    path('update/', views.update_permissions, name='update_permissions'),
    path('statistics/', views.get_statistics, name='statistics'),
]