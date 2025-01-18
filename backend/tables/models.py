from django.db import models
from customers.models import *

# Create your models here.
class Table(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    customer = models.ManyToManyField(
        Customer,
        blank=True,
        related_name='tables'
    )

    def __str__(self):
        return self.name