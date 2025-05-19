from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Tag, Task, Subtask, TaskComment
from .serializers import (
    CategorySerializer, TagSerializer, TaskSerializer,
    SubtaskSerializer, TaskCommentSerializer
)
from django.db import models
import os
import tempfile
import subprocess
import json

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Kategori işlemleri için ViewSet.
    
    list: Tüm kategorileri listeler
    create: Yeni kategori oluşturur
    retrieve: Belirli bir kategoriyi getirir
    update: Kategori bilgilerini günceller
    delete: Kategori siler
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        """Kullanıcıya ait kategorileri filtreler."""
        return Category.objects.filter(created_by=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    """
    Etiket işlemleri için ViewSet.
    """
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        """Kullanıcıya ait etiketleri filtreler."""
        return Tag.objects.filter(created_by=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    """
    Görev işlemleri için ViewSet.
    
    Ek actions:
    - mark_complete: Görevi tamamlandı olarak işaretler
    - mark_in_progress: Görevi devam ediyor olarak işaretler
    - my_tasks: Kullanıcıya atanan görevleri listeler
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'tags']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority']

    def get_queryset(self):
        """
        Kullanıcının erişebileceği görevleri filtreler:
        - Kullanıcının oluşturduğu görevler
        - Kullanıcıya atanan görevler
        """
        user = self.request.user
        return Task.objects.filter(
            models.Q(created_by=user) | models.Q(assigned_to=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """Görevi tamamlandı olarak işaretler."""
        task = self.get_object()
        task.status = 'done'
        task.completed_at = timezone.now()
        task.save()
        return Response({'status': 'Görev tamamlandı olarak işaretlendi.'})

    @action(detail=True, methods=['post'])
    def mark_in_progress(self, request, pk=None):
        """Görevi devam ediyor olarak işaretler."""
        task = self.get_object()
        task.status = 'in_progress'
        task.save()
        return Response({'status': 'Görev devam ediyor olarak işaretlendi.'})

    @action(detail=False)
    def my_tasks(self, request):
        """Kullanıcıya atanan görevleri listeler."""
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

class SubtaskViewSet(viewsets.ModelViewSet):
    """
    Alt görev işlemleri için ViewSet.
    """
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_completed', 'parent_task']

    def get_queryset(self):
        """
        Kullanıcının erişebileceği alt görevleri filtreler:
        - Kullanıcının oluşturduğu alt görevler
        - Kullanıcıya atanan alt görevler
        """
        user = self.request.user
        return Subtask.objects.filter(
            models.Q(created_by=user) | 
            models.Q(assigned_to=user) |
            models.Q(parent_task__created_by=user)
        ).distinct()

class TaskCommentViewSet(viewsets.ModelViewSet):
    """
    Görev yorumları için ViewSet.
    """
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def get_queryset(self):
        """
        Kullanıcının görebileceği yorumları filtreler:
        - Görevin sahibi ise tüm yorumlar
        - Göreve atanmış ise tüm yorumlar
        - Kendi yazdığı yorumlar
        """
        user = self.request.user
        return TaskComment.objects.filter(
            models.Q(task__created_by=user) |
            models.Q(task__assigned_to=user) |
            models.Q(user=user)
        ).distinct()

# Ses dosyasını metne dönüştüren fonksiyon
def convert_audio_to_text(audio_file_path, language='tr'):
    """
    Whisper API kullanarak ses dosyasını metne dönüştürür
    """
    try:
        # Whisper komutunu çalıştır
        # Alternatif olarak çeşitli model boyutları kullanılabilir: tiny, base, small, medium, large
        result = subprocess.run(
            ['whisper', audio_file_path, '--language', language, '--model', 'small', '--output_format', 'json'],
            check=True,
            capture_output=True,
            text=True
        )
        
        # JSON dosyasını oku (Whisper, <dosya-adı>.json oluşturur)
        json_file_path = os.path.splitext(audio_file_path)[0] + '.json'
        
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r', encoding='utf-8') as f:
                transcription_data = json.load(f)
                
            # JSON dosyasını temizle
            try:
                os.remove(json_file_path)
            except:
                pass
                
            # Metni döndür
            return {
                'success': True,
                'text': transcription_data.get('text', '')
            }
        else:
            return {
                'success': False,
                'error': 'Dönüştürme başarılı ancak JSON dosyası oluşturulamadı.'
            }
            
    except subprocess.CalledProcessError as e:
        return {
            'success': False,
            'error': f'Whisper API hatası: {e.stderr}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Beklenmeyen hata: {str(e)}'
        }

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def voice_to_text(request):
    """
    Ses dosyasını alarak metne dönüştüren API endpoint'i
    """
    if 'audio' not in request.FILES:
        return Response(
            {'success': False, 'error': 'Ses dosyası bulunamadı.'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    audio_file = request.FILES['audio']
    
    # Geçici dosya oluştur
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        # Gelen ses dosyasını geçici dosyaya yaz
        for chunk in audio_file.chunks():
            temp_file.write(chunk)
        temp_file_path = temp_file.name
    
    try:
        # Ses dosyasını metne dönüştür
        result = convert_audio_to_text(temp_file_path)
        
        # Geçici dosyayı temizle
        os.unlink(temp_file_path)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        # Hata durumunda geçici dosyayı temizlemeyi dene
        try:
            os.unlink(temp_file_path)
        except:
            pass
            
        return Response(
            {'success': False, 'error': f'Ses işleme hatası: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
