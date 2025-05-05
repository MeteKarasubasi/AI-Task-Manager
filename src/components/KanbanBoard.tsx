import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha, Box, Button, Typography, Paper, Chip, IconButton, Tooltip, CircularProgress, useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowUp as HighPriorityIcon,
  Remove as MediumPriorityIcon,
  KeyboardArrowDown as LowPriorityIcon,
  DragIndicator as DragIcon,
  AccessTime as TimeIcon,
  Label as TagIcon,
  Flare as AIIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Kolon başlıkları ve stillerini tanımla
const COLUMN_TITLES = {
  todo: { title: 'Yapılacak', icon: <AddIcon />, color: '#3a86ff' },
  'in-progress': { title: 'Devam Ediyor', icon: <TimeIcon />, color: '#ffbe0b' },
  completed: { title: 'Tamamlandı', icon: <CheckIcon />, color: '#06d6a0' }
};

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | string;
  tags?: string[];
  userId: string;
  isAIGenerated?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface KanbanBoardProps {
  tasks?: Task[];
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onAddTask?: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks: propTasks, 
  onTaskMove, 
  onDeleteTask, 
  onEditTask, 
  onAddTask 
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Firestore'dan görevleri çek (eğer prop olarak gelmezse)
  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks);
      setLoading(false);
      return;
    }

    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log("Firestore görev dinlemesi başlatılıyor - KanbanBoard...");
    setLoading(true);

    try {
      // Basitleştirilmiş Firestore sorgusu - sadece userId filtresi kullan
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );

      // Gerçek zamanlı dinleyici oluştur ve dön
      const unsubscribe = onSnapshot(
        tasksQuery, 
        (snapshot) => {
          try {
            const fetchedTasks = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Task[];
            
            // Client tarafında sırala
            const sortedTasks = [...fetchedTasks].sort((a, b) => {
              // createdAt kontrolü
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              
              // Firestore timestamp
              const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                            typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
              
              const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                            typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
              
              return bTime - aTime; // Descending order
            });
            
            console.log(`${fetchedTasks.length} görev yüklendi`);
            setTasks(sortedTasks);
            setLoading(false);
          } catch (error) {
            console.error('Görev verileri işlenirken hata:', error);
            setLoading(false);
          }
        }, 
        (error) => {
          console.error('Firestore dinleme hatası:', error);
          setError('Görevleri yüklerken bir hata oluştu. Lütfen sayfayı yenileyin.');
          setLoading(false);
        }
      );

      // Temizleme işlevi
      return () => {
        console.log("Firestore görev dinlemesi sonlandırılıyor...");
        unsubscribe();
      };
    } catch (error) {
      console.error('Firestore sorgusu oluşturulurken hata:', error);
      setLoading(false);
    }
  }, [user, propTasks]);

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

  // Görevleri durumlara göre grupla
  const columns = {
    todo: getTasksByColumn('todo'),
    'in-progress': getTasksByColumn('in-progress'),
    completed: getTasksByColumn('completed')
  };

  // Sürükle-bırak işlemi tamamlandığında
  const handleDragEnd = (result: any) => {
    setDraggingId(null);
    const { destination, source, draggableId } = result;

    // Geçersiz bırakma noktası
    if (!destination) return;

    // Aynı yere bırakıldı
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Prop olarak gelen onTaskMove fonksiyonu varsa kullan
    if (onTaskMove) {
      onTaskMove(draggableId, destination.droppableId);
      return;
    }

    // Yoksa doğrudan Firestore'u güncelle (bağımsız bileşen olarak kullanıldığında)
    try {
      const taskRef = doc(db, 'tasks', draggableId);
      updateDoc(taskRef, {
        status: destination.droppableId,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Görev durumu güncellenirken hata oluştu:', error);
    }
  };
  
  // Drag başladığında
  const handleDragStart = (result: any) => {
    setDraggingId(result.draggableId);
  };

  // Görev düzenleme
  const handleEditTask = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  // Görev silme
  const handleDeleteTask = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
      return;
    }

    // Direkt silme (bağımsız bileşen olarak kullanıldığında)
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        deleteDoc(taskRef);
      } catch (error) {
        console.error('Görev silinirken hata oluştu:', error);
      }
    }
  };
  
  // Öncelik ikonunu ve rengini belirle
  const getPriorityDetails = (priority: string) => {
    switch (priority) {
      case 'high':
        return { icon: <HighPriorityIcon sx={{ color: theme.palette.error.main }} />, color: theme.palette.error.main };
      case 'medium':
        return { icon: <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />, color: theme.palette.warning.main };
      case 'low':
        return { icon: <LowPriorityIcon sx={{ color: theme.palette.info.main }} />, color: theme.palette.info.main };
      default:
        return { icon: <LowPriorityIcon sx={{ color: theme.palette.info.main }} />, color: theme.palette.info.main };
    }
  };

  // Tarih formatını düzenle
  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    
    try {
      // Tarih Firestore'dan geliyor olabilir
      if (dateObj.toDate) {
        dateObj = dateObj.toDate();
      } else if (typeof dateObj === 'string') {
        dateObj = new Date(dateObj);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress size={40} />
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
          bgcolor: 'error.light',
          borderRadius: 2,
          color: 'error.contrastText'
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

  return (
    <Box className="kanban-container" sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 3,
          alignItems: 'center'
        }}
      >
        <Typography 
          variant="h5" 
          component={motion.h2}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #3a86ff, #4cc9f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'  
          }}
        >
          Kanban Tahtası
        </Typography>
        
        {onAddTask && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddTask}
            component={motion.button}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ 
              borderRadius: 3,
              py: 1.5,
              px: 3,
              boxShadow: '0 6px 20px rgba(58, 134, 255, 0.25)',
              background: 'linear-gradient(45deg, #3a86ff 30%, #4cc9f0 90%)',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(58, 134, 255, 0.35)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s'
            }}
          >
            Yeni Görev
          </Button>
        )}
      </Box>

      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 3,
          }}
        >
          {Object.keys(columns).map((columnId, index) => (
            <motion.div
              key={columnId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {renderColumn(columnId, columns[columnId as keyof typeof columns])}
            </motion.div>
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
};

// JSX için kolon renderı
const renderColumn = (columnId: string, tasks: Task[]) => {
  const columnInfo = COLUMN_TITLES[columnId as keyof typeof COLUMN_TITLES];
  
  return (
    <Droppable droppableId={columnId} key={columnId}>
      {(provided, snapshot) => (
        <Paper
          elevation={0}
          {...provided.droppableProps}
          ref={provided.innerRef}
          sx={{
            minHeight: 500,
            height: '100%',
            width: '100%',
            backgroundColor: snapshot.isDraggingOver
              ? alpha(columnInfo.color, 0.05)
              : 'background.paper',
            borderRadius: 2,
            borderTop: `4px solid ${columnInfo.color}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Kolon başlığı */}
          <Box sx={{ p: 2, 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  backgroundColor: alpha(columnInfo.color, 0.2),
                  color: columnInfo.color,
                  p: 0.5,
                  borderRadius: 1,
                  mr: 1,
                  display: 'flex'
                }}
              >
                {columnInfo.icon}
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {columnInfo.title} ({tasks.length})
              </Typography>
            </Box>
            
            {columnId === 'todo' && (
              <Tooltip title="Yeni Görev Ekle">
                <IconButton 
                  size="small" 
                  onClick={onAddTask}
                  sx={{ 
                    color: columnInfo.color,
                    '&:hover': { backgroundColor: alpha(columnInfo.color, 0.1) }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {/* Görev kartları */}
          <Box sx={{ p: 1.5, flexGrow: 1, overflowY: 'auto' }}>
            <AnimatePresence>
              {tasks.length === 0 ? (
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ opacity: 0.7, fontStyle: 'italic', mb: 1 }}
                  >
                    Bu sütunda hiç görev yok.
                  </Typography>
                  {columnId === 'todo' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={onAddTask}
                      sx={{ color: columnInfo.color, borderColor: columnInfo.color }}
                    >
                      Yeni Görev Ekle
                    </Button>
                  )}
                  {columnId !== 'todo' && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ opacity: 0.7, fontSize: '0.75rem' }}
                    >
                      {columnId === 'in-progress' 
                        ? 'Bir görevi "Yapılacak" sütunundan sürükleyip buraya bırakın' 
                        : 'Bir görevi "Devam Ediyor" sütunundan sürükleyip buraya bırakın'}
                    </Typography>
                  )}
                </Box>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => renderTaskCard(provided, snapshot, task)}
                  </Draggable>
                ))
              )}
            </AnimatePresence>
            {provided.placeholder}
          </Box>
        </Paper>
      )}
    </Droppable>
  );
};

// Task kartını render etme
const renderTaskCard = (provided: any, snapshot: any, task: Task) => {
  const getPriorityIcon = (priority: string | undefined) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <HighPriorityIcon sx={{ color: theme.palette.error.main }} />;
      case 'medium':
        return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
      case 'low':
        return <LowPriorityIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
    }
  };

  return (
    <motion.div
      ref={provided.innerRef}
      {...provided.draggableProps}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      style={{
        ...provided.draggableProps.style,
        marginBottom: 16
      }}
    >
      <Paper 
        elevation={snapshot.isDragging ? 8 : 0}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: snapshot.isDragging 
            ? alpha('#ffffff', 0.95) 
            : alpha('#ffffff', 0.8),
          border: '1px solid',
          borderColor: draggingId === task.id 
            ? theme.palette.primary.main 
            : alpha('#ffffff', 0.7),
          boxShadow: snapshot.isDragging
            ? `0 16px 32px ${alpha(theme.palette.primary.main, 0.2)}`
            : `0 4px 12px ${alpha('#000000', 0.06)}`,
          transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            transform: 'translateY(-4px)',
          }
        }}
      >
        {/* Kart başlığı ve sürükleme kolu */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            pb: 1,
            borderBottom: task.description ? `1px dashed ${alpha('#000000', 0.1)}` : 'none'
          }}
        >
          <Box {...provided.dragHandleProps} sx={{ mr: 1, opacity: 0.4, cursor: 'grab' }}>
            <DragIcon fontSize="small" />
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {task.title}
          </Typography>
          {task.isAIGenerated && (
            <Tooltip title="AI tarafından önerildi">
              <Box sx={{ display: 'flex', ml: 1 }}>
                <AIIcon fontSize="small" color="secondary" />
              </Box>
            </Tooltip>
          )}
          {getPriorityIcon(task.priority)}
        </Box>

        {/* Açıklama */}
        {task.description && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {task.description}
            </Typography>
          </Box>
        )}

        {/* Alt bilgi alanı ve etiketler */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 2, 
            py: 1.5,
            borderTop: `1px dashed ${alpha('#000000', 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {task.dueDate && (
              <Tooltip title="Son Tarih">
                <Chip
                  icon={<TimeIcon fontSize="small" />}
                  label={formatDate(task.dueDate)}
                  size="small"
                  sx={{ 
                    mr: 1, 
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.dark,
                    fontWeight: 500,
                    borderRadius: 1,
                    '& .MuiChip-icon': {
                      color: theme.palette.info.main
                    }
                  }}
                />
              </Tooltip>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <Tooltip title={task.tags.join(', ')}>
                <Chip
                  icon={<TagIcon fontSize="small" />}
                  label={`${task.tags.length} etiket`}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.dark,
                    fontWeight: 500,
                    borderRadius: 1,
                    '& .MuiChip-icon': {
                      color: theme.palette.secondary.main
                    }
                  }}
                />
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Düzenle">
              <IconButton
                size="small"
                onClick={() => handleEditTask(task)}
                sx={{ 
                  mr: 0.5,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Sil">
              <IconButton
                size="small"
                onClick={() => handleDeleteTask(task.id)}
                sx={{ 
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default KanbanBoard; 