import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface Task extends DocumentData {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  userId: string;
  createdAt: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

interface TaskProviderProps {
  children: ReactNode;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Kullanıcıya ait görevleri dinle
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Yeni görev ekleme
  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    try {
      console.log('TaskContext: Görev ekleniyor...');
      
      // Status değerini standarize et
      const normalizeStatus = (status: string) => {
        const statusMap: {[key: string]: string} = {
          'todo': 'todo',
          'in-progress': 'in-progress', 
          'completed': 'completed',
          'TODO': 'todo',
          'IN_PROGRESS': 'in-progress',
          'DONE': 'completed',
          'inProgress': 'in-progress',
          'done': 'completed'
        };
        return statusMap[status] || 'todo';
      };
      
      // Firebase timestamp kullan
      const timestamp = new Date().toISOString();
      
      const taskToAdd = {
        ...taskData,
        userId: currentUser?.uid,
        createdAt: timestamp,
        status: normalizeStatus('todo') // Yeni görevler her zaman "todo" olarak başlar
      };
      
      await addDoc(collection(db, 'tasks'), taskToAdd);
      console.log('TaskContext: Görev başarıyla eklendi');
      
      // onSnapshot zaten koleksiyonu dinliyor olduğu için
      // state'i burada manuel güncellememize gerek yok
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // Görev güncelleme
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Görev silme
  const deleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext; 