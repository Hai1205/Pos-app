from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import RolePermission

def required_permissions(permission_codes):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # Lấy role từ query params hoặc data
            user_role = request.query_params.get('role') or request.data.get('role')
            
            if not user_role:
                return Response(
                    {
                        'error': 'Role không được cung cấp',
                        'message': 'Vui lòng cung cấp role trong query params hoặc request body'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kiểm tra role có hợp lệ không
            if user_role not in dict(RolePermission.ROLE_CHOICES):
                return Response(
                    {
                        'error': 'Role không hợp lệ',
                        'valid_roles': dict(RolePermission.ROLE_CHOICES)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Lấy tất cả quyền của role
                user_permissions = RolePermission.objects.filter(
                    role=user_role
                ).values_list('permission__code', flat=True)

                # Kiểm tra từng quyền yêu cầu
                missing_permissions = [
                    code for code in permission_codes 
                    if code not in user_permissions
                ]
                
                if missing_permissions:
                    return Response(
                        {
                            'error': 'Không có quyền truy cập',
                            'role': user_role,
                            'role_display': dict(RolePermission.ROLE_CHOICES)[user_role],
                            'missing_permissions': missing_permissions,
                            'required_permissions': permission_codes
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

                # Thêm role vào request để có thể sử dụng trong view
                request.role = user_role
                return view_func(request, *args, **kwargs)
                
            except Exception as e:
                return Response(
                    {
                        'error': 'Lỗi hệ thống',
                        'message': str(e)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        return wrapped_view
    return decorator