import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './components/ThemedText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
      <View style={styles.container}>
        <ThemedText variant="title">Sayfa Bulunamadı</ThemedText>
        <ThemedText variant="body" style={styles.text}>
          Aradığınız sayfa bulunamadı.
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText variant="body" style={styles.linkText}>
            Ana Sayfaya Dön
          </ThemedText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  linkText: {
    color: '#fff',
  },
});
