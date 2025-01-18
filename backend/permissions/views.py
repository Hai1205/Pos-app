from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from .models import Permission, RolePermission
from .serializers import PermissionSerializer, RolePermissionSerializer, RoleSerializer
from .decorators import required_permissions

@api_view(['GET'])
def get_roles(request):
    """Lấy danh sách tất cả các vai trò"""
    try:
        roles = [
            {'code': role[0], 'name': role[1]} 
            for role in RolePermission.ROLE_CHOICES
        ]
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy danh sách vai trò',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_all_permissions(request):
    """
    Lấy danh sách tất cả các quyền hiện có trong hệ thống
    """
    try:
        permissions = Permission.objects.all()
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy danh sách các quyền',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@required_permissions(['view_permissions'])
def get_permissions(request):
    """"
    Lấy danh sách quyền của một vai trò cụ thể
    """
    role = request.query_params.get('role')
    if not role:
        return Response(
            {'error': 'Vai trò không được cung cấp'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if role not in dict(RolePermission.ROLE_CHOICES):
        return Response(
            {'error': 'Vai trò không hợp lệ', 'valid_roles': dict(RolePermission.ROLE_CHOICES)},
            status=status.HTTP_400_BAD_REQUEST
        )

    role_permissions = RolePermission.objects.filter(role=role).select_related('permission')
    serializer = RolePermissionSerializer(role_permissions, many=True)
    return Response({
        'role': role,
        'role_display': dict(RolePermission.ROLE_CHOICES)[role],
        'permissions': serializer.data
    })

@api_view(['POST'])
def update_permissions(request):
    """
    Cập nhật quyền cho một vai trò
    """
    role = request.data.get('role')
    permissions = request.data.get('permissions')

    if not role or not permissions:
        return Response(
            {'error': 'Vai trò hoặc danh sách quyền không được cung cấp'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if role not in dict(RolePermission.ROLE_CHOICES):
        return Response(
            {'error': 'Vai trò không hợp lệ', 'valid_roles': dict(RolePermission.ROLE_CHOICES)},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Xóa các quyền cũ của vai trò
        RolePermission.objects.filter(role=role).delete()

        # Thêm các quyền mới cho vai trò
        new_permissions = [
            RolePermission(role=role, permission_id=permission_id)
            for permission_id in permissions
        ]
        RolePermission.objects.bulk_create(new_permissions)

        return Response({'message': 'Cập nhật quyền thành công'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'Lỗi khi cập nhật quyền', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@required_permissions(['view_statistics'])
def get_statistics(request):
    """Lấy thống kê về phân quyền"""
    try:
        # Tính toán thống kê
        role_stats = RolePermission.objects.values(
            'role'
        ).annotate(
            permission_count=Count('permission')
        )
        
        # Tạo dict chứa số lượng quyền của mỗi role
        role_permission_counts = {
            stat['role']: stat['permission_count']
            for stat in role_stats
        }
        
        # Thêm các role chưa có quyền nào
        all_roles = dict(RolePermission.ROLE_CHOICES)
        for role_code in all_roles:
            if role_code not in role_permission_counts:
                role_permission_counts[role_code] = 0
        
        stats = {
            'total_permissions': Permission.objects.count(),
            'total_role_permissions': RolePermission.objects.count(),
            'current_role': {
                'code': request.role,
                'name': all_roles[request.role],
                'permission_count': role_permission_counts.get(request.role, 0)
            },
            'roles_statistics': [
                {
                    'code': role_code,
                    'name': all_roles[role_code],
                    'permission_count': role_permission_counts.get(role_code, 0)
                }
                for role_code in all_roles
            ]
        }
        
        return Response(stats)
    except Exception as e:
        return Response(
            {
                'error': 'Lỗi khi lấy thống kê',
                'message': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )