from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectCategoryViewSet, KanbanColumnViewSet

router = DefaultRouter()
router.register('', ProjectViewSet)
router.register('categories', ProjectCategoryViewSet)
router.register('columns', KanbanColumnViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 