from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer
from firebase_admin import auth
from django.utils import timezone

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    Kullanıcı yönetimi için viewset.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Giriş yapmış kullanıcının bilgilerini döndürür.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        """
        Kullanıcının email adresini doğrulama bağlantısı gönderir.
        """
        try:
            link = auth.generate_email_verification_link(
                request.user.email,
                action_code_settings=None  # Firebase Console'da ayarlanan varsayılan ayarları kullan
            )
            # Burada email gönderme işlemi yapılabilir
            return Response({'message': 'Doğrulama bağlantısı gönderildi.', 'link': link})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        """
        Şifre sıfırlama bağlantısı gönderir.
        """
        try:
            email = request.data.get('email')
            if not email:
                return Response(
                    {'error': 'Email adresi gereklidir.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            link = auth.generate_password_reset_link(
                email,
                action_code_settings=None  # Firebase Console'da ayarlanan varsayılan ayarları kullan
            )
            # Burada email gönderme işlemi yapılabilir
            return Response({'message': 'Şifre sıfırlama bağlantısı gönderildi.', 'link': link})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_update(self, serializer):
        """
        Kullanıcı güncellenirken Firebase'i de güncelle
        """
        user = serializer.instance
        updated_data = serializer.validated_data
        
        try:
            # Firebase'de kullanıcıyı güncelle
            if user.firebase_uid:
                update_params = {}
                
                if 'email' in updated_data:
                    update_params['email'] = updated_data['email']
                if 'first_name' in updated_data or 'last_name' in updated_data:
                    display_name = f"{updated_data.get('first_name', user.first_name)} {updated_data.get('last_name', user.last_name)}".strip()
                    update_params['display_name'] = display_name
                if 'phone_number' in updated_data:
                    update_params['phone_number'] = updated_data['phone_number']
                
                if update_params:
                    auth.update_user(user.firebase_uid, **update_params)
            
            serializer.save()
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_destroy(self, instance):
        """
        Kullanıcı silinirken Firebase'den de sil
        """
        try:
            if instance.firebase_uid:
                auth.delete_user(instance.firebase_uid)
            instance.delete()
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
