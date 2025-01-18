from rest_framework import serializers
from .models import *
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'password', 'role', 'created_at', 'is_active']
    
class StaffSerializer(serializers.ModelSerializer):
    account = AccountSerializer(required=False)

    class Meta:
        model = Staff
        fields = '__all__'