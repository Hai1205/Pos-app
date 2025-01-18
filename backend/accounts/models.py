from django.db import models

class Account(models.Model):
    ROLE_CHOICES = [
        ('sales_staff', 'Nhân viên bán hàng'),
        ('kitchen_staff', 'Nhân viên bếp'),
        ('owner', 'Chủ cửa hàng'),
    ]
    
    username = models.CharField(max_length=100, unique=True, verbose_name="Tên đăng nhập")
    password = models.CharField(max_length=200, verbose_name="Mật khẩu")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, verbose_name="Vai trò")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")

    def save(self, *args, **kwargs):
        # Bỏ qua mã hóa mật khẩu
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = "Tài khoản"
        verbose_name_plural = "Danh sách tài khoản"

class Staff(models.Model):
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    account = models.ForeignKey(Account, blank=True, null=True, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.id} {self.full_name}"