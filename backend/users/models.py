import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Özel kullanıcı modeli için manager sınıfı.
    Email'i username olarak kullanır.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Email adresi zorunludur'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser is_staff=True olmalıdır.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser is_superuser=True olmalıdır.'))

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """
    Özel kullanıcı modeli.
    Username yerine email kullanır ve Firebase UID içerir.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # Username alanını devre dışı bırak
    email = models.EmailField(_('email address'), unique=True)
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    
    # Profil bilgileri
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.URLField(max_length=1024, blank=True, null=True)
    
    # Tercihler
    preferred_language = models.CharField(max_length=10, default='tr')
    notification_enabled = models.BooleanField(default=True)
    
    # Zaman damgaları
    email_verified_at = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    def get_full_name(self):
        """
        Kullanıcının tam adını döndürür.
        """
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    def get_short_name(self):
        """
        Kullanıcının kısa adını döndürür.
        """
        return self.first_name if self.first_name else self.email.split('@')[0]
