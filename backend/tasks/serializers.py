from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'created_at', 
                 'updated_at', 'due_date', 'user', 'tags', 'priority']
        read_only_fields = ['created_at', 'updated_at', 'user']

    def create(self, validated_data):
        # Otomatik olarak mevcut kullanıcıyı task'a atayalım
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 