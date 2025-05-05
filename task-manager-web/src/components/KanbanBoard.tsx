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
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Task tipi tanımlaması
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: any;
  updatedAt: any;
  dueDate: any;
  priority: number;
  tags: string[];
}

// Sütunları tanımla
const columns: { id: Task['status'], title: string, icon: JSX.Element }[] = [
  { id: 'TODO', title: 'Yapılacak', icon: <AddIcon /> },
  { id: 'IN_PROGRESS', title: 'Devam Ediyor', icon: <TimeIcon /> },
  { id: 'DONE', title: 'Tamamlandı', icon: <CheckIcon /> }
];

interface KanbanBoardProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

// Animasyon için başlangıç değerlerini hesapla
const getOffset = (index: number) => {
  return index * 10;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onAddTask, onEditTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const theme = useTheme();

  // Firestore'dan görevleri çek
  useEffect(() => {
    if (!currentUser) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
      // orderBy('createdAt', 'desc') - Bu satır indeks gerektiriyor
      // Bu indeksi oluşturmak için Firebase konsoluna gidin:
      // https://console.firebase.google.com/v1/r/project/ai-task-manager-6b4fb/firestore/indexes?create_composite=ClNwcm9qZWN0cy9haS10YXNrLW1hbmFnZXItNmI0ZmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Rhc2tzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      
      // Client tarafında sıralama yapalım
      const sortedTasks = [...fetchedTasks].sort((a, b) => {
        // createdAt alanını kontrol edelim
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        
        // Firestore timestamp, Date veya string olabilir
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                     typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 
                     a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                     typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 
                     b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        
        return bTime - aTime; // Azalan sıralama (en yeni en üstte)
      });
      
      setTasks(sortedTasks);
      setLoading(false);
    }, (error) => {
      console.error('Görevler çekilirken hata oluştu:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

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
    if (destination.droppableId !== source.droppableId) {
      try {
        const taskRef = doc(db, 'tasks', draggableId);
        await updateDoc(taskRef, {
          status: destination.droppableId,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Görev durumu güncellenirken hata oluştu:', error);
      }
    }
  };

  // Drag başladığında
  const handleDragStart = (result: any) => {
    setDraggingId(result.draggableId);
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
  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 0: return <LowPriorityIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
      case 1: return <MediumPriorityIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 2: return <HighPriorityIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      default: return <LowPriorityIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Duruma göre renk döndür
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'TODO': return theme.palette.info.main;
      case 'IN_PROGRESS': return theme.palette.warning.main;
      case 'DONE': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  // Son tarihi biçimlendir
  const formatDueDate = (dueDate: any) => {
    if (!dueDate) return '';
    
    try {
      // Eğer Firestore timestamp ise
      if (dueDate.toDate) {
        return format(dueDate.toDate(), 'dd/MM/yyyy HH:mm');
      }
      // ISO string veya benzeri bir şey ise
      return format(new Date(dueDate), 'dd/MM/yyyy HH:mm');
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
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Görevler yükleniyor...
        </Typography>
      </Box>
    );
  }

  // Görevleri sütunlara göre filtreleme
  const getTasksByColumn = (columnId: Task['status']) => {
    return tasks.filter(task => task.status === columnId);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2 
        }}
      >
        <Typography 
          variant="h5" 
          component="h1" 
          fontWeight="bold"
          sx={{ 
            color: 'text.primary',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '40%',
              height: '4px',
              bottom: '-8px',
              left: '0',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '2px'
            }
          }}
        >
          Görevlerim
        </Typography>

        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onAddTask}
          sx={{
            borderRadius: '8px',
            boxShadow: theme.shadows[2]
          }}
        >
          Yeni Görev
        </Button>
      </Box>

      <DragDropContext 
        onDragEnd={handleDragEnd} 
        onDragStart={handleDragStart}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={3} 
          sx={{ 
            height: { md: 'calc(100vh - 200px)', xs: 'auto' },
            mb: { xs: 4, md: 0 }
          }}
        >
          {columns.map((column, colIndex) => (
            <Box 
              key={column.id} 
              sx={{ 
                flex: 1, 
                minWidth: { xs: '100%', md: '33%' },
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
                  bgcolor: alpha(getStatusColor(column.id), 0.1),
                  border: '1px solid',
                  borderColor: alpha(getStatusColor(column.id), 0.2),
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      mr: 1.5, 
                      bgcolor: getStatusColor(column.id),
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  >
                    {column.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" component="span">
                      {column.title}
                    </Typography>
                    <Typography 
                      variant="subtitle2" 
                      component="span" 
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      ({getTasksByColumn(column.id).length})
                </Typography>
                  </Box>
                </Box>
                <Tooltip title="Yeni görev ekle">
                  <IconButton 
                    size="small" 
                    onClick={onAddTask}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: alpha(getStatusColor(column.id), 0.1)
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
                        ? alpha(getStatusColor(column.id), 0.05)
                        : 'background.paper',
                      flexGrow: 1,
                      minHeight: '100px',
                      maxHeight: { md: 'calc(100vh - 250px)' },
                      overflow: 'auto',
                      borderRadius: '12px',
                      border: '1px dashed',
                      borderColor: snapshot.isDraggingOver
                        ? getStatusColor(column.id)
                        : 'divider',
                      transition: 'all 0.2s ease'
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
                          color: 'text.secondary',
                          textAlign: 'center'
                        }}
                      >
                        <Box 
                          sx={{ 
                            mb: 2, 
                            p: 1,
                            borderRadius: '50%',
                            bgcolor: alpha(getStatusColor(column.id), 0.1) 
                          }}
                        >
                          {column.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          Bu kolonda henüz görev yok
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 0.5, maxWidth: '80%' }}>
                          Bir görev sürükleyip bırakın veya yeni bir görev ekleyin
                        </Typography>
                      </Box>
                    )}

                    {getTasksByColumn(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            elevation={snapshot.isDragging ? 4 : 0}
                            sx={{
                              mb: 2,
                              borderRadius: '10px',
                              overflow: 'visible',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              border: '1px solid',
                              borderColor: 'divider',
                              transform: 'translate3d(0, 0, 0)', // Fix for Safari
                              ...(snapshot.isDragging && {
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  zIndex: -1,
                                  borderRadius: '10px',
                                  bgcolor: 'background.paper',
                                  boxShadow: theme.shadows[6]
                                }
                              }),
                              '&:hover': {
                                boxShadow: theme.shadows[2],
                                borderColor: alpha(getStatusColor(column.id), 0.4)
                              }
                            }}
                            component={motion.div}
                            initial={{ opacity: 0, x: getOffset(index), y: getOffset(index) }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            {/* Öncelik göstergesi */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                bgcolor: task.priority === 2 
                                  ? theme.palette.error.main 
                                  : task.priority === 1 
                                    ? theme.palette.warning.main 
                                    : theme.palette.info.main,
                                borderTopLeftRadius: '10px',
                                borderBottomLeftRadius: '10px'
                              }}
                            />
                            
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Tooltip title="Görevi sürükle">
                                    <Box
                                      {...provided.dragHandleProps}
                                        sx={{ 
                                        display: 'flex', 
                                        mr: 1, 
                                        cursor: 'grab',
                                        color: 'text.disabled',
                                        '&:hover': { color: 'text.secondary' }
                                      }}
                                    >
                                      <DragIcon fontSize="small" />
                                      </Box>
                                  </Tooltip>
                                  <Tooltip title={
                                    task.priority === 2 
                                      ? 'Yüksek Öncelik' 
                                      : task.priority === 1 
                                        ? 'Orta Öncelik' 
                                        : 'Düşük Öncelik'
                                  }>
                                    <Box sx={{ mr: 1 }}>
                                      {getPriorityIcon(task.priority)}
                                  </Box>
                                  </Tooltip>
                              </Box>

                              <Box>
                                  <Tooltip title="Görevi düzenle">
                                <IconButton 
                                  size="small" 
                                  onClick={() => onEditTask(task)}
                                      sx={{
                                        mr: 0.5,
                                        color: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
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
                                        color: theme.palette.error.main,
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
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
                              
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="600"
                                gutterBottom
                                sx={{ 
                                  mb: 1,
                                  lineHeight: 1.3,
                                  wordBreak: 'break-word',
                                  maxWidth: '95%'
                                }}
                              >
                                {task.title}
                              </Typography>
                              
                              {task.description && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    mb: 1.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {task.description}
                                </Typography>
                              )}
                              
                              {task.dueDate && (
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 1,
                                    color: 'text.secondary',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                                  {formatDueDate(task.dueDate)}
                                </Box>
                              )}
                              
                              {task.tags && task.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                  {task.tags.map((tag, idx) => (
                                    <Chip
                                      key={idx}
                                      label={tag}
                                      size="small"
                                      sx={{ 
                                        height: 22,
                                        fontSize: '0.7rem',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        '& .MuiChip-label': { px: 1 }
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