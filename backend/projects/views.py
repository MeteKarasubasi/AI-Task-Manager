from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import (
    Project, ProjectMember, ProjectCategory, 
    ProjectDocument, ProjectNote, KanbanBoard, KanbanColumn
)
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, ProjectMemberSerializer,
    ProjectCategorySerializer, ProjectDocumentSerializer, ProjectNoteSerializer,
    KanbanBoardSerializer, KanbanColumnSerializer
)
from users.models import CustomUser


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for projects
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        """Filter projects to only include those the user is a member of or created"""
        user = self.request.user
        return Project.objects.filter(
            Q(creator=user) | Q(members=user)
        ).distinct()
    
    @action(detail=True, methods=['get', 'post', 'delete'])
    def members(self, request, pk=None):
        project = self.get_object()
        
        if request.method == 'GET':
            members = ProjectMember.objects.filter(project=project)
            serializer = ProjectMemberSerializer(members, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Check if the user is allowed to add members (must be owner or admin)
            user_role = ProjectMember.objects.filter(
                project=project, user=request.user
            ).values_list('role', flat=True).first()
            
            if user_role not in [ProjectMember.Role.OWNER, ProjectMember.Role.ADMIN]:
                return Response(
                    {'error': 'You do not have permission to add members to this project'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user_id = request.data.get('user_id')
            role = request.data.get('role', ProjectMember.Role.MEMBER)
            
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if the user is already a member
            if ProjectMember.objects.filter(project=project, user=user).exists():
                return Response(
                    {'error': 'User is already a member of this project'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the new member
            member = ProjectMember.objects.create(
                project=project, user=user, role=role
            )
            serializer = ProjectMemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        elif request.method == 'DELETE':
            user_id = request.data.get('user_id')
            
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if the user is allowed to remove members
            user_role = ProjectMember.objects.filter(
                project=project, user=request.user
            ).values_list('role', flat=True).first()
            
            if user_role not in [ProjectMember.Role.OWNER, ProjectMember.Role.ADMIN]:
                return Response(
                    {'error': 'You do not have permission to remove members from this project'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Cannot remove the owner
            target_member = get_object_or_404(ProjectMember, project=project, user_id=user_id)
            if target_member.role == ProjectMember.Role.OWNER:
                return Response(
                    {'error': 'Cannot remove the project owner'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete the member
            target_member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get', 'post'])
    def notes(self, request, pk=None):
        project = self.get_object()
        
        if request.method == 'GET':
            notes = ProjectNote.objects.filter(project=project)
            serializer = ProjectNoteSerializer(notes, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ProjectNoteSerializer(
                data={**request.data, 'project': project.id},
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def documents(self, request, pk=None):
        project = self.get_object()
        
        if request.method == 'GET':
            documents = ProjectDocument.objects.filter(project=project)
            serializer = ProjectDocumentSerializer(documents, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ProjectDocumentSerializer(
                data={**request.data, 'project': project.id},
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def kanban_board(self, request, pk=None):
        project = self.get_object()
        
        try:
            board = KanbanBoard.objects.get(project=project)
        except KanbanBoard.DoesNotExist:
            # Create a new board if it doesn't exist
            board = KanbanBoard.objects.create(project=project)
            # Create default columns
            columns = [
                {'name': 'To Do', 'order': 0, 'color': '#3498db'},
                {'name': 'In Progress', 'order': 1, 'color': '#f39c12'},
                {'name': 'Review', 'order': 2, 'color': '#9b59b6'},
                {'name': 'Done', 'order': 3, 'color': '#2ecc71'}
            ]
            for column in columns:
                KanbanColumn.objects.create(board=board, **column)
        
        serializer = KanbanBoardSerializer(board)
        return Response(serializer.data)


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for project categories
    """
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class KanbanColumnViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Kanban columns
    """
    queryset = KanbanColumn.objects.all()
    serializer_class = KanbanColumnSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter columns by board_id if provided"""
        queryset = super().get_queryset()
        board_id = self.request.query_params.get('board')
        
        if board_id:
            queryset = queryset.filter(board_id=board_id)
        
        return queryset.order_by('order')
