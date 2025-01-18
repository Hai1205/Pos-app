import json
from channels.generic.websocket import AsyncWebsocketConsumer

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'order_updates'
        self.room_group_name = f"order_{self.room_name}"

        # Tham gia nhóm WebSocket
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Debug: Log connection
        print(f"Client connected to room {self.room_group_name}")

        await self.accept()

    async def disconnect(self, close_code):
        # Rời khỏi nhóm
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Debug: Log disconnection
        print(f"Client disconnected from room {self.room_group_name}")

    # Nhận message từ WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')
        table = text_data_json.get('table', {})  # Lấy thông tin bàn nếu có

        # Debug: Log received data
        print(f"Received message from client: {text_data_json}")

        # Gửi message tới group với thông tin bàn
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'order_update',
                'message': message,
                'id': text_data_json.get('id'),
                'status': text_data_json.get('status'),
                'payment_method': text_data_json.get('payment_method'),
                'order_date': text_data_json.get('order_date'),
                'total_amount': text_data_json.get('total_amount'),
                'points_earned': text_data_json.get('points_earned'),
                'points_used': text_data_json.get('points_used'),
                'points_discount': text_data_json.get('points_discount'),
                'final_amount': text_data_json.get('final_amount'),
                'customer': text_data_json.get('customer'),
                'table': table  # Thêm thông tin bàn vào
            }
        )

    # Nhận message từ group
    async def order_update(self, event):
        message = event['message']
        order_id = event['id']
        status = event['status']
        payment_method = event['payment_method']
        order_date = event['order_date']
        total_amount = event['total_amount']
        points_earned = event['points_earned']
        points_used = event['points_used']
        points_discount = event['points_discount']
        final_amount = event['final_amount']
        customer = event['customer']
        table = event.get('table', {})  # Lấy thông tin bàn từ event

        # Debug: Log outgoing message to client
        print(f"Sending update to client: {event}")

        # Gửi thông tin tới WebSocket bao gồm thông tin bàn
        await self.send(text_data=json.dumps({
            'message': message,
            'id': order_id,
            'status': status,
            'payment_method': payment_method,
            'order_date': order_date,
            'total_amount': total_amount,
            'points_earned': points_earned,
            'points_used': points_used,
            'points_discount': points_discount,
            'final_amount': final_amount,
            'customer': customer,
            'table': table  # Thêm thông tin bàn vào
        }))

class OrderStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'order_status_updates'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_order_update(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'customer_phone': event['customer_phone'],
        }))
