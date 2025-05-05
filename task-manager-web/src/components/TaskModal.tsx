import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Stack,
  Typography,
  IconButton,
  SelectChangeEvent,
  Grow,
  useTheme,
  CircularProgress,
  Autocomplete,
  FormHelperText,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  Avatar,
  LinearProgress,
  alpha
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  Close as CloseIcon, 
  Add as AddIcon,
  Flag as FlagIcon,
  Timer as TimerIcon,
  BookmarkBorder as TagIcon,
  CalendarMonth as CalendarIcon,
  SaveAlt as SaveIcon,
  DeleteOutline as DeleteIcon,
  AssignmentTurnedIn as DoneIcon,
  NotificationsActive as AlertIcon,
  KeyboardArrowUp as HighPriorityIcon,
  Remove as MediumPriorityIcon,
  KeyboardArrowDown as LowPriorityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { addDoc, collection, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  userId?: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

const initialTaskState: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  description: '',
  status: 'TODO',
  dueDate: null,
  priority: 0,
  tags: []
};

// Animasyonlu bileşen için
const FormSectionTitle = ({ children, icon }: { children: React.ReactNode, icon: React.ReactNode }) => (
  <Typography 
    variant="subtitle2" 
    sx={{ 
      color: 'text.secondary', 
      fontWeight: 600, 
      mb: 1.5,
      display: 'flex',
      alignItems: 'center'
    }}
  >
    {icon}
    <Box component="span" sx={{ ml: 1 }}>{children}</Box>
  </Typography>
);

