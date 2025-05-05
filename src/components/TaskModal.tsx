import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Divider,
  Stack,
  alpha,
  InputAdornment,
  useTheme,
  Grow,
  Slide,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  AccessTime as TimeIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
  KeyboardArrowUp as HighPriorityIcon,
  Remove as MediumPriorityIcon,
  KeyboardArrowDown as LowPriorityIcon,
  Check as CheckIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

// Görev tipi tanımı
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
  isAIGenerated?: boolean;
}

// Modal props tanımı
interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

// Form bölüm başlığı bileşeni
const FormSectionTitle = ({ children, icon }: { children: React.ReactNode, icon: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 2 }}>
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 0.75, 
        mr: 1.5, 
        borderRadius: 1.5,
        backgroundImage: 'linear-gradient(45deg, #3a86ff 30%, #4cc9f0 90%)',
        color: 'white',
        boxShadow: '0 2px 10px rgba(58, 134, 255, 0.2)',
      }}
    >
      {icon}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {children}
    </Typography>
  </Box>
);

// TaskModal bileşeni
const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, task = null }) => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // Form durumunu takip etmek için state
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'todo',
    createdAt: null,
    updatedAt: null,
    dueDate: null,
    priority: 'medium',
    tags: [],
    isAIGenerated: false,
  });
  const [tagInput, setTagInput] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal açıldığında task varsa formData'yı güncelle
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        createdAt: task.createdAt || null,
        updatedAt: task.updatedAt || null,
        dueDate: task.dueDate || null,
        priority: task.priority || 'medium',
        tags: task.tags || [],
        isAIGenerated: task.isAIGenerated || false,
      });
    } else {
      // Yeni görev için temiz form
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        createdAt: null,
        updatedAt: null,
        dueDate: null,
        priority: 'medium',
        tags: [],
        isAIGenerated: false,
      });
    }
    
    // Modal kapatıldığında hataları temizle
    setErrors({});
    setTagInput('');
  }, [task, open]);

  // Input değişikliklerini izle
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Tarih değişikliğini izle
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  // Öncelik değişikliğini izle
  const handlePriorityChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }));
  };

  // Durum değişikliğini izle
  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, status: e.target.value as 'todo' | 'in-progress' | 'completed' }));
  };

  // Etiket eklemeyi izle
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Etiket silmeyi izle
  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  // Form kontrolü
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Görev başlığı zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Status değerini düzgün formata çevir
      const normalizeStatus = (status) => {
        const statusMap = {
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

      // TaskData hazırla
      const taskData = {
        ...formData,
        userId: user.uid,
        updatedAt: serverTimestamp(),
        status: normalizeStatus(formData.status) // Status formatını standarize et
      };

      if (task) {
        // Mevcut görevi güncelle
        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, taskData);
        console.log('Görev güncellendi:', task.id);
      } else {
        // Yeni görev ekle
        taskData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        console.log('Yeni görev oluşturuldu:', docRef.id);
      }

      onClose();
    } catch (error) {
      console.error('Görev kaydedilirken hata oluştu:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Öncelik rengini belirle
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.warning.main;
    }
  };

  // Öncelik ikonunu belirle
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <HighPriorityIcon sx={{ color: theme.palette.error.main }} />;
      case 'medium': return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
      case 'low': return <LowPriorityIcon sx={{ color: theme.palette.info.main }} />;
      default: return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
    }
  };

  // Durum rengini belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return theme.palette.primary.main;
      case 'in-progress': return theme.palette.warning.main;
      case 'completed': return theme.palette.success.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          backdropFilter: 'blur(16px)',
          backgroundColor: alpha('#ffffff', 0.92),
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.75))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          overflow: 'hidden',
        }
      }}
      TransitionComponent={Grow}
      TransitionProps={{ timeout: 400 }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Header Gradient */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '8px', 
            backgroundImage: 'linear-gradient(90deg, #3a86ff, #4cc9f0, #06d6a0)', 
          }} 
        />
        
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pt: 3.5,
            pb: 1,
          }}
        >
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #3a86ff, #4cc9f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'  
            }}
          >
            {task ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ 
              borderRadius: '50%',
              transition: 'all 0.2s',
              '&:hover': { 
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                transform: 'rotate(90deg)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider sx={{ opacity: 0.6 }} />
        
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" noValidate>
            {/* Başlık */}
            <FormSectionTitle icon={<TitleIcon />}>Görev Başlığı</FormSectionTitle>
            <TextField
              name="title"
              label="Başlık"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              error={Boolean(errors.title)}
              helperText={errors.title}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha('#ffffff', 0.5),
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.8),
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
                }
              }}
            />
            
            {/* Açıklama */}
            <FormSectionTitle icon={<DescriptionIcon />}>Açıklama</FormSectionTitle>
            <TextField
              name="description"
              label="Açıklama"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha('#ffffff', 0.5),
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.8),
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
                }
              }}
            />
            
            {/* Durum ve Öncelik */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <FormControl 
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha('#ffffff', 0.5),
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.8),
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }
                }}
              >
                <InputLabel id="status-label">Durum</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  label="Durum"
                  startAdornment={
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: getStatusColor(formData.status),
                        mr: 1,
                        ml: -0.5,
                        boxShadow: `0 0 0 2px ${alpha(getStatusColor(formData.status), 0.3)}`
                      }}
                    />
                  }
                >
                  <MenuItem value="todo">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: theme.palette.primary.main,
                          mr: 1
                        }} 
                      />
                      Yapılacak
                    </Box>
                  </MenuItem>
                  <MenuItem value="in-progress">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: theme.palette.warning.main,
                          mr: 1
                        }} 
                      />
                      Devam Ediyor
                    </Box>
                  </MenuItem>
                  <MenuItem value="completed">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: theme.palette.success.main,
                          mr: 1
                        }} 
                      />
                      Tamamlandı
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <FormControl 
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha('#ffffff', 0.5),
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.8),
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }
                }}
              >
                <InputLabel id="priority-label">Öncelik</InputLabel>
                <Select
                  labelId="priority-label"
                  value={formData.priority}
                  onChange={handlePriorityChange}
                  label="Öncelik"
                  startAdornment={
                    <InputAdornment position="start">
                      {getPriorityIcon(formData.priority)}
                    </InputAdornment>
                  }
                >
                  <MenuItem value="high">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HighPriorityIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                      Yüksek
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MediumPriorityIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                      Orta
                    </Box>
                  </MenuItem>
                  <MenuItem value="low">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LowPriorityIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                      Düşük
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Son Tarih */}
            <FormSectionTitle icon={<TimeIcon />}>Son Tarih</FormSectionTitle>
            <DatePicker 
              label="Son Tarih"
              value={formData.dueDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.5),
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.8),
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    }
                  },
                },
              }}
            />
            
            {/* Etiketler */}
            <FormSectionTitle icon={<LabelIcon />}>Etiketler</FormSectionTitle>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Etiket ekle"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.5),
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.8),
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddTag}
                  sx={{ 
                    ml: 1,
                    minWidth: 40,
                    borderRadius: 2,
                    backgroundImage: 'linear-gradient(45deg, #3a86ff 30%, #4cc9f0 90%)',
                    boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(58, 134, 255, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    sx={{ 
                      m: 0.5,
                      borderRadius: 6,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      borderColor: alpha(theme.palette.secondary.main, 0.3),
                      color: theme.palette.secondary.dark,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                      },
                    }}
                  />
                ))}
                
                {formData.tags.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', p: 1 }}>
                    Henüz etiket eklenmemiş
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              borderWidth: 2,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: theme.palette.primary.main,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              ml: 1,
              backgroundImage: 'linear-gradient(45deg, #3a86ff 30%, #4cc9f0 90%)',
              boxShadow: '0 4px 12px rgba(58, 134, 255, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(58, 134, 255, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isSubmitting ? 'Kaydediliyor...' : (
              <>
                <CheckIcon sx={{ mr: 0.5 }} />
                {task ? 'Güncelle' : 'Kaydet'}
              </>
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TaskModal; 