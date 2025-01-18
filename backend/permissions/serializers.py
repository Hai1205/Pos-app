from rest_framework import serializers
from .models import Permission, RolePermission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'code', 'description']

class RolePermissionSerializer(serializers.ModelSerializer):
    permission_details = PermissionSerializer(source='permission', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'role_display', 'permission', 'permission_details']

class RoleSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()