import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    """
    Görev kategorileri (örn. İş, Kişisel, Alışveriş, vb.)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('kategori adı'), max_length=100)
    description = models.TextField(_('açıklama'), blank=True)
    color = models.CharField(_('renk kodu'), max_length=7, default='#007bff')  # Hex renk kodu
    icon = models.CharField(_('icon'), max_length=50, blank=True)  # Font Awesome icon ismi
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('oluşturulma tarihi'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('kategori')
        verbose_name_plural = _('kategoriler')
        ordering = ['name']
        unique_together = ['name', 'created_by']

    def __str__(self):
        return self.name

class Tag(models.Model):
    """
    Görev etiketleri (örn. Acil, Önemli, Toplantı, vb.)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('etiket adı'), max_length=50)
    color = models.CharField(_('renk kodu'), max_length=7, default='#6c757d')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags',
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('etiket')
        verbose_name_plural = _('etiketler')
        ordering = ['name']
        unique_together = ['name', 'created_by']

    def __str__(self):
        return self.name

class Task(models.Model):
    """
    Ana görev modeli
    """
    PRIORITY_CHOICES = [
        (1, _('Düşük')),
        (2, _('Normal')),
        (3, _('Yüksek')),
        (4, _('Acil'))
    ]

    STATUS_CHOICES = [
        ('todo', _('Yapılacak')),
        ('in_progress', _('Devam Ediyor')),
        ('review', _('İncelemede')),
        ('done', _('Tamamlandı')),
        ('cancelled', _('İptal Edildi'))
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_('başlık'), max_length=200)
    description = models.TextField(_('açıklama'))
    
    # Organizasyon
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('kategori'),
        related_name='tasks'
    )
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        verbose_name=_('etiketler'),
        related_name='tasks'
    )
    
    # Durum ve öncelik
    status = models.CharField(
        _('durum'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo'
    )
    priority = models.IntegerField(
        _('öncelik'),
        choices=PRIORITY_CHOICES,
        default=2,
        validators=[MinValueValidator(1), MaxValueValidator(4)]
    )
    
    # Tarihler
    due_date = models.DateTimeField(_('bitiş tarihi'), null=True, blank=True)
    reminder_date = models.DateTimeField(_('reminder date'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    
    # İlişkiler
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_('oluşturan'),
        related_name='created_tasks'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_('atanan kişi'),
        related_name='assigned_tasks'
    )
    
    # Takip
    created_at = models.DateTimeField(_('oluşturulma tarihi'), auto_now_add=True)
    updated_at = models.DateTimeField(_('güncellenme tarihi'), auto_now=True)
    
    # İstatistikler
    estimated_time = models.DurationField(_('estimated time'), null=True, blank=True)
    actual_time = models.DurationField(_('actual time'), null=True, blank=True)
    
    # AI özellikleri
    ai_tags = models.JSONField(_('AI tags'), default=dict, blank=True)
    ai_summary = models.TextField(_('AI özeti'), blank=True)
    ai_suggestions = models.TextField(_('AI önerileri'), blank=True)
    
    # Ses kaydı için alan
    voice_note = models.FileField(
        _('ses notu'),
        upload_to='voice_notes/',
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = _('görev')
        verbose_name_plural = _('görevler')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def clean(self):
        """
        Özel doğrulama kuralları
        """
        if self.reminder_date and self.due_date and self.reminder_date > self.due_date:
            raise ValidationError(_('Hatırlatma tarihi, bitiş tarihinden sonra olamaz.'))
        
        if self.status == self.STATUS_CHOICES[3][0] and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()

class Subtask(models.Model):
    """
    Alt görev modeli
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent_task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        verbose_name=_('ana görev'),
        related_name='subtasks'
    )
    title = models.CharField(_('başlık'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    is_completed = models.BooleanField(_('tamamlandı mı'), default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_('created by'),
        related_name='created_subtasks'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('assigned to'),
        related_name='assigned_subtasks'
    )
    due_date = models.DateTimeField(_('due date'), null=True, blank=True)
    created_at = models.DateTimeField(_('oluşturulma tarihi'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    completed_at = models.DateTimeField(_('tamamlanma tarihi'), null=True, blank=True)

    class Meta:
        verbose_name = _('alt görev')
        verbose_name_plural = _('alt görevler')
        ordering = ['created_at']

    def __str__(self):
        return self.title

    def clean(self):
        """
        Özel doğrulama kuralları
        """
        if self.is_completed and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()

class TaskComment(models.Model):
    """
    Görev yorumları
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        verbose_name=_('görev'),
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_('kullanıcı'),
        related_name='task_comments'
    )
    content = models.TextField(_('yorum'))
    created_at = models.DateTimeField(_('oluşturulma tarihi'), auto_now_add=True)
    updated_at = models.DateTimeField(_('güncellenme tarihi'), auto_now=True)
    
    # Yorum için ek dosya
    attachment = models.FileField(
        _('dosya eki'),
        upload_to='task_attachments/',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = _('görev yorumu')
        verbose_name_plural = _('görev yorumları')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
