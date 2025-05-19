from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Kullanıcı modeli için serializer.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'profile_picture', 'preferred_language', 'notification_enabled',
            'email_verified_at', 'last_login_at', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'email_verified_at', 'last_login_at', 'date_joined']

    def validate_phone_number(self, value):
        """
        Telefon numarası doğrulama.
        """
        if value and not value.isdigit():
            raise serializers.ValidationError(_("Telefon numarası sadece rakam içermelidir."))
        return value

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Kullanıcı oluşturma için serializer.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user 