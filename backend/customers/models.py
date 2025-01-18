from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=10, unique=True, primary_key=True)
    email = models.EmailField(max_length=254, unique=True, null=True, blank=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    total_spent = models.IntegerField(default=0)  # tổng tiền khách hàng mua
    points = models.IntegerField(default=0)  # Thêm trường điểm tích lũy
    is_member = models.BooleanField(default=False)  # Use is_member instead of status
    
    def __str__(self):
        return self.name