import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  buttonText = 'Google ile Giriş Yap'
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Kullanıcının her seferinde hesap seçmesini sağla
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore'da kullanıcı dokümanını kontrol et
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      // Kullanıcı dokümanı yoksa oluştur
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          workingHours: {
            start: '09:00',
            end: '17:00',
            workDays: [1, 2, 3, 4, 5], // Pazartesi-Cuma
          },
          lastLoginAt: new Date().toISOString(),
        });
      } else {
        // Mevcut kullanıcının son giriş zamanını güncelle
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      }

      toast({
        title: 'Giriş başarılı',
        description: 'Google hesabınızla giriş yaptınız',
        status: 'success',
        duration: 3000,
      });

      onSuccess?.();
      navigate('/');
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      
      let errorMessage = 'Google ile giriş yapılırken bir hata oluştu';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Giriş penceresi kapatıldı';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Giriş penceresi engellendi. Lütfen popup engelleyiciyi kontrol edin';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'İşlem iptal edildi';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Bu e-posta adresi farklı bir giriş yöntemi ile kayıtlı';
          break;
      }

      toast({
        title: 'Giriş başarısız',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });

      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      width="full"
      variant="outline"
      leftIcon={<FcGoogle />}
      onClick={handleGoogleSignIn}
      isLoading={loading}
      loadingText="Giriş yapılıyor..."
    >
      {buttonText}
    </Button>
  );
};

export default GoogleSignInButton; 