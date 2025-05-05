import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Alert, 
  Stack, 
  Snackbar,
  Fade,
  CircularProgress,
  useTheme,
  Divider,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  alpha,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TipsAndUpdates as TipsIcon,
  BarChart as AnalyticsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'framer-motion';

// Task tipi
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

const Tasks: React.FC = () => {
  const { currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskCountByStatus, setTaskCountByStatus] = useState({
    'TODO': 0,
    'IN_PROGRESS': 0,
    'DONE': 0
  });
  const theme = useTheme();
  
  // Yeni state değişkenleri
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Task[]>([]);

  // Firestore'dan görevleri çek
  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      try {
        const fetchedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        
        setTasks(fetchedTasks);
        
        // Durum bazında görev sayılarını hesapla
        const countByStatus = {
          'TODO': 0,
          'IN_PROGRESS': 0,
          'DONE': 0
        };
        
        fetchedTasks.forEach(task => {
          if (task.status in countByStatus) {
            countByStatus[task.status as keyof typeof countByStatus]++;
          }
        });
        
        setTaskCountByStatus(countByStatus);
        setIsLoading(false);
      } catch (error) {
        console.error('Görevler işlenirken hata:', error);
        setError('Görevler yüklenirken bir sorun oluştu.');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Görevler dinlenirken hata:', error);
      setError('Görevlere erişilemedi. Lütfen daha sonra tekrar deneyin.');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Modal'ı yeni görev için aç
  const handleAddTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  // Modal'ı düzenleme için aç
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Modal'ı kapat
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  // Hata mesajını temizle
  const handleClearError = () => {
      setError(null);
  };

  // Özet kart animasyonu
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Öneriler butonuna tıklama işleyicisi
  const handleGetSuggestions = async () => {
    try {
      setIsSuggestionsLoading(true);
      
      // Simüle edilmiş öneri verileri (gerçek API servisi olmadığı için)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniyelik gecikme
      
      const dummySuggestions: Task[] = [
        {
          id: 'suggestion-1',
          title: 'UX tasarımlarını gözden geçir',
          description: 'Projenin UI/UX tasarımlarını gözden geçirerek son değişiklikleri onayla',
          status: 'TODO',
          priority: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(Date.now() + 86400000 * 3), // 3 gün sonra
          tags: ['tasarım', 'UI/UX']
        },
        {
          id: 'suggestion-2',
          title: 'Haftalık toplantı notları hazırla',
          description: 'Pazartesi yapılacak ekip toplantısı için gündem maddeleri ve notlar hazırla',
          status: 'TODO',
          priority: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(Date.now() + 86400000), // 1 gün sonra
          tags: ['toplantı', 'yönetim']
        }
      ];
      
      setSuggestions(dummySuggestions);
      
      // Kullanıcıya geri bildirim
      alert(`${dummySuggestions.length} görev önerisi oluşturuldu! Bu bir test mesajıdır, daha sonra tam entegrasyon yapılacaktır.`);
      
    } catch (error) {
      console.error('Görev önerileri alınırken hata:', error);
      setError('Görev önerileri alınırken bir sorun oluştu.');
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{ 
                color: 'text.primary',
                position: 'relative',
                mb: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '80px',
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
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
              Projelerinizi organize edin ve ilerlemeyi takip edin
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<FilterIcon />}
                sx={{ borderRadius: '8px' }}
              >
                Filtrele
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<TipsIcon />}
                onClick={handleGetSuggestions}
                disabled={isSuggestionsLoading}
                sx={{ borderRadius: '8px' }}
              >
                {isSuggestionsLoading ? 'Yükleniyor...' : 'Öneriler'}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddTask}
                sx={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 14px 0 rgba(58, 110, 165, 0.2)'
                }}
              >
                Yeni Görev
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {!isLoading && (
          <Grid container spacing={3} sx={{ mt: 1, mb: 4 }}>
            <Grid item xs={12} md={4}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ height: '4px', bgcolor: theme.palette.info.main }} />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Yapılacak</Typography>
                      <Chip 
                        label={taskCountByStatus.TODO} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {taskCountByStatus.TODO}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={33.3} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.info.main
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ height: '4px', bgcolor: theme.palette.warning.main }} />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Devam Ediyor</Typography>
                      <Chip 
                        label={taskCountByStatus.IN_PROGRESS} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {taskCountByStatus.IN_PROGRESS}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={66.6} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.warning.main
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ height: '4px', bgcolor: theme.palette.success.main }} />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Tamamlanan</Typography>
                      <Chip 
                        label={taskCountByStatus.DONE} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {taskCountByStatus.DONE}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.success.main
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        )}
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={handleClearError}
          variant="filled"
        >
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, alignItems: 'center', flexDirection: 'column' }}>
          <CircularProgress size={48} />
          <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
            Görevler yükleniyor...
          </Typography>
        </Box>
      ) : (
      <Paper 
        elevation={0} 
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 'calc(100vh - 320px)'
          }}
      >
        <KanbanBoard
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
        />
      </Paper>
      )}

      <TaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
      />
      
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={handleClearError}
        TransitionComponent={Fade}
      >
        <Alert severity="error" variant="filled" onClose={handleClearError}>
          {error}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Tasks; 