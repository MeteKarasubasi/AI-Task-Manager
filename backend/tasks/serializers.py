from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Category, Tag, Task, Subtask, TaskComment

class CategorySerializer(serializers.ModelSerializer):
    """Kategori modeli için serializer."""
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'icon', 
                 'created_by', 'created_at', 'updated_at', 'task_count']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        """Kategoriye ait görev sayısını döndürür."""
        return obj.tasks.count()

    def create(self, validated_data):
        """Kategori oluştururken mevcut kullanıcıyı ekler."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class TagSerializer(serializers.ModelSerializer):
    """Etiket modeli için serializer."""
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        """Etiket oluştururken mevcut kullanıcıyı ekler."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SubtaskSerializer(serializers.ModelSerializer):
    """Alt görev modeli için serializer."""
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Subtask
        fields = ['id', 'parent_task', 'title', 'description', 'is_completed',
                 'created_by', 'created_by_username', 'assigned_to', 
                 'assigned_to_username', 'due_date', 'created_at', 'updated_at', 
                 'completed_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Alt görev oluştururken mevcut kullanıcıyı ekler."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class TaskCommentSerializer(serializers.ModelSerializer):
    """Görev yorumu modeli için serializer."""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'user', 'user_username', 'content', 
                 'attachment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Yorum oluştururken mevcut kullanıcıyı ekler."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TaskSerializer(serializers.ModelSerializer):
    """Ana görev modeli için serializer."""
    category_detail = CategorySerializer(source='category', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 
            'category', 'category_detail',
            'tags', 'tags_detail',
            'status', 'priority',
            'due_date', 'reminder_date', 'completed_at',
            'created_by', 'created_by_username',
            'assigned_to', 'assigned_to_username',
            'created_at', 'updated_at',
            'estimated_time', 'actual_time',
            'ai_tags', 'ai_summary', 'ai_suggestions',
            'voice_note',
            'subtasks', 'comments'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate(self, data):
        """Özel doğrulama kuralları."""
        # Hatırlatma tarihi kontrolü
        if data.get('reminder_date') and data.get('due_date'):
            if data['reminder_date'] > data['due_date']:
                raise serializers.ValidationError(
                    _('Hatırlatma tarihi, bitiş tarihinden sonra olamaz.')
                )
        
        # Tamamlanma tarihi kontrolü
        if data.get('status') == 'done' and not data.get('completed_at'):
            from django.utils import timezone
            data['completed_at'] = timezone.now()

        return data

    def create(self, validated_data):
        """Görev oluştururken mevcut kullanıcıyı ekler."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data) 