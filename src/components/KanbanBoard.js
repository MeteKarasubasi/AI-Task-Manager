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
  Label as TagIcon
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const COLUMN_TITLES = {
  todo: { title: 'Yapılacak', icon: <AddIcon />, color: '#4cc9f0' },
  'in-progress': { title: 'Devam Ediyor', icon: <TimeIcon />, color: '#ffd166' },
  completed: { title: 'Tamamlandı', icon: <AddIcon />, color: '#06d6a0' }
};

function KanbanBoard({ tasks: propTasks, onTaskMove, onDeleteTask, onEditTask, onAddTask }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // Firestore'dan görevleri çek (eğer prop olarak gelmezse)
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

    console.log("KanbanBoard.js: Firestore görev dinlemesi başlatılıyor...");
    setLoading(true);
    setError(null);

    try {
      // Basitleştirilmiş sorgu
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
            }));
            
            // Client tarafında daha sağlam sıralama
            const sortedTasks = [...fetchedTasks].sort((a, b) => {
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              
              // Farklı tarih formatlarını kontrol et
              const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                            typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
              
              const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                            typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
              
              return bTime - aTime; // Yeniden eskiye
            });
            
            console.log(`KanbanBoard.js: ${sortedTasks.length} görev yüklendi`);
            setTasks(sortedTasks);
            setLoading(false);
            setError(null);
          } catch (error) {
            console.error('KanbanBoard.js: Görev verileri işlenirken hata:', error);
            setError('Görev verilerini işlerken bir hata oluştu.');
            setLoading(false);
          }
        }, 
        (error) => {
          console.error('KanbanBoard.js: Firestore dinleme hatası:', error);
          setError('Görevleri yüklerken bir hata oluştu. Lütfen sayfayı yenileyin.');
          setLoading(false);
        }
      );

      return () => {
        console.log("KanbanBoard.js: Firestore görev dinlemesi sonlandırılıyor...");
        unsubscribe();
      };
    } catch (error) {
      console.error('KanbanBoard.js: Firestore sorgusu oluşturulurken hata:', error);
      setError('Veritabanı bağlantısında bir sorun oluştu.');
      setLoading(false);
    }
  }, [currentUser, propTasks]);

  // Görevleri sütunlara göre filtreleme
  const getTasksByColumn = (columnId) => {
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
  const handleDragEnd = (result) => {
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
  const handleDragStart = (result) => {
    setDraggingId(result.draggableId);
  };

  // Görev düzenleme
  const handleEditTask = (task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  // Görev silme
  const handleDeleteTask = (taskId) => {
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
  const getPriorityDetails = (priority) => {
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
  const formatDate = (dateObj) => {
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
          bgcolor: alpha(theme.palette.error.main, 0.1),
          borderRadius: 2,
          border: `1px solid ${theme.palette.error.main}`,
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
          sx={{ fontWeight: 'bold' }}
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
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(67, 97, 238, 0.2)',
              background: 'linear-gradient(45deg, #4361ee 30%, #4895ef 90%)'
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
            gap: 2.5,
          }}
        >
          {Object.keys(columns).map((columnId, index) => (
            <motion.div
            key={columnId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha(COLUMN_TITLES[columnId].color, 0.3),
                  boxShadow: `0 4px 20px ${alpha(COLUMN_TITLES[columnId].color, 0.1)}`
                }}
              >
                <Box 
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(COLUMN_TITLES[columnId].color, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
          >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 26, 
                        height: 26, 
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                        color: 'white',
                        bgcolor: COLUMN_TITLES[columnId].color
                      }}
                    >
                      {COLUMN_TITLES[columnId].icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {COLUMN_TITLES[columnId].title}
                    </Typography>
                    <Chip 
                      label={columns[columnId].length} 
                      size="small"
                      sx={{ 
                        ml: 1,
                        bgcolor: alpha(COLUMN_TITLES[columnId].color, 0.15),
                        border: 'none',
                        color: COLUMN_TITLES[columnId].color,
                        fontWeight: 'bold',
                        minWidth: 24,
                        height: 24
                      }}
                    />
                  </Box>
                  
                  {onAddTask && (
                    <Tooltip title="Yeni görev ekle">
                      <IconButton 
                        size="small" 
                        onClick={onAddTask}
                        sx={{ 
                          bgcolor: alpha(COLUMN_TITLES[columnId].color, 0.1),
                          '&:hover': { bgcolor: alpha(COLUMN_TITLES[columnId].color, 0.2) },
                          color: COLUMN_TITLES[columnId].color
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                    <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                      sx={{
                        flex: 1,
                        minHeight: 300,
                        p: 1.5,
                        bgcolor: snapshot.isDraggingOver 
                          ? alpha(COLUMN_TITLES[columnId].color, 0.05)
                          : 'background.paper',
                        transition: 'background-color 0.2s ease',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: alpha(COLUMN_TITLES[columnId].color, 0.2),
                          borderRadius: '6px',
                        }
                      }}
                    >
                      <AnimatePresence>
                        {columns[columnId].length === 0 && !snapshot.isDraggingOver && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            exit={{ opacity: 0 }}
                          >
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 150,
                                px: 2,
                                py: 4,
                                color: 'text.disabled',
                                textAlign: 'center'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 2,
                                  bgcolor: alpha(COLUMN_TITLES[columnId].color, 0.1),
                                  color: COLUMN_TITLES[columnId].color
                                }}
                >
                                {COLUMN_TITLES[columnId].icon}
                              </Box>
                              <Typography variant="body2" fontWeight={500}>
                                Bu kolonda görev bulunmuyor
                              </Typography>
                              <Typography variant="caption" sx={{ maxWidth: '80%', mt: 1 }}>
                                Bir görev sürükleyip bırakın veya yeni bir görev ekleyin
                              </Typography>
                            </Box>
                          </motion.div>
                        )}
                        
                  {columns[columnId].map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                                  elevation={snapshot.isDragging ? 4 : 0}
                                  sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: snapshot.isDragging 
                                      ? COLUMN_TITLES[columnId].color 
                                      : 'divider',
                                    boxShadow: snapshot.isDragging 
                                      ? `0 8px 16px ${alpha(COLUMN_TITLES[columnId].color, 0.2)}` 
                                      : 'none',
                                    transform: snapshot.isDragging ? 'rotate(1deg)' : 'none',
                                    zIndex: snapshot.isDragging ? 1 : 'auto',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      borderColor: COLUMN_TITLES[columnId].color,
                                      transform: 'translateY(-3px)',
                                      boxShadow: `0 6px 12px ${alpha(COLUMN_TITLES[columnId].color, 0.15)}`
                                    },
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '4px',
                                      height: '100%',
                                      backgroundColor: getPriorityDetails(task.priority).color
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box
                          {...provided.dragHandleProps}
                                        sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          mr: 1, 
                                          color: 'text.disabled',
                                          '&:hover': { color: 'text.secondary' },
                                          cursor: 'grab'
                                        }}
                                      >
                                        <DragIcon fontSize="small" />
                                      </Box>
                                      <Tooltip title={`Öncelik: ${task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}`}>
                                        <Box>
                                          {getPriorityDetails(task.priority).icon}
                                        </Box>
                                      </Tooltip>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex' }}>
                                      <Tooltip title="Görevi düzenle">
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleEditTask(task)}
                                          sx={{ 
                                            mr: 0.5, 
                                            color: 'primary.main',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
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
                                            color: 'error.main',
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                  
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                {task.title}
                                  </Typography>
                                  
                              {task.description && (
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ 
                                        mb: 1.5,
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
                                  
                                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {task.dueDate && (
                                      <Box
                                        component={Chip}
                                        icon={<TimeIcon style={{ fontSize: '0.875rem' }} />}
                                        label={formatDate(task.dueDate)}
                                        size="small"
                                        sx={{ 
                                          height: 24, 
                                          fontSize: '0.75rem',
                                          bgcolor: theme.palette.grey[50],
                                          borderColor: theme.palette.grey[200],
                                          '& .MuiChip-label': { px: 1 },
                                          '& .MuiChip-icon': { ml: 0.5 }
                                        }}
                                        variant="outlined"
                                />
                                    )}
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
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            '& .MuiChip-label': { px: 1 }
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Paper>
                              </motion.div>
                      )}
                    </Draggable>
                  ))}
                      </AnimatePresence>
                  {provided.placeholder}
                    </Box>
              )}
            </Droppable>
              </Paper>
            </motion.div>
        ))}
        </Box>
    </DragDropContext>
    </Box>
  );
}

export default KanbanBoard; 