from rest_framework import serializers
from .models import (
    Project, ProjectMember, ProjectCategory, 
    ProjectDocument, ProjectNote, KanbanBoard, KanbanColumn
)
from users.serializers import UserSerializer


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'description', 'color']


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user', 
        queryset='users.CustomUser.objects.all()',
        write_only=True
    )
    
    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class ProjectDocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectDocument
        fields = ['id', 'project', 'title', 'file', 'description', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by']
    
    def create(self, validated_data):
        # Set the uploaded_by from the request
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class ProjectNoteSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectNote
        fields = ['id', 'project', 'title', 'content', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        # Set the created_by from the request
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class KanbanColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanbanColumn
        fields = ['id', 'board', 'name', 'order', 'color']
        read_only_fields = ['id']


class KanbanBoardSerializer(serializers.ModelSerializer):
    columns = KanbanColumnSerializer(many=True, read_only=True)
    
    class Meta:
        model = KanbanBoard
        fields = ['id', 'project', 'name', 'created_at', 'columns']
        read_only_fields = ['id', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    progress_percentage = serializers.IntegerField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'created_at', 
            'updated_at', 'start_date', 'end_date', 'creator', 
            'color', 'icon', 'is_public', 'next_meeting_date',
            'ai_generated_summary', 'members_count', 'progress_percentage',
            'is_overdue'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def create(self, validated_data):
        # Set the creator to the current user
        validated_data['creator'] = self.context['request'].user
        project = super().create(validated_data)
        
        # Create a ProjectMember for the creator with 'owner' role
        ProjectMember.objects.create(
            project=project,
            user=validated_data['creator'],
            role=ProjectMember.Role.OWNER
        )
        
        # Create a KanbanBoard for the project
        kanban_board = KanbanBoard.objects.create(project=project)
        
        # Create default columns for the Kanban board
        columns = [
            {'name': 'To Do', 'order': 0, 'color': '#3498db'},
            {'name': 'In Progress', 'order': 1, 'color': '#f39c12'},
            {'name': 'Review', 'order': 2, 'color': '#9b59b6'},
            {'name': 'Done', 'order': 3, 'color': '#2ecc71'}
        ]
        for column in columns:
            KanbanColumn.objects.create(board=kanban_board, **column)
        
        return project


class ProjectDetailSerializer(ProjectSerializer):
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    notes = ProjectNoteSerializer(many=True, read_only=True)
    documents = ProjectDocumentSerializer(many=True, read_only=True)
    kanban_board = KanbanBoardSerializer(read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['members', 'notes', 'documents', 'kanban_board'] 