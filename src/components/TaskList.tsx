import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useTasks } from '../contexts/TaskContext';

// Görev durumuna göre renk belirleme
const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'default';
    case 'inProgress':
      return 'primary';
    case 'done':
      return 'success';
    default:
      return 'default';
  }
};

// Öncelik seviyesine göre renk belirleme
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

const TaskList: React.FC = () => {
  const { tasks, loading, deleteTask } = useTasks();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          Henüz görev bulunmamaktadır.
        </Typography>
      </Box>
    );
  }

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      // TODO: Hata mesajını kullanıcıya göster
    }
  };

  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          divider
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemText
            primary={
              <Typography variant="h6" component="div">
                {task.title}
              </Typography>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {task.description}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    label={task.status}
                    size="small"
                    color={getStatusColor(task.status)}
                  />
                  {task.priority && (
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                  )}
                  {task.dueDate && (
                    <Chip
                      label={new Date(task.dueDate).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="edit"
              sx={{ mr: 1 }}
              // TODO: Edit fonksiyonunu ekle
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDelete(task.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList; 