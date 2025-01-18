from django.db import models
from customers.models import Customer
from products.models import Product

class PaymentMethod(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class OrderStatus(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('Chờ duyệt', 'Chờ duyệt'),
        ('Đã duyệt', 'Đã duyệt'),
        ('Đang giao', 'Đang giao'),
        ('Đã giao', 'Đã giao'),
        ('Đã hủy', 'Đã hủy'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.IntegerField()
    points_earned = models.IntegerField(default=0)
    points_used = models.IntegerField(default=0)
    points_discount = models.IntegerField(default=0)
    final_amount = models.IntegerField()
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='Chờ duyệt')
    
    def __str__(self):
        return f"Order {self.id} - {self.customer.name}"

class OrderItem(models.Model):
    SIZE_CHOICES = [
        ('default', 'Vừa'),
        ('large', 'Lớn'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.IntegerField()
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='default')
    product_note = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.product.name} ({self.get_size_display()}) x {self.quantity}"