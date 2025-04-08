from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskTagViewSet, TaskCommentViewSet, TaskAttachmentViewSet

router = DefaultRouter()
router.register('', TaskViewSet)
router.register('tags', TaskTagViewSet)
router.register('comments', TaskCommentViewSet)
router.register('attachments', TaskAttachmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 