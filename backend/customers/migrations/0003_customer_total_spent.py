# Generated by Django 5.1.2 on 2024-10-25 06:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0002_remove_customer_id_alter_customer_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='total_spent',
            field=models.IntegerField(default=0),
        ),
    ]
