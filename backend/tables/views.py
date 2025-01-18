from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db import transaction
from .models import *
from customers.models import *
from .serializers import *

@api_view(['GET'])
def get_tables(request):
    tables = Table.objects.all()
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_table(request, table_id):
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = TableSerializer(table)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_table(request):
    serializer = TableSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_table(request, table_id):
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = TableSerializer(table, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_table(request, table_id):
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response({"error": "Table not found"}, status=status.HTTP_404_NOT_FOUND)
    table.delete()
    return Response({"message": "Table deleted"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def assign_customer_to_table(request, table_id):
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response({"error": "Bàn không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    phone = request.data.get('phone')
    if not phone:
        return Response({"error": "Số điện thoại không được để trống"}, status=status.HTTP_400_BAD_REQUEST)
    
    customer = Customer.objects.filter(phone=phone).first()
    if not customer:
        return Response({"error": "Không tìm thấy khách hàng"}, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra xem bàn đã có khách chưa
    if table.customer.exists():
        return Response({"error": "Bàn đã có khách, không thể thêm"}, status=status.HTTP_400_BAD_REQUEST)
    
    with transaction.atomic():
        # Gỡ khách khỏi các bàn hiện tại (nếu có)
        old_tables = customer.tables.all()
        for old_table in old_tables:
            old_table.customer.remove(customer)
            notify_table_update(old_table.id, action="customer_removed", customer=customer)

        # Gán khách hàng vào bàn mới
        table.customer.add(customer)
        notify_table_update(table_id, action="customer_assigned", customer=customer)

    serializer = TableSerializer(table)
    return Response(serializer.data, status=status.HTTP_200_OK)


def notify_table_update(table_id, action, customer):
    """
    Send WebSocket updates for table changes to a common group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(  # Gửi thông báo WebSocket đến group
        "all_tables",  # Tên nhóm chứa tất cả các bàn
        {
            "type": "table_update",  # Loại sự kiện
            "message": {
                "action": action,  # Hành động ("customer_assigned" hoặc "customer_removed")
                "table_id": table_id,  # ID của bàn
                "customer": {  # Thông tin khách hàng
                    "name": customer.name,
                    "phone": customer.phone
                }
            }
        }
    )

@api_view(['POST'])
def remove_customer_from_table(request, table_id):
    """
    Remove a specific customer from a table
    Expects: {
        "phone": "customer_phone_number"
    }
    """
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response(
            {"error": "Bàn không tồn tại"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    phone = request.data.get('phone')
    if not phone:
        return Response(
            {"error": "Số điện thoại không được để trống"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    customer = Customer.objects.filter(phone=phone).first()
    if not customer:
        return Response(
            {"error": "Không tìm thấy khách hàng"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if customer not in table.customer.all():
        return Response(
            {"error": "Khách hàng không ngồi tại bàn này"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Xóa khách hàng khỏi bàn mà không cần quan tâm đến thứ tự
    table.customer.remove(customer)
    
    # Trả về danh sách khách hàng còn lại sau khi xóa
    remaining_customers = [{
        "name": c.name,
        "phone": c.phone,
        "email": c.email
    } for c in table.customer.all()]
    
    return Response({
        "message": "Đã xóa khách hàng khỏi bàn",
        "table_id": table_id,
        "table_name": table.name,
        "remaining_customers": remaining_customers
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_table_customers(request, table_id):
    """Get all customers currently at a specific table"""
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response({"error": "Bàn không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    customers = table.customer.all()
    return Response({
        "table_id": table_id,
        "table_name": table.name,
        "customers": [
            {
                "name": customer.name,
                "phone": customer.phone,
                "email": customer.email
            } for customer in customers
        ]
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def check_table_availability(request, table_id):
    """Check if a table is currently occupied"""
    table = Table.objects.filter(id=table_id).first()
    if not table:
        return Response({"error": "Bàn không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    
    is_occupied = table.customer.exists()
    return Response({
        "table_id": table_id,
        "table_name": table.name,
        "is_occupied": is_occupied,
        "customer_count": table.customer.count()
    }, status=status.HTTP_200_OK)