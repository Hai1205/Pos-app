from django.contrib import admin
from .models import Permission, RolePermission

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'description')
    search_fields = ('name', 'code')
    ordering = ('name',)

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission', 'get_permission_code')
    list_filter = ('role',)
    search_fields = ('role', 'permission__name', 'permission__code')
    
    def get_permission_code(self, obj):
        return obj.permission.code
    get_permission_code.short_description = 'Permission Code'