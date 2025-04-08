from django.db import models
from django.utils import timezone
from users.models import CustomUser


class Project(models.Model):
    """
    Project model for grouping related tasks
    """
    class Status(models.TextChoices):
        PLANNING = 'planning', 'Planning'
        ACTIVE = 'active', 'Active'
        ON_HOLD = 'on_hold', 'On Hold'
        COMPLETED = 'completed', 'Completed'
        ARCHIVED = 'archived', 'Archived'
    
    # Project information
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    
    # Project dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Project relationships
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_projects')
    members = models.ManyToManyField(CustomUser, through='ProjectMember', related_name='projects')
    
    # Project attributes
    color = models.CharField(max_length=7, default="#3498db")  # Hex color code
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_public = models.BooleanField(default=False)
    
    # Dates for reminders and dashboard
    next_meeting_date = models.DateTimeField(null=True, blank=True)
    
    # For AI integration
    ai_generated_summary = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['creator']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def is_overdue(self):
        if self.end_date and self.status not in [self.Status.COMPLETED, self.Status.ARCHIVED]:
            return self.end_date < timezone.now().date()
        return False
    
    @property
    def progress_percentage(self):
        tasks = self.tasks.all()
        if not tasks:
            return 0
        completed_tasks = self.tasks.filter(status='done').count()
        return int((completed_tasks / tasks.count()) * 100)


class ProjectMember(models.Model):
    """
    Through model for project members with roles
    """
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'
        VIEWER = 'viewer', 'Viewer'
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('project', 'user')
    
    def __str__(self):
        return f"{self.user.email} as {self.get_role_display()} in {self.project.name}"


class ProjectCategory(models.Model):
    """
    Categories for organizing projects
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#3498db")  # Hex color code
    
    class Meta:
        verbose_name_plural = "Project Categories"
    
    def __str__(self):
        return self.name


class ProjectDocument(models.Model):
    """
    Documents associated with a project
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='project_documents/')
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class ProjectNote(models.Model):
    """
    Project notes and documentation
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title


class KanbanBoard(models.Model):
    """
    Kanban board model for project visualization
    """
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='kanban_board')
    name = models.CharField(max_length=255, default="Kanban Board")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Kanban Board for {self.project.name}"


class KanbanColumn(models.Model):
    """
    Columns for the Kanban board
    """
    board = models.ForeignKey(KanbanBoard, on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=7, default="#3498db")  # Hex color code
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name
