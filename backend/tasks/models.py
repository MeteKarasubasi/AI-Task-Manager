from django.db import models
from django.utils import timezone
from users.models import CustomUser


class Task(models.Model):
    """
    Task model for storing task information
    """
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    class Status(models.TextChoices):
        TODO = 'todo', 'To Do'
        IN_PROGRESS = 'in_progress', 'In Progress'
        REVIEW = 'review', 'Review'
        DONE = 'done', 'Done'
    
    # Task basic information
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Task status and metadata
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    # Task dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    # Task relationships
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')
    
    # Task attributes
    estimated_hours = models.FloatField(null=True, blank=True)
    tags = models.ManyToManyField('TaskTag', blank=True, related_name='tasks')
    is_recurring = models.BooleanField(default=False)
    
    # For AI integration
    ai_suggested = models.BooleanField(default=False)
    ai_summary = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['due_date']),
            models.Index(fields=['creator']),
            models.Index(fields=['assigned_to']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_overdue(self):
        if self.due_date and self.status != self.Status.DONE:
            return self.due_date < timezone.now()
        return False
    
    @property
    def days_until_due(self):
        if self.due_date:
            delta = self.due_date - timezone.now()
            return max(0, delta.days)
        return None


class TaskTag(models.Model):
    """
    Tags for categorizing tasks
    """
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default="#3498db")  # Hex color code
    
    def __str__(self):
        return self.name


class TaskComment(models.Model):
    """
    Comments on tasks
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.task.title}"


class TaskAttachment(models.Model):
    """
    Attachments for tasks
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/')
    name = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class RecurringTaskPattern(models.Model):
    """
    Pattern for recurring tasks
    """
    class RecurrenceType(models.TextChoices):
        DAILY = 'daily', 'Daily'
        WEEKLY = 'weekly', 'Weekly'
        MONTHLY = 'monthly', 'Monthly'
        YEARLY = 'yearly', 'Yearly'
    
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='recurrence_pattern')
    recurrence_type = models.CharField(max_length=20, choices=RecurrenceType.choices)
    interval = models.PositiveIntegerField(default=1)  # Every X days/weeks/months/years
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # For weekly recurrence
    monday = models.BooleanField(default=False)
    tuesday = models.BooleanField(default=False)
    wednesday = models.BooleanField(default=False)
    thursday = models.BooleanField(default=False)
    friday = models.BooleanField(default=False)
    saturday = models.BooleanField(default=False)
    sunday = models.BooleanField(default=False)
    
    # For monthly recurrence
    day_of_month = models.PositiveIntegerField(null=True, blank=True)  # E.g., 15th of each month
    
    def __str__(self):
        return f"Recurrence for {self.task.title}"
