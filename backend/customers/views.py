from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Customer
from .serializers import CustomerSerializer

@api_view(['POST'])
def login_customer(request):
    serializer = CustomerSerializer(data=request.data, use_unique_validator=False)
    
    if not serializer.is_valid():
        return Response({'error': 'Vui lòng cung cấp đầy đủ số điện thoại và tên!'}, status=status.HTTP_400_BAD_REQUEST)
        
    phone = serializer.validated_data['phone']
    name = serializer.validated_data['name']
    
    try:
        customer = Customer.objects.get(phone=phone)
        if customer.name != name:
            return Response({'error': 'Tên khách hàng không khớp!'}, status=status.HTTP_400_BAD_REQUEST)
    except Customer.DoesNotExist:
        customer = Customer.objects.create(phone=phone, name=name)
    
    return Response(CustomerSerializer(customer).data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_customer_points(request):
    try:
        phone = request.headers.get('Authorization').split(' ')[1]
        customer = Customer.objects.get(phone=phone)
        return Response({'points': customer.points}, status=status.HTTP_200_OK)
    except Customer.DoesNotExist:
        return Response({'error': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_customers(request):
    customers = Customer.objects.all()
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_customer(request):
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_customer(request, phone):
    try:
        customer = Customer.objects.get(phone=phone)
    except Customer.DoesNotExist:
        return Response({'error': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CustomerSerializer(customer, data=request.data, use_unique_validator=False)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_customer(request, phone):
    try:
        customer = Customer.objects.get(phone=phone)
        customer.delete()
        return Response({'message': 'Xóa khách hàng thành công'}, status=status.HTTP_204_NO_CONTENT)
    except Customer.DoesNotExist:
        return Response({'error': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def register_member(request):
    # Remove "Bearer " part of the token to get the actual phone number
    phone = request.headers.get('Authorization').split(' ')[1]
    customer = Customer.objects.get(phone=phone)
    email = request.data.get('email')
    address = request.data.get('address')
    if not email or not address:
        return Response({"detail": "Email and address are required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        # Find the customer by phone number
        customer = Customer.objects.get(phone=phone)
        # Update customer's email, address, and VIP status
        customer.email = email
        customer.address = address
        customer.is_member = True  # Mark the customer as a VIP member
        customer.save()

        return Response({"detail": "Registration successful!"}, status=status.HTTP_200_OK)
    
    except Customer.DoesNotExist:
        return Response({"detail": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
def check_membership(request):
    try:
        # Get the phone number from the Authorization header
        phone = request.headers.get('Authorization').split(' ')[1]
        
        # Try to fetch the customer based on the phone number
        customer = Customer.objects.get(phone=phone)
        
        # Return the membership status (True or False)
        return Response({'is_member': customer.is_member}, status=status.HTTP_200_OK)
    
    except Customer.DoesNotExist:
        # If no customer is found, return a 404 response
        return Response({'error': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        # Catch other exceptions and return a 400 response
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_total_customers(request):
    total_customers = Customer.objects.count()
    return Response({'total_customers': total_customers})


@api_view(['GET'])
def get_customer_info(request):
    try:

        phone = request.headers.get('Authorization').split(' ')[1]
        
        customer = Customer.objects.get(phone=phone)

        customer_info = {
            'name': customer.name,
            'phone': customer.phone,
            'email': customer.email,
            'address': customer.address,
            'total_spent': customer.total_spent,
            'points': customer.points,
            'is_member': customer.is_member,
            'date_created': customer.date_created
        }
        
        return Response(customer_info, status=status.HTTP_200_OK)
    
    except Customer.DoesNotExist:
        
        return Response({'error': 'Không tìm thấy khách hàng'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:

        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)