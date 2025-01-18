# Generated by Django 5.1.2 on 2024-10-26 14:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Permission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Tên quyền')),
                ('description', models.TextField(verbose_name='Mô tả')),
            ],
            options={
                'verbose_name': 'Quyền',
                'verbose_name_plural': 'Danh sách quyền',
            },
        ),
        migrations.CreateModel(
            name='RolePermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(max_length=20, verbose_name='Vai trò')),
                ('permission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='permissions.permission', verbose_name='Quyền')),
            ],
            options={
                'verbose_name': 'Phân quyền theo vai trò',
                'verbose_name_plural': 'Danh sách phân quyền theo vai trò',
                'unique_together': {('role', 'permission')},
            },
        ),
    ]
