from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r'^ws/orders/updates/$', OrderConsumer.as_asgi()),
    re_path(r'ws/orders/status/$', OrderStatusConsumer.as_asgi()),
]
