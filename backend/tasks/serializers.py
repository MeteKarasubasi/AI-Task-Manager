from rest_framework import serializers
from .models import Task, TaskTag, TaskComment, TaskAttachment, RecurringTaskPattern
from users.serializers import UserSerializer


class TaskTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTag
        fields = ['id', 'name', 'color']


class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'task', 'file', 'name', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    
    def create(self, validated_data):
        # Set the uploaded_by from the request
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class RecurringTaskPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringTaskPattern
        fields = [
            'id', 'task', 'recurrence_type', 'interval', 
            'start_date', 'end_date', 'monday', 'tuesday', 
            'wednesday', 'thursday', 'friday', 'saturday', 
            'sunday', 'day_of_month'
        ]
        read_only_fields = ['id']


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    tags = TaskTagSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    recurrence_pattern = RecurringTaskPatternSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'created_at', 'updated_at', 'due_date', 'creator',
            'assigned_to', 'project', 'parent_task', 'estimated_hours',
            'tags', 'is_recurring', 'ai_suggested', 'ai_summary',
            'is_overdue', 'days_until_due', 'comments', 'attachments',
            'recurrence_pattern'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the creator to the current user
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class TaskCreateSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        many=True, queryset=TaskTag.objects.all(), required=False
    )
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority',
            'due_date', 'assigned_to', 'project', 'parent_task',
            'estimated_hours', 'tags', 'is_recurring'
        ]
    
    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        task = Task.objects.create(creator=self.context['request'].user, **validated_data)
        if tags:
            task.tags.set(tags)
        return task


class TaskUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        many=True, queryset=TaskTag.objects.all(), required=False
    )
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority',
            'due_date', 'assigned_to', 'project', 'parent_task',
            'estimated_hours', 'tags', 'is_recurring'
        ]
    
    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        task = super().update(instance, validated_data)
        if tags is not None:
            task.tags.set(tags)
        return task 