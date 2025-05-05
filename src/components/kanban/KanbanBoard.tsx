import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Button, 
  IconButton, 
  CircularProgress, 
  useTheme,
  Card,
  CardContent,
  Tooltip,
  Chip,
  alpha,
  Divider,
  Badge,
  Skeleton,
  Avatar,
  Collapse,
  LinearProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  MoreVert as MoreIcon,
  Label as LabelIcon,
  ArrowUpward as HighPriorityIcon,
  Remove as MediumPriorityIcon,
  ArrowDownward as LowPriorityIcon,
  CheckCircleOutline as CheckIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Task tipi tanımlaması
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: any;
  updatedAt: any;
  dueDate: any;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  userId?: string;
}

// Sütunları tanımla
const columns: { id: Task['status'], title: string, icon: JSX.Element, color: string }[] = [
  { id: 'todo', title: 'Yapılacak', icon: <AddIcon />, color: '#4cc9f0' },
  { id: 'in-progress', title: 'Devam Ediyor', icon: <TimeIcon />, color: '#ffd166' },
  { id: 'completed', title: 'Tamamlandı', icon: <CheckIcon />, color: '#06d6a0' }
];

interface KanbanBoardProps {
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  tasks?: Task[];
}

// Animasyon için başlangıç değerlerini hesapla
const getOffset = (index: number) => {
  return {
    x: 0,
    y: index * 10,
  };
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onAddTask, onEditTask, tasks: propTasks }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

  // Firestore'dan görevleri çek
  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks);
      setLoading(false);
      return;
    }
    
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log("Kanban/KanbanBoard.tsx: Firestore dinlemesi başlatılıyor...");
    setLoading(true);
    setError(null);

    try {
      // Firestore sorgusu - basit hale getirildi
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        tasksQuery, 
        (snapshot) => {
          try {
            const fetchedTasks = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Task[];
            
            // Client tarafında daha güvenli sıralama
            const sortedTasks = [...fetchedTasks].sort((a, b) => {
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              
              // Farklı tarih formatlarını kontrol et
              const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                            typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
              
              const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                            typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
              
              return bTime - aTime; // Yeniden eskiye sırala
            });
          
            console.log(`Kanban/KanbanBoard.tsx: ${fetchedTasks.length} görev yüklendi`);
            setTasks(sortedTasks);
            setLoading(false);
          } catch (error) {
            console.error('Görev verileri işlenirken hata:', error);
            setError('Görev verilerini işlerken bir hata oluştu.');
            setLoading(false);
          }
        }, 
        (error) => {
          console.error('Firestore dinleme hatası:', error);
          setError('Görevleri yüklerken bir hata oluştu. Lütfen sayfayı yenileyin.');
          setLoading(false);
        }
      );

      return () => {
        console.log("Kanban/KanbanBoard.tsx: Firestore dinlemesi sonlandırılıyor...");
        unsubscribe();
      };
    } catch (error) {
      console.error('Firestore sorgusu oluşturulurken hata:', error);
      setError('Veritabanı bağlantısında bir sorun oluştu.');
      setLoading(false);
    }
  }, [currentUser, propTasks]);

  // Sürükle bırak işlemi tamamlandığında
  const handleDragEnd = async (result: DropResult) => {
    setDraggingId(null);
    const { destination, source, draggableId } = result;

    // Hedef yoksa (dışarı sürüklenmişse) işlem yapma
    if (!destination) return;

    // Pozisyon değişmemişse işlem yapma
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Firestore'da görev durumunu güncelle
    try {
      const taskRef = doc(db, 'tasks', draggableId);
      await updateDoc(taskRef, {
        status: destination.droppableId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Görev durumu güncellenirken hata oluştu:', error);
    }
  };

  // Drag başladığında
  const handleDragStart = (result: any) => {
    setDraggingId(result.draggableId);
  };

  // Görev düzenleme işlemi
  const handleEditTask = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  // Görev silme işlemi
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (error) {
        console.error('Görev silinirken hata oluştu:', error);
      }
    }
  };

  // Öncelik ikonunu döndür
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <HighPriorityIcon sx={{ color: theme.palette.error.main }} />;
      case 'medium': return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
      case 'low': return <LowPriorityIcon sx={{ color: theme.palette.info.main }} />;
      default: return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
    }
  };

  // Duruma göre renk döndür
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return theme.palette.primary.main;
      case 'in-progress': return theme.palette.warning.main;
      case 'completed': return theme.palette.success.main;
      default: return theme.palette.primary.main;
    }
  };

  // Son tarihi biçimlendir
  const formatDueDate = (dueDate: any) => {
    if (!dueDate) return '';
    
    try {
      let dateObj = dueDate;
      
      // Firestore Timestamp'i varsa
      if (dueDate && dueDate.toDate) {
        dateObj = dueDate.toDate();
      } else if (typeof dueDate === 'string') {
        dateObj = new Date(dueDate);
      }
      
      return dateObj.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Tarih biçimlendirme hatası:', error);
      return 'Geçersiz tarih';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          height: '300px',
        }}
      >
        <CircularProgress size={40} color="primary" />
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Görevler yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 300,
          p: 3,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          borderRadius: 2,
          color: theme.palette.error.main
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Görevler Yüklenemedi
        </Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Sayfayı Yenile
        </Button>
      </Box>
    );
  }

  // Görevleri sütunlara göre filtreleme
  const getTasksByColumn = (columnId: Task['status']) => {
    return tasks.filter(task => {
      // Status kontrolü - hem küçük harf hem büyük harf formatlarını kontrol edelim
      const taskStatus = String(task.status).toLowerCase();
      const columnStatus = String(columnId).toLowerCase();
      
      if (columnStatus === 'todo') {
        return taskStatus === 'todo' || taskStatus === 'yapılacak';
      } else if (columnStatus === 'in-progress') {
        return taskStatus === 'in-progress' || taskStatus === 'in_progress' || taskStatus === 'inprogress';
      } else if (columnStatus === 'completed') {
        return taskStatus === 'completed' || taskStatus === 'done' || taskStatus === 'tamamlandı';
      }
      
      return taskStatus === columnStatus;
    });
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <DragDropContext 
        onDragEnd={handleDragEnd} 
        onDragStart={handleDragStart}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={3} 
          sx={{ 
            height: { md: '100%' },
            overflowX: 'auto',
            pb: { xs: 4, md: 0 },
            mx: -1,
            px: 1
          }}
        >
          {columns.map((column, colIndex) => (
            <Box 
              key={column.id} 
              sx={{ 
                flex: 1, 
                minWidth: { xs: '100%', md: 300 },
                maxWidth: { md: 400 },
                display: 'flex', 
                flexDirection: 'column',
                height: { xs: 'auto', md: '100%' }
              }}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: colIndex * 0.1 }}
            >
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: alpha(column.color, 0.05),
                  border: '1px solid',
                  borderColor: alpha(column.color, 0.1),
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: `0 4px 12px ${alpha(column.color, 0.1)}`
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      mr: 1.5, 
                      bgcolor: column.color,
                      width: 32,
                      height: 32,
                      color: 'white'
                    }}
                  >
                    {column.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" component="span">
                  {column.title}
                    </Typography>
                    <Typography 
                      variant="subtitle2" 
                      component="span" 
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      <Chip
                        label={getTasksByColumn(column.id).length}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          bgcolor: alpha(column.color, 0.1),
                          color: column.color,
                          border: 'none'
                        }}
                      />
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title="Yeni görev ekle">
                  <IconButton 
                    size="small" 
                    onClick={onAddTask}
                    sx={{ 
                      bgcolor: alpha(column.color, 0.1),
                      color: column.color,
                      '&:hover': {
                        bgcolor: alpha(column.color, 0.2)
                      }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Paper
                    {...provided.droppableProps}
                  ref={provided.innerRef}
                    sx={{
                      p: 2,
                      bgcolor: snapshot.isDraggingOver 
                        ? alpha(column.color, 0.05)
                        : alpha(theme.palette.background.paper, 0.7),
                      flexGrow: 1,
                      minHeight: '100px',
                      maxHeight: { md: 'calc(100vh - 220px)' },
                      overflow: 'auto',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: snapshot.isDraggingOver
                        ? column.color
                        : alpha(theme.palette.divider, 0.8),
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: snapshot.isDraggingOver
                        ? `0 4px 20px ${alpha(column.color, 0.2)}`
                        : 'none',
                      '&::-webkit-scrollbar': {
                        width: '6px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(column.color, 0.2),
                        borderRadius: '6px'
                      }
                    }}
                    elevation={0}
                  >
                    {getTasksByColumn(column.id).length === 0 && !snapshot.isDraggingOver && (
                      <Box 
                        sx={{ 
                          py: 4, 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'text.disabled',
                          textAlign: 'center',
                          height: '100%'
                        }}
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Avatar 
                          sx={{ 
                            mb: 2, 
                            bgcolor: alpha(column.color, 0.1),
                            color: column.color
                          }}
                        >
                          {column.icon}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          Bu kolonda henüz görev yok
                        </Typography>
                        <Typography variant="caption" sx={{ maxWidth: '80%', mt: 1 }}>
                          {onAddTask ? 'Yeni bir görev ekle veya başka bir kolondan sürükle' : 'Başka bir kolondan görev sürükle'}
                        </Typography>
                        {onAddTask && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={onAddTask}
                            sx={{ 
                              mt: 2, 
                              borderColor: column.color,
                              color: column.color,
                              '&:hover': {
                                borderColor: column.color,
                                bgcolor: alpha(column.color, 0.05)
                              }
                            }}
                          >
                            Görev Ekle
                          </Button>
                        )}
                      </Box>
                    )}

                    <AnimatePresence>
                      {getTasksByColumn(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              elevation={snapshot.isDragging ? 8 : 0}
                              sx={{
                                mb: 2,
                                borderRadius: '12px',
                                overflow: 'visible',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                border: '1px solid',
                                borderColor: snapshot.isDragging 
                                  ? column.color 
                                  : 'divider',
                                transform: snapshot.isDragging 
                                  ? 'rotate(2deg) scale(1.02)' 
                                  : 'none',
                                zIndex: snapshot.isDragging ? 1 : 'auto',
                                boxShadow: snapshot.isDragging 
                                  ? `0 8px 20px ${alpha(column.color, 0.25)}` 
                                  : 'none',
                                '&:hover': {
                                  borderColor: alpha(column.color, 0.5),
                                  transform: 'translateY(-4px)',
                                  boxShadow: `0 6px 12px ${alpha(column.color, 0.15)}`,
                                  '& .task-actions': {
                                    opacity: 1
                                  }
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  backgroundColor: task.priority === 'high' 
                                    ? theme.palette.error.main 
                                    : task.priority === 'medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.info.main,
                                  borderTopLeftRadius: '12px',
                                  borderBottomLeftRadius: '12px'
                                },
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                backdropFilter: 'blur(8px)'
                              }}
                              component={motion.div}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      {...provided.dragHandleProps}
                                      sx={{ 
                                        mr: 1, 
                                        color: 'text.disabled',
                                        cursor: 'grab',
                                        display: 'flex'
                                      }}
                                    >
                                      <DragIcon fontSize="small" />
                                    </Box>
                                    <Box 
                                      sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column' 
                                      }}
                                    >
                                      <Typography 
                                        variant="subtitle1" 
                                        fontWeight="600"
                                        sx={{ lineHeight: 1.3 }}
                                      >
                                        {task.title}
                                      </Typography>
                                      {task.description && (
                                        <Typography 
                                          variant="body2" 
                                          color="text.secondary" 
                                          sx={{ 
                                            mt: 0.5,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                        >
                                          {task.description}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                  
                                  <Box 
                                    className="task-actions" 
                                    sx={{ 
                                      display: 'flex',
                                      opacity: { xs: 1, md: 0 },
                                      transition: 'opacity 0.2s ease'
                                    }}
                                  >
                                    <Tooltip title="Görevi düzenle">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEditTask(task)}
                                        sx={{ 
                                          mr: 0.5,
                                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                                          color: theme.palette.primary.main,
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.2)
                                          }
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Görevi sil">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteTask(task.id)}
                                        sx={{ 
                                          bgcolor: alpha(theme.palette.error.main, 0.1),
                                          color: theme.palette.error.main,
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.error.main, 0.2)
                                          }
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title={`Öncelik: ${task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}`}>
                                      <Box>
                                        {getPriorityIcon(task.priority)}
                                      </Box>
                                    </Tooltip>
                                    
                                    {task.dueDate && (
                                      <Chip
                                        icon={<TimeIcon fontSize="small" />}
                                        label={formatDueDate(task.dueDate)}
                                        size="small"
                                        sx={{ 
                                          ml: 1,
                                          height: 24,
                                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                                          color: theme.palette.primary.main
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                                
                                {task.tags && task.tags.length > 0 && (
                                  <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {task.tags.map((tag, idx) => (
                                      <Chip
                                        key={idx}
                                        label={tag}
                                        size="small"
                                        sx={{ 
                                          height: 20,
                                          fontSize: '0.65rem',
                                          bgcolor: alpha(column.color, 0.1),
                                          color: column.color
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                      )}
                    </Draggable>
                  ))}
                    </AnimatePresence>
                  {provided.placeholder}
                  </Paper>
              )}
            </Droppable>
            </Box>
        ))}
        </Stack>
    </DragDropContext>
    </Box>
  );
};

export default KanbanBoard; 