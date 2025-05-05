import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Collapsible } from '../components/Collapsible';

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title">Görevler</ThemedText>
      </View>

      <View style={styles.content}>
        <Collapsible title="Aktif Görevler">
          <ThemedText variant="body">
            Burada aktif görevleriniz listelenecek.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Bekleyen Görevler">
          <ThemedText variant="body">
            Burada bekleyen görevleriniz listelenecek.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Tamamlanan Görevler">
          <ThemedText variant="body">
            Burada tamamlanan görevleriniz listelenecek.
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