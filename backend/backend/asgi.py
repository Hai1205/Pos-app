"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from orders import routing as orders_routing
from tables import routing as tables_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Hàm để hợp nhất tất cả websocket_urlpatterns từ các module
def merge_websocket_urlpatterns(*modules):
    return [url for module in modules for url in module.websocket_urlpatterns]

# Hợp nhất tất cả websocket_urlpatterns
websocket_urlpatterns = merge_websocket_urlpatterns(orders_routing, tables_routing)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns) 
    ),
})
