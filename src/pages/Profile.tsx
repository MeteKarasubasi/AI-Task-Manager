import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    photoURL: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({
            ...docSnap.data() as UserProfile,
            email: currentUser.email || '',
          });
        }
      } catch (err) {
        setError('Profil bilgileri yüklenirken hata oluştu.');
        console.error('Profil yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        name: profile.name,
        // email güncellemesi için ayrı bir flow gerekiyor
        // photoURL güncellemesi için Storage entegrasyonu gerekiyor
      });
      setError('');
    } catch (err) {
      setError('Profil güncellenirken hata oluştu.');
      console.error('Profil güncelleme hatası:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar
              src={profile.photoURL}
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Typography variant="h5" component="h1" gutterBottom>
              Profil Bilgileri
            </Typography>
          </Box>

          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="E-posta"
              value={profile.email}
              disabled
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 