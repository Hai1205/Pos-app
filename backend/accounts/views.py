import re
from django.shortcuts import render
from unidecode import unidecode
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *
from .serializers import *

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    account = authenticated(username=username, password=password)
    
    if account:
        return Response({
            'account': AccountSerializer(account).data
        })
    
    return Response(
        {'error': 'Sai thông tin đăng nhập hoặc tài khoản đã bị vô hiệu hóa'},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['POST'])
def create_account(request):
    serializer = AccountSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_accounts(request):
    accounts = Account.objects.filter(is_active=True)
    serializer = AccountSerializer(accounts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def authenticated(*, username, password):
    try:
        account = Account.objects.get(username=username)
        if account.is_active and password == account.password:
            return account
    except Account.DoesNotExist:
        return None
    
@api_view(['GET'])
def get_role_choices(request):
    roles = [{'value': choice[0], 'label': choice[1]} for choice in Account.ROLE_CHOICES]
    return Response(roles)
    
@api_view(['GET'])
def get_staffs(request):
    staffs = Staff.objects.all()
    serializers = StaffSerializer(staffs, many=True)
    return Response(serializers.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_staff_detail(request, staff_id):
    staff = Staff.objects.filter()
    serializer = StaffSerializer(staff, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_staff(request):
    # Tạo dữ liệu cho Account từ request
    account_data = {
        "username": request.data.get("username"),
        "password": "default_password",  # Mật khẩu tạm thời
        "role": request.data.get("role"),
        "is_active": True if request.data.get("is_active") == 'true' else False
    }
    
    # Tạo tài khoản Account
    account = Account.objects.create(**account_data)
    
    # Tạo dữ liệu cho Staff từ request
    staff_data = request.data.copy()
    staff_data['account'] = account  # Liên kết tài khoản với nhân viên
    
    serializer = StaffSerializer(data=staff_data)
    if serializer.is_valid():
        staff = serializer.save()
        staff.account = account
        staff.save()
        
        # Generate and update password
        new_password = generate_password(staff)
        if new_password:
            account.password = new_password
            account.save()
            # Trả về dữ liệu của nhân viên, bao gồm cả tài khoản
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            account.delete()  # Xóa Account nếu mật khẩu không được tạo thành công
            return Response({'error': 'Full name or phone number is missing'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        account.delete()  # Xóa Account nếu Staff không được tạo thành công
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_staff(request):
    staff_id = request.data.get('id')
    if not staff_id:
        return Response({'error': 'ID is required for updating staff.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        staff = Staff.objects.get(id=staff_id) 
    except Staff.DoesNotExist:
        return Response({'error': 'Staff not found'}, status=status.HTTP_404_NOT_FOUND)

    # Cập nhật dữ liệu cho Account
    is_active = True if request.data.get("is_active") == 'true' else False
    staff.is_active = is_active

    account_data = {
        "username": request.data.get("username"),
        "password": "default_password",
        "role": request.data.get("role"),
        "is_active": is_active
    }
    if staff.account:
        account_data["password"] = staff.account.password
        Account.objects.filter(id=staff.account.id).update(**account_data)
        staff.account.refresh_from_db()

    # Cập nhật dữ liệu cho Staff
    staff_data = request.data.copy()
    serializer = StaffSerializer(staff, data=staff_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def reset_password(request):
    staff_id = request.data.get('id')
    
    if not staff_id:
        return Response({'error': 'ID is required for resetting password'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        staff = Staff.objects.get(id=staff_id)
        account = staff.account
    except Staff.DoesNotExist:
        return Response({'error': 'Staff not found'}, status=status.HTTP_404_NOT_FOUND)

    # Tạo mật khẩu mới
    new_password = generate_password(staff)
    if new_password:
        account.password = new_password
        account.save()
        return Response({'message': 'Password reset successful', 'new_password': new_password}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Full name or phone number is missing'}, status=status.HTTP_400_BAD_REQUEST)

def generate_password(staff):
    """
        Tạo password mới dựa vào tên cuối và 4 số cuối số điện thoại
    """
    if staff.full_name and staff.phone_number:
        last_name = staff.full_name.split()[-1]
        last_name = unidecode(last_name).lower()
        last_four_digits = staff.phone_number[-4:]
        return f"{last_name}{last_four_digits}"
    return None

@api_view(['POST'])
def change_password(request):
    # Lấy dữ liệu từ request
    staff_id = request.data.get('id')
    old_password = request.data.get('oldPassword')
    new_password = request.data.get('newPassword')
    
    # Kiểm tra xem các trường có dữ liệu không
    if not staff_id:
        return Response({'error': 'ID nhân viên là bắt buộc'}, status=status.HTTP_400_BAD_REQUEST)
    if not old_password:
        return Response({'error': 'Mật khẩu cũ là bắt buộc'}, status=status.HTTP_400_BAD_REQUEST)
    if not new_password:
        return Response({'error': 'Mật khẩu mới là bắt buộc'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Kiểm tra xem nhân viên có tồn tại không
    try:
        staff = Staff.objects.get(id=staff_id)
        account = staff.account
    except Staff.DoesNotExist:
        return Response({'error': 'Nhân viên không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra mật khẩu cũ có chính xác không
    if account.password != old_password:
        return Response({'error': 'Mật khẩu cũ không chính xác'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Kiểm tra mật khẩu mới không giống mật khẩu cũ
    if old_password == new_password:
        return Response({'error': 'Mật khẩu mới không được giống mật khẩu cũ'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Cập nhật mật khẩu mới
    account.password = new_password
    account.save()
    
    return Response({'message': 'Đổi mật khẩu thành công'}, status=status.HTTP_200_OK)

