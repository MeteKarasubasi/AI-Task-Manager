from django.contrib import admin
from .models import (
    Project, ProjectMember, ProjectCategory, 
    ProjectDocument, ProjectNote, KanbanBoard, KanbanColumn
)


class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 0


class ProjectDocumentInline(admin.TabularInline):
    model = ProjectDocument
    extra = 0


class ProjectNoteInline(admin.TabularInline):
    model = ProjectNote
    extra = 0


class KanbanColumnInline(admin.TabularInline):
    model = KanbanColumn
    extra = 0


@admin.register(KanbanBoard)
class KanbanBoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'created_at')
    search_fields = ('name', 'project__name')
    inlines = [KanbanColumnInline]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'creator', 'start_date', 'end_date', 'created_at')
    list_filter = ('status', 'created_at', 'start_date', 'end_date', 'is_public')
    search_fields = ('name', 'description', 'creator__email')
    date_hierarchy = 'created_at'
    inlines = [ProjectMemberInline, ProjectDocumentInline, ProjectNoteInline]
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'status')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'start_date', 'end_date', 'next_meeting_date')
        }),
        ('Creator', {
            'fields': ('creator',)
        }),
        ('Attributes', {
            'fields': ('color', 'icon', 'is_public')
        }),
        ('AI Integration', {
            'fields': ('ai_generated_summary',)
        }),
    )


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('user__email', 'project__name')
    readonly_fields = ('joined_at',)


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')
    search_fields = ('name', 'description')


@admin.register(ProjectDocument)
class ProjectDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('title', 'description', 'project__name', 'uploaded_by__email')
    readonly_fields = ('uploaded_at',)


@admin.register(ProjectNote)
class ProjectNoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'created_by', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'content', 'project__name', 'created_by__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(KanbanColumn)
class KanbanColumnAdmin(admin.ModelAdmin):
    list_display = ('name', 'board', 'order', 'color')
    list_filter = ('board__project__name',)
    search_fields = ('name', 'board__name', 'board__project__name')
    ordering = ('board', 'order')
