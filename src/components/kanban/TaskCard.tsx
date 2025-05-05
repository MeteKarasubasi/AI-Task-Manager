import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  ChatAltIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/outline';
import { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer border border-gray-100"
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
            {task.title}
          </h4>
        </div>
        <span
          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
            priorityColors[task.priority as keyof typeof priorityColors]
          }`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Comments Count */}
          {task.commentsCount > 0 && (
            <div className="flex items-center">
              <ChatAltIcon className="w-4 h-4 mr-1" />
              <span>{task.commentsCount}</span>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center">
              <TagIcon className="w-4 h-4 mr-1" />
              <span>{task.tags.length}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center">
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Progress Bar (if applicable) */}
      {task.progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard; 