import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Collapsible } from '../components/Collapsible';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title">Profil</ThemedText>
      </View>

      <View style={styles.content}>
        <Collapsible title="Kişisel Bilgiler">
          <ThemedText variant="body">
            Burada kişisel bilgileriniz görüntülenecek.
          </ThemedText>
        </Collapsible>

        <Collapsible title="İstatistikler">
          <ThemedText variant="body">
            Burada görev istatistikleriniz görüntülenecek.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Ayarlar">
          <ThemedText variant="body">
            Burada uygulama ayarlarınız görüntülenecek.
          </ThemedText>
        </Collapsible>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    padding: 20,
  },
}); 