from django.db import models
from categories.models import *

class Product(models.Model):
    id = models.AutoField(primary_key=True, db_index=True)
    category = models.ForeignKey(Category, related_name="products", on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=1000)
    price = models.IntegerField()  
    image = models.ImageField(upload_to='product_images/', null=True)
    description = models.CharField(max_length=1000)
    note = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    has_large_size = models.BooleanField(default=True)  
    
    @property
    def large_size_price(self):
        return int(self.price * 1.2)
    
    def __str__(self):
        return f'ID: {self.id}: {self.name}'