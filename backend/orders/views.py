from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from customers.models import Customer
from products.models import Product
from django.utils import timezone
from .models import Order, OrderItem, OrderStatus, PaymentMethod
from .serializers import OrderSerializer, OrderItemSerializer
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def calculate_points(amount):
    # 10k = 1đ
    return amount // 10000

def calculate_points_discount(points_to_use):
    # 10đ giảm 10k
    return (points_to_use // 10) * 10000

def validate_status_transition(current_status, new_status):
    """Kiểm tra tính hợp lệ của việc chuyển trạng thái"""
    valid_transitions = {
        'Chờ duyệt': ['Đã duyệt', 'Đã hủy'],
        'Đã duyệt': ['Đang giao', 'Đã hủy'],
        'Đang giao': ['Đã giao', 'Đã hủy'],
        'Đã giao': [],  # không chuyển tiếp
        'Đã hủy': []  # không chuyển tiếp
    }
    return new_status in valid_transitions.get(current_status, [])

@api_view(['POST'])
@transaction.atomic 
def create_order(request):
    try:
        required_fields = ['customer_phone', 'items', 'payment_method']
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {'error': f'Thiếu thông tin bắt buộc: {field}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Kiểm tra phương thức thanh toán
        payment_method_name = request.data.get('payment_method')
        valid_payment_method = PaymentMethod.objects.filter(name=payment_method_name).first()
        if not valid_payment_method:
            all_valid_methods = PaymentMethod.objects.values_list('name', flat=True)
            return Response(
                {'error': 'Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: ' + ', '.join(all_valid_methods)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lấy thông tin khách hàng
        customer = Customer.objects.get(phone=request.data['customer_phone'])
        
        # Lấy thông tin sản phẩm
        items = request.data['items']
        use_points = request.data.get('use_points', False)

        # Tính tổng tiền
        total_amount = 0
        order_items = []

        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'])
                quantity = item['quantity']
                size = item.get('size', 'default')
                
                if quantity <= 0:
                    return Response(
                        {'error': f'Số lượng sản phẩm {product.name} không hợp lệ'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # tính giá theo size
                expected_price = product.large_size_price if size == 'large' else product.price
                sent_price = item.get('price')

                if abs(expected_price - sent_price) > 1:  
                 return Response(
                    {'error': f'Giá không hợp lệ cho sản phẩm {product.name}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
                item_total = sent_price * quantity
                total_amount += item_total
                
                order_items.append({
                'product': product,
                'quantity': quantity,
                'price': sent_price,  
                'size': size,
                'product_note': item.get('product_note', product.note or '')
            })
                
            except Product.DoesNotExist:
                return Response(
                    {'error': f'Không tìm thấy sản phẩm có ID: {item["product_id"]}'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

        points_earned = calculate_points(total_amount)
        
        points_used = 0
        points_discount = 0
        final_amount = total_amount

        # Khi dùng điểm
        if use_points and customer.points >= 10:
            max_points_needed = (total_amount + 9999) // 10000 * 10
            usable_points = (customer.points // 10) * 10
            points_used = min(usable_points, max_points_needed)
            points_discount = calculate_points_discount(points_used)
            final_amount = max(total_amount - points_discount, 0)

        # Tạo đơn hàng
        order = Order.objects.create(
            customer=customer,
            total_amount=total_amount,
            points_earned=points_earned,
            points_used=points_used,
            points_discount=points_discount,
            final_amount=final_amount,
            payment_method=valid_payment_method,
            status='Chờ duyệt'
        )

        # Tạo chi tiết đơn hàng
        order_item_instances = []
        for item in order_items:
            order_item_instances.append(
                OrderItem(
                    order=order,
                    product=item['product'],
                    quantity=item['quantity'],
                    price=item['price'],
                    size=item['size'],
                    product_note=item.get('product_note', item['product'].note or '')
                )
            )
        OrderItem.objects.bulk_create(order_item_instances)

        # Cập nhật điểm
        if use_points:
            customer.points -= points_used  
        customer.points += points_earned
        customer.total_spent += final_amount
        customer.save()

        #Lấy thông tin bàn đang ngồi
        table = customer.tables.first()  # Nếu mỗi khách hàng có thể có nhiều bàn
        table_info = {
            'id': table.id,
            'name': table.name
        }

        # Gửi thông báo real-time qua WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "order_order_updates",  # Room name
            {
                'type': 'order_update',
                'message': f'Đơn hàng {order.id} đã được tạo thành công',
                'id': order.id, 
                'status': order.status,
                'payment_method': valid_payment_method.name,
                'order_date': order.order_date.isoformat() if order.order_date else None,
                'total_amount': total_amount,
                'points_earned': points_earned,
                'points_used': points_used,
                'points_discount': points_discount,
                'final_amount': final_amount,
                'customer': customer.phone, 
                'table': table_info,
            }
        )

        return Response({
            'order_id': order.id,
            'total_amount': total_amount,
            'points_earned': points_earned,
            'points_used': points_used,
            'points_discount': points_discount,
            'final_amount': final_amount,
            'customer_points': customer.points,
            'customer_total_spent': customer.total_spent,
            'payment_method': valid_payment_method.name,
            'status': order.status
        })

    except Customer.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy khách hàng'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def get_orders(request):
    filters = {key: request.query_params[key] for key in ['payment_method', 'status'] if key in request.query_params}
    orders = Order.objects.filter(**filters).order_by('-order_date')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_order_items(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order_items = OrderItem.objects.filter(order=order)
        serializer = OrderItemSerializer(order_items, many=True)

        response_data = []
        for item in serializer.data:
            order_item = OrderItem.objects.get(id=item['id'])
            item['size_display'] = order_item.get_size_display()
            item['product_note'] = order_item.product_note or order_item.product.note
            response_data.append(item)

        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy đơn hàng'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
@api_view(['GET'])
def get_order_status(request, order_id):
    """API lấy trạng thái hiện tại của đơn hàng"""
    try:
        # Lấy thông tin đơn hàng dựa vào order_id
        order = get_object_or_404(Order, id=order_id)

        # Trả về thông tin trạng thái đơn hàng
        return Response({
            'order_id': order.id,
            'status': order.status,
            'customer_name': order.customer.name,
            'customer_phone': order.customer.phone,
            'order_date': order.order_date,
            'total_amount': order.total_amount,
            'final_amount': order.final_amount,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['PUT'])
@transaction.atomic
def update_order_status(request, order_id):
    """API cập nhật trạng thái đơn hàng"""
    try:
        # Kiểm tra các trường bắt buộc
        if 'status' not in request.data:
            return Response(
                {'error': 'Thiếu thông tin trạng thái mới'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lấy thông tin đơn hàng
        order = Order.objects.get(id=order_id)
        new_status = request.data['status']

        # Kiểm tra trạng thái mới có hợp lệ không
        if new_status not in dict(Order.ORDER_STATUS_CHOICES):
            return Response(
                {'error': 'Trạng thái không hợp lệ'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra luồng chuyển trạng thái
        if not validate_status_transition(order.status, new_status):
            return Response(
                {
                    'error': f'Không thể chuyển trạng thái từ "{order.status}" sang "{new_status}"'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cập nhật trạng thái
        old_status = order.status
        order.status = new_status

        order.save()

        # Gửi thông báo qua WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'order_status_updates',
            {
                'type': 'send_order_update',
                'message': f'Đơn hàng #{order.id} "{order.status}".',
                'customer_phone': order.customer.phone
            }
        )

        return Response({
            'order_id': order.id,
            'old_status': old_status,
            'new_status': order.status,
            'customer_name': order.customer.name,
            'customer_phone': order.customer.phone,
            'update_time': timezone.now()
        })

    except Order.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy đơn hàng'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['GET'])
def get_customer_orders(request, customer_phone):
    """API endpoint để khách hàng xem đơn hàng của họ"""
    try:
        # Lọc theo số điện thoại khách hàng
        orders = Order.objects.filter(
            customer__phone=customer_phone
        ).order_by('-order_date')
        
        # Cho phép lọc theo trạng thái nếu có
        order_status = request.query_params.get('status')
        if order_status:
            if order_status not in dict(Order.ORDER_STATUS_CHOICES):
                return Response(
                    {'error': 'Trạng thái không hợp lệ'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            orders = orders.filter(status=order_status)

        serializer = OrderSerializer(orders, many=True)
        
        # Thêm thông tin tổng quan
        response_data = {
            'total_orders': len(orders),
            'orders': serializer.data
        }

        # Thêm số lượng đơn theo từng trạng thái
        status_summary = {}
        for status_code, _ in Order.ORDER_STATUS_CHOICES:
            status_summary[status_code] = orders.filter(status=status_code).count()
        response_data['status_summary'] = status_summary

        return Response(response_data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
def get_customer_order_detail(request, customer_phone, order_id):
    """API endpoint để khách hàng xem chi tiết một đơn hàng cụ thể"""
    try:
        # kt đơn hàng 
        order = Order.objects.filter(
            id=order_id,
            customer__phone=customer_phone
        ).first()

        if not order:
            return Response(
                {'error': 'Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn'},
                status=status.HTTP_404_NOT_FOUND
            )

        # danh sách sản phẩm trong đơn hàng
        order_items = OrderItem.objects.filter(order=order)
        order_item_data = []
        for item in order_items:
            order_item_data.append({
                'product_image': item.product.image.url,
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': item.price,
                'size': item.get_size_display(),
                'size-code': item.size,
                'product_note': item.product_note or item.product.note
            })

        # đơn hàng chi tiết
        response_data = {
            'id': order.id,
            'status': order.status,
            'payment_method': order.payment_method.name,
            'order_date': order.order_date,
            'total_amount': order.total_amount,
            'points_earned': order.points_earned,
            'points_used': order.points_used,
            'points_discount': order.points_discount,
            'final_amount': order.final_amount,
            'customer': order.customer.phone,
            'order_items': order_item_data
        }
        return Response(response_data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )