# Generated by Django 5.0.1 on 2024-11-18 12:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0008_alter_orderitem_size'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='product_note',
            field=models.TextField(blank=True, null=True),
        ),
    ]