const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, task = null }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>(initialTaskState);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  // Eğer bir görev düzenleniyorsa formu doldurmak için
  useEffect(() => {
    if (task) {
      setLoading(true);
      const { id, createdAt, updatedAt, ...rest } = task;
      setFormData(rest);
      setLoading(false);
    } else {
      setFormData(initialTaskState);
    }
  }, [task, open]);

  // Form alanlarını değiştirme
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Tarih değiştirme
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  // Öncelik değiştirme
  const handlePriorityChange = (e: SelectChangeEvent<number>) => {
    setFormData(prev => ({ ...prev, priority: Number(e.target.value) }));
  };

  // Durum değiştirme
  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }));
  };

  // Tag eklemek için
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Tag silmek için
  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  // Formu doğrulama
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formu gönderme
  const handleSubmit = async () => {
    if (!validateForm() || !currentUser) return;
    
    setSubmitting(true);
    try {
      if (task) {
        // Mevcut görevi güncelle
        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setSuccessMessage('Görev başarıyla güncellendi');
      } else {
        // Yeni görev oluştur
        await addDoc(collection(db, 'tasks'), {
          ...formData,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setSuccessMessage('Görev başarıyla oluşturuldu');
      }
      
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      console.error('Görev kaydedilirken hata oluştu:', error);
      alert(`Görev kaydedilirken hata oluştu: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Öncelik rengini belirle
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0: return theme.palette.info.main;
      case 1: return theme.palette.warning.main;
      case 2: return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  // Öncelik ikonunu belirle
  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 0: return <LowPriorityIcon sx={{ color: theme.palette.info.main }} />;
      case 1: return <MediumPriorityIcon sx={{ color: theme.palette.warning.main }} />;
      case 2: return <HighPriorityIcon sx={{ color: theme.palette.error.main }} />;
      default: return <LowPriorityIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Başlık rengini belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return theme.palette.info.main;
      case 'IN_PROGRESS': return theme.palette.warning.main;
      case 'DONE': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={!submitting ? onClose : undefined} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'visible',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'linear-gradient(180deg, rgba(248, 249, 253, 0.4) 0%, rgba(255, 255, 255, 1) 100%)'
          }
        }}
      >
        {submitting && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              height: 3,
              background: 'transparent',
              '.MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)'
              }
            }} 
          />
        )}
        
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 2,
          background: `linear-gradient(135deg, ${alpha(getStatusColor(formData.status), 0.1)} 0%, rgba(255, 255, 255, 0) 100%)`,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="h5" 
              component={motion.div}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{ 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary'
              }}
            >
              <Box
                component={Avatar}
                sx={{
                  bgcolor: `${getStatusColor(formData.status)}15`,
                  color: getStatusColor(formData.status),
                  width: 32,
                  height: 32,
                  mr: 1.5,
                  fontSize: '1rem'
                }}
              >
                {task ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              </Box>
              {task ? 'Görevi Düzenle' : 'Yeni Görev'}
            </Typography>
            <Tooltip title="Kapat">
              <IconButton
                aria-label="close"
                onClick={onClose}
                disabled={submitting}
                sx={{
                  color: 'text.secondary',
                  bgcolor: 'grey.100',
                  '&:hover': {
                    bgcolor: 'grey.200',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>
      
        <DialogContent sx={{ py: 3 }}>
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Stack spacing={3}>
                  {/* Başlık */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <TextField
                      name="title"
                      label="Görev Başlığı"
                      fullWidth
                      value={formData.title}
                      onChange={handleChange}
                      error={!!errors.title}
                      helperText={errors.title}
                      required
                      variant="outlined"
                      placeholder="Örn: Proje planını hazırla"
                      InputProps={{
                        sx: {
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: 2,
                        }
                      }}
                      disabled={submitting}
                    />
                  </Box>
                  
                  {/* Açıklama */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <TextField
                      name="description"
                      label="Açıklama"
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Görevin detaylarını yazın..."
                      InputProps={{
                        sx: {
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: 2,
                        }
                      }}
                      disabled={submitting}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {/* Durum ve Öncelik */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <FormControl fullWidth disabled={submitting}>
                        <FormSectionTitle 
                          icon={<CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
                        >
                          Durum
                        </FormSectionTitle>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleStatusChange}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5
                            }
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                              }
                            }
                          }}
                        >
                          <MenuItem value="TODO" sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, my: 0.5, py: 1.5 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.info.main,
                                marginRight: 1,
                              }}
                            />
                            Yapılacak
                          </MenuItem>
                          <MenuItem value="IN_PROGRESS" sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, my: 0.5, py: 1.5 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.warning.main,
                                marginRight: 1,
                              }}
                            />
                            Devam Ediyor
                          </MenuItem>
                          <MenuItem value="DONE" sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, my: 0.5, py: 1.5 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.success.main,
                                marginRight: 1,
                              }}
                            />
                            Tamamlandı
                          </MenuItem>
                        </Select>
                      </FormControl>
                    
                      <FormControl fullWidth disabled={submitting}>
                        <FormSectionTitle 
                          icon={<FlagIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
                        >
                          Öncelik
                        </FormSectionTitle>
                        <Select
                          name="priority"
                          value={formData.priority}
                          onChange={handlePriorityChange}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5
                            }
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                              }
                            }
                          }}
                        >
                          <MenuItem value={0} sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, my: 0.5, py: 1.5 }}>
                            {getPriorityIcon(0)}
                            <Box sx={{ ml: 1 }}>Düşük</Box>
                          </MenuItem>
                          <MenuItem value={1} sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, my: 0.5, py: 1.5 }}>
                            {getPriorityIcon(1)}
                            <Box sx={{ ml: 1 }}>Orta</Box>
                          </MenuItem>
                          <MenuItem value={2} sx={{ display: 'flex', alignItems: 'center', borderRadius: 1, my: 0.5, py: 1.5 }}>
                            {getPriorityIcon(2)}
                            <Box sx={{ ml: 1 }}>Yüksek</Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </motion.div>
                  
                  {/* Son Tarih */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <FormSectionTitle 
                      icon={<TimerIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
                    >
                      Son Tarih
                    </FormSectionTitle>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={formData.dueDate}
                        onChange={handleDateChange}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            disabled: submitting,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                              }
                            }
                          } 
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                
                  {/* Etiketler */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <FormSectionTitle 
                      icon={<TagIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
                    >
                      Etiketler
                    </FormSectionTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TextField
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Yeni etiket ekle"
                        size="small"
                        disabled={submitting}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                          }
                        }}
                      />
                      <Button 
                        startIcon={<AddIcon />} 
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || submitting}
                        variant="contained"
                        color="primary"
                        sx={{ 
                          ml: 1,
                          borderRadius: 2,
                          px: 2, 
                          background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)'
                        }}
                      >
                        Ekle
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <AnimatePresence>
                        {formData.tags.map((tag, idx) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Chip
                              label={tag}
                              onDelete={() => handleDeleteTag(tag)}
                              color="primary"
                              variant="outlined"
                              size="medium"
                              disabled={submitting}
                              sx={{ 
                                borderRadius: 2,
                                '& .MuiChip-label': { px: 1.5 }
                              }}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {formData.tags.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                          Henüz etiket eklenmedi
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>
      
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            disabled={submitting} 
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: '0px 4px 12px rgba(67, 97, 238, 0.2)',
              background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)'
            }}
          >
            {submitting ? 'Kaydediliyor...' : (task ? 'Güncelle' : 'Oluştur')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Başarı mesajı */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          icon={<DoneIcon />}
          sx={{
            borderRadius: 2,
            boxShadow: '0px 8px 20px rgba(6, 214, 160, 0.25)'
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskModal; 