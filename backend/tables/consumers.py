from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TableConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Gắn nhóm "all_tables" cho tất cả các bàn
        self.group_name = "all_tables"
        
        # Join vào group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Chấp nhận kết nối WebSocket
        await self.accept()

    async def disconnect(self, close_code):
        # Rời khỏi group khi ngắt kết nối
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Nhận thông báo từ group
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Xử lý thông điệp nhận được nếu cần
        # Bạn có thể xử lý các loại thông điệp khác nhau ở đây
        pass

    # Nhận thông báo từ group (khi có cập nhật bàn)
    async def table_update(self, event):
        # Lấy dữ liệu từ event
        action = event['message']['action']
        table_id = event['message']['table_id']
        customer = event['message']['customer']
        
        # Gửi dữ liệu đến WebSocket (client)
        await self.send(text_data=json.dumps({
            'action': action,
            'table_id': table_id,
            'customer': customer
        }))
