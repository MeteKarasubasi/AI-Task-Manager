import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takvim</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Yeni Etkinlik</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity>
            <Text style={styles.headerButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>Mart 2024</Text>
          <TouchableOpacity>
            <Text style={styles.headerButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          <Text style={styles.weekDay}>Pzt</Text>
          <Text style={styles.weekDay}>Sal</Text>
          <Text style={styles.weekDay}>Çar</Text>
          <Text style={styles.weekDay}>Per</Text>
          <Text style={styles.weekDay}>Cum</Text>
          <Text style={styles.weekDay}>Cmt</Text>
          <Text style={styles.weekDay}>Paz</Text>
        </View>

        <View style={styles.daysContainer}>
          {/* Burada takvim günleri dinamik olarak oluşturulacak */}
        </View>
      </View>

      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>Bugünkü Görevler</Text>
        <View style={styles.eventCard}>
          <Text style={styles.eventTime}>09:00</Text>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Proje Toplantısı</Text>
            <Text style={styles.eventDescription}>Ekip toplantısı ve sprint planlaması</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButton: {
    fontSize: 20,
    color: '#007AFF',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    color: '#666',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventsContainer: {
    flex: 1,
    padding: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 