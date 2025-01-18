from django.urls import re_path
from .consumers import TableConsumer

websocket_urlpatterns = [
    re_path(r'ws/tables/updates/$', TableConsumer.as_asgi()), 
]
