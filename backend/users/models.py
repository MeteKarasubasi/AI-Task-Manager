from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email as the unique identifier instead of username.
    Works with Firebase Authentication.
    """
    # Firebase UID for authentication
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    
    # Basic user fields
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    
    # Profile fields
    profile_picture = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    # Dates
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Additional settings
    notification_preference = models.JSONField(default=dict, blank=True)
    theme_preference = models.CharField(max_length=10, default='light')
    language_preference = models.CharField(max_length=10, default='en')
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]


class UserSettings(models.Model):
    """
    User settings model to store user preferences
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='settings')
    calendar_sync = models.BooleanField(default=False)
    task_reminder_minutes = models.IntegerField(default=30)
    daily_summary_time = models.TimeField(null=True, blank=True)
    weekend_notifications = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'
    
    def __str__(self):
        return f"Settings for {self.user.email}"
