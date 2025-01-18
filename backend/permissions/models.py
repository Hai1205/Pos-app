from django.db import models

class Permission(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Tên quyền")
    code = models.CharField(max_length=100, unique=True, verbose_name="Mã quyền")
    description = models.TextField(verbose_name="Mô tả")
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    class Meta:
        verbose_name = "Quyền"
        verbose_name_plural = "Danh sách quyền"
        db_table = 'permissions_permission'

class RolePermission(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Chủ cửa hàng'),
        ('sales_staff', 'Nhân viên bán hàng'),
        ('kitchen_staff', 'Nhân viên bếp'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        verbose_name="Vai trò"
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        verbose_name="Quyền",
        related_name='role_permissions'
    )
    
    class Meta:
        unique_together = ('role', 'permission')
        verbose_name = "Phân quyền theo vai trò"
        verbose_name_plural = "Danh sách phân quyền theo vai trò"
        db_table = 'permissions_rolepermission'
    
    def __str__(self):
        return f"{self.get_role_display()} - {self.permission.name}"