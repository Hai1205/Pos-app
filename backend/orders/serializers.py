from rest_framework import serializers
from .models import Order, OrderItem, OrderStatus, PaymentMethod

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    size_display = serializers.CharField(source='get_size_display', read_only=True)
    product_note = serializers.SerializerMethodField()

    def get_product_note(self, obj):
        return obj.product_note or obj.product.note
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_name', 'quantity', 'price', 'size', 'size_display', 'product_note']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status = serializers.CharField(source='get_status_display')
    payment_method = serializers.CharField(source='payment_method.name')
    table = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_table(self, obj):
        table = obj.customer.tables.first()
        if table:
            return {'id': table.id, 'name': table.name}
        return None
