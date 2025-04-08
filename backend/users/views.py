from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser, UserSettings
from .serializers import (
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer,
    UserSettingsSerializer,
    UserSettingsUpdateSerializer
)

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current authenticated user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'put', 'patch'])
    def settings(self, request, pk=None):
        """Get or update the user's settings"""
        user = self.get_object()
        
        # Ensure settings object exists
        settings, created = UserSettings.objects.get_or_create(user=user)
        
        if request.method == 'GET':
            serializer = UserSettingsSerializer(settings)
            return Response(serializer.data)
        
        serializer = UserSettingsUpdateSerializer(settings, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def firebase_auth(self, request):
        """
        Create or authenticate a user with Firebase
        Expects firebase_uid and email in the request
        """
        firebase_uid = request.data.get('firebase_uid')
        email = request.data.get('email')
        
        if not firebase_uid or not email:
            return Response(
                {'error': 'firebase_uid and email are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find existing user by Firebase UID
        user = CustomUser.objects.filter(firebase_uid=firebase_uid).first()
        
        # If not found, try by email
        if not user:
            user = CustomUser.objects.filter(email=email).first()
            
            # If user exists by email but no firebase_uid, update it
            if user and not user.firebase_uid:
                user.firebase_uid = firebase_uid
                user.save()
            
            # If user doesn't exist, create new user
            elif not user:
                user_data = {
                    'email': email,
                    'firebase_uid': firebase_uid,
                    'first_name': request.data.get('first_name', ''),
                    'last_name': request.data.get('last_name', ''),
                    'profile_picture': request.data.get('profile_picture', None)
                }
                serializer = UserCreateSerializer(data=user_data)
                if serializer.is_valid():
                    user = serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return the user data
        serializer = UserSerializer(user)
        return Response(serializer.data)
