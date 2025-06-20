from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register('', UserViewSet)

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
] 