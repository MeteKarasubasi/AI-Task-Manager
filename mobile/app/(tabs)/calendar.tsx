import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Collapsible } from '../components/Collapsible';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title">Takvim</ThemedText>
      </View>

      <View style={styles.content}>
        <Collapsible title="Bugünkü Görevler">
          <ThemedText variant="body">
            Burada bugünkü görevleriniz listelenecek.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Bu Hafta">
          <ThemedText variant="body">
            Burada bu haftaki görevleriniz listelenecek.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Bu Ay">
          <ThemedText variant="body">
            Burada bu aydaki görevleriniz listelenecek.
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