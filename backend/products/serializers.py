from rest_framework import serializers
from .models import *

class ProductSerializer(serializers.ModelSerializer):
    large_size_price = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'name', 'price', 'large_size_price', 
                 'image', 'description', 'note', 'is_available', 'has_large_size']