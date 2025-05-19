"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def welcome(request):
    """
    API ana sayfası için basit bir karşılama mesajı.
    """
    return JsonResponse({
        'message': 'AI Task Manager API\'sine Hoş Geldiniz!',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': {
                'users': '/api/users/',
                'profile': '/api/users/me/',
                'email_verification': '/api/users/verify_email/',
                'password_reset': '/api/users/reset_password/',
            }
        }
    })

urlpatterns = [
    path('', welcome, name='welcome'),  # Ana sayfa
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
