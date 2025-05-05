from django.contrib import admin
from .models import Task, TaskTag, TaskComment, TaskAttachment, RecurringTaskPattern


class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0


class TaskAttachmentInline(admin.TabularInline):
    model = TaskAttachment
    extra = 0


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'creator', 'assigned_to', 'due_date', 'is_recurring')
    list_filter = ('status', 'priority', 'is_recurring', 'created_at')
    search_fields = ('title', 'description', 'creator__email', 'assigned_to__email')
    date_hierarchy = 'created_at'
    inlines = [TaskCommentInline, TaskAttachmentInline]
    filter_horizontal = ('tags',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'description')
        }),
        ('Status', {
            'fields': ('status', 'priority')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'due_date')
        }),
        ('People', {
            'fields': ('creator', 'assigned_to')
        }),
        ('Relationships', {
            'fields': ('project', 'parent_task', 'tags')
        }),
        ('Additional Info', {
            'fields': ('estimated_hours', 'is_recurring', 'ai_suggested', 'ai_summary')
        }),
    )


@admin.register(TaskTag)
class TaskTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')
    search_fields = ('name',)


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('task__title', 'user__email', 'content')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'task', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('name', 'task__title', 'uploaded_by__email')
    readonly_fields = ('uploaded_at',)


@admin.register(RecurringTaskPattern)
class RecurringTaskPatternAdmin(admin.ModelAdmin):
    list_display = ('task', 'recurrence_type', 'interval', 'start_date', 'end_date')
    list_filter = ('recurrence_type', 'start_date')
    search_fields = ('task__title',)
    fieldsets = (
        (None, {
            'fields': ('task', 'recurrence_type', 'interval', 'start_date', 'end_date')
        }),
        ('Weekly Options', {
            'fields': ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
            'classes': ('collapse',)
        }),
        ('Monthly Options', {
            'fields': ('day_of_month',),
            'classes': ('collapse',)
        }),
    )
