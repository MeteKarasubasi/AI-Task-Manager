import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Collapsible } from '../components/Collapsible';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title">Keşfet</ThemedText>
      </View>

      <View style={styles.content}>
        <Collapsible title="Öne Çıkan Görevler">
          <ThemedText variant="body">
            Burada öne çıkan görevler listelenecek.
        </ThemedText>
      </Collapsible>

        <Collapsible title="Popüler Kategoriler">
          <ThemedText variant="body">
            Burada popüler kategoriler listelenecek.
        </ThemedText>
      </Collapsible>

        <Collapsible title="Yeni Özellikler">
          <ThemedText variant="body">
            Burada yeni özellikler listelenecek.
          </ThemedText>
      </Collapsible>
      </View>
    </ScrollView>
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
