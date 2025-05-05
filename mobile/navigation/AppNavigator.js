import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth ekranları
import LoginScreen from '../components/auth/LoginScreen';
import RegisterScreen from '../components/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

// Ana ekranlar için geçici komponentler (gerçek uygulamada bunları ayrı dosyalarda oluşturmalısınız)
const HomeScreen = ({ navigation }) => {
  const { logout, currentUser } = useAuth();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Hoş Geldiniz, {currentUser?.displayName || 'Kullanıcı'}
      </Text>
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#f87171', 
          padding: 16, 
          borderRadius: 8, 
          alignItems: 'center', 
          width: '100%' 
        }} 
        onPress={() => logout()}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const AppNavigator = () => {
  const { currentUser, loading } = useAuth();

  // Eğer yükleme devam ediyorsa, yükleme gösterebilirsiniz
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!currentUser ? (
        // Kullanıcı oturum açmamışsa Auth stack'i göster
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        // Kullanıcı oturum açmışsa App stack'i göster
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Görevlerim' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 