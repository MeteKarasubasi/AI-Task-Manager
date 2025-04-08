from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from .models import Task, TaskTag, TaskComment, TaskAttachment, RecurringTaskPattern
from .serializers import (
    TaskSerializer, 
    TaskCreateSerializer, 
    TaskUpdateSerializer,
    TaskTagSerializer,
    TaskCommentSerializer,
    TaskAttachmentSerializer,
    RecurringTaskPatternSerializer
)


class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for tasks
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Customize the queryset based on query parameters:
        - status: filter by status
        - priority: filter by priority
        - project: filter by project id
        - assigned_to: filter by assigned user id
        - due_before: filter by due date before a specific date
        - due_after: filter by due date after a specific date
        - overdue: filter overdue tasks (due_date < now and status != done)
        """
        queryset = super().get_queryset()
        
        # Filter by user (assigned or created)
        user = self.request.user
        queryset = queryset.filter(
            Q(creator=user) | Q(assigned_to=user) | Q(project__members=user)
        ).distinct()
        
        # Apply filters from query parameters
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        assigned_to_id = self.request.query_params.get('assigned_to')
        if assigned_to_id:
            queryset = queryset.filter(assigned_to_id=assigned_to_id)
        
        due_before = self.request.query_params.get('due_before')
        if due_before:
            queryset = queryset.filter(due_date__lte=due_before)
        
        due_after = self.request.query_params.get('due_after')
        if due_after:
            queryset = queryset.filter(due_date__gte=due_after)
        
        overdue = self.request.query_params.get('overdue')
        if overdue and overdue.lower() == 'true':
            now = timezone.now()
            queryset = queryset.filter(
                due_date__lt=now,
                status__in=['todo', 'in_progress', 'review']
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a task"""
        task = self.get_object()
        serializer = TaskCommentSerializer(
            data={'task': task.id, 'content': request.data.get('content')},
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """Add an attachment to a task"""
        task = self.get_object()
        serializer = TaskAttachmentSerializer(
            data={
                'task': task.id, 
                'file': request.data.get('file'),
                'name': request.data.get('name')
            },
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post', 'get'])
    def recurring_pattern(self, request, pk=None):
        """Get or create a recurring pattern for a task"""
        task = self.get_object()
        
        if request.method == 'GET':
            try:
                pattern = RecurringTaskPattern.objects.get(task=task)
                serializer = RecurringTaskPatternSerializer(pattern)
                return Response(serializer.data)
            except RecurringTaskPattern.DoesNotExist:
                return Response(
                    {'error': 'No recurring pattern found for this task'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if not task.is_recurring:
            task.is_recurring = True
            task.save()
        
        # Create or update the recurring pattern
        try:
            pattern = RecurringTaskPattern.objects.get(task=task)
            serializer = RecurringTaskPatternSerializer(pattern, data=request.data)
        except RecurringTaskPattern.DoesNotExist:
            serializer = RecurringTaskPatternSerializer(data={**request.data, 'task': task.id})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskTagViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task tags
    """
    queryset = TaskTag.objects.all()
    serializer_class = TaskTagSerializer
    permission_classes = [permissions.IsAuthenticated]


class TaskCommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task comments
    """
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('task')
        
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        return queryset


class TaskAttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for task attachments
    """
    queryset = TaskAttachment.objects.all()
    serializer_class = TaskAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('task')
        
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        return queryset
