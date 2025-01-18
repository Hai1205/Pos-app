from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from products.models import *
from categories.models import *
from .serializers import *

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response({
            'data': serializer.data,
            'sizes': [
                {
                    'name': 'Vừa',
                    'price': product.price,
                    'note': product.note
                },
                {
                    'name': 'Lớn',
                    'price': product.large_size_price,
                    'note': product.note
                } if product.has_large_size else None
            ]
        })
    except Product.DoesNotExist:
        return Response(
            {"error": "Sản phẩm không tồn tại"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def create_product(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(has_large_size=True)
        product = serializer.instance
        sizes = [
            {
                'name': 'Vừa',
                'price': product.price,
                'note': product.note
            },
            {
                'name': 'Lớn',
                'price': product.large_size_price,
                'note': product.note
            }
        ]
        return Response({
            "message": "Tạo sản phẩm thành công",
            "data": {
                **serializer.data,
                'sizes': sizes
            }
        }, status=status.HTTP_201_CREATED)
    return Response({
        "error": "Dữ liệu không hợp lệ",
        "details": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product, data=request.data)
        
        if serializer.is_valid():
            serializer.save(has_large_size=True)
            return Response({
                "message": "Cập nhật sản phẩm thành công",
                "data": {
                    **serializer.data,
                    'sizes': [
                        {'name': 'Mặc định', 'price': product.price},
                        {'name': 'Lớn', 'price': product.large_size_price}
                    ]
                }
            })
        
        return Response({
            "error": "Dữ liệu không hợp lệ",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Product.DoesNotExist:
        return Response({
            "error": "Sản phẩm không tồn tại"
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        product.delete()
        return Response(
            {"message": "Xóa sản phẩm thành công"},
            status=status.HTTP_204_NO_CONTENT
        )
    except Product.DoesNotExist:
        return Response(
            {"error": "Sản phẩm không tồn tại"}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
def toggle_product_status(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        product.is_available = not product.is_available
        product.save()
        serializer = ProductSerializer(product)
        return Response({
            "message": "Cập nhật trạng thái thành công",
            "data": serializer.data
        })
    except Product.DoesNotExist:
        return Response(
            {"error": "Sản phẩm không tồn tại"},
            status=status.HTTP_404_NOT_FOUND
        )
    
@api_view(['GET'])
def get_total_products(request):
    total_products = Product.objects.count()
    return Response({'total_products': total_products})