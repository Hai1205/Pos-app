from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import *
from tables.serializers import *

class CustomerSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)

    #Thêm use_unique_validator = True or False để mở hay vô hiệu hóa Unique
    def __init__(self, *args, **kwargs):
        use_unique_validator = kwargs.pop('use_unique_validator', True)
        super().__init__(*args, **kwargs)
        
        self.fields['phone'].validators = []

        if use_unique_validator:
            self.fields['phone'].validators.append(
                UniqueValidator(queryset=Customer.objects.all(), message="Số điện thoại đã tồn tại!")
            )


    class Meta:
        model = Customer
        fields = '__all__'