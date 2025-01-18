# update_orders.py

import os
import django

# Thiết lập biến môi trường DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Khởi động Django
django.setup()

# Import các model
from django.contrib.auth.models import User

# Các thao tác bạn muốn thực hiện
def get_users():
    users = User.objects.all()

    for user in users:
        print(user.username)

if __name__ == "__main__":
    get_users()
