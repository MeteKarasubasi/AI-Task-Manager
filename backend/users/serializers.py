from rest_framework import serializers
from .models import CustomUser, UserSettings


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['calendar_sync', 'task_reminder_minutes', 'daily_summary_time', 'weekend_notifications']


class UserSerializer(serializers.ModelSerializer):
    settings = UserSettingsSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'profile_picture', 
            'bio', 'phone_number', 'date_joined', 'last_login',
            'notification_preference', 'theme_preference', 'language_preference',
            'settings'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'first_name', 'last_name', 
            'firebase_uid', 'profile_picture'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        # Create user settings
        UserSettings.objects.create(user=user)
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'profile_picture', 
            'bio', 'phone_number', 'notification_preference', 
            'theme_preference', 'language_preference'
        ]


class UserSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['calendar_sync', 'task_reminder_minutes', 'daily_summary_time', 'weekend_notifications'] 