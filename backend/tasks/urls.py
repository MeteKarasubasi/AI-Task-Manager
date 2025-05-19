from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router oluştur
router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet, basename='task')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
    path('voice-to-text/', views.voice_to_text, name='voice-to-text'),
] 