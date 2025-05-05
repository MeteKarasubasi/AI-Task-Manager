export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface TaskComment {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
} 