import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Profil güncelleme işlemi (şimdilik sadece UI)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Profil başarıyla güncellendi');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            Profil Bilgileri
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleUpdateProfile}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Email"
              value={currentUser?.email}
              disabled
            />
            <TextField
              fullWidth
              label="İsim"
              defaultValue={currentUser?.displayName || ''}
              disabled
            />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Hesap oluşturma tarihi:{' '}
                {currentUser?.metadata.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString('tr-TR')
                  : 'Bilinmiyor'}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Son giriş tarihi:{' '}
                {currentUser?.metadata.lastSignInTime
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString('tr-TR')
                  : 'Bilinmiyor'}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              Profili Güncelle
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 