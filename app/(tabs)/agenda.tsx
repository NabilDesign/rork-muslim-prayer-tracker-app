import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Sunrise, Sun, CloudSun, Sunset, Moon, ArrowLeft } from 'lucide-react-native';
import { usePrayerStore, PrayerRecord } from '@/src/store/app-store';
import { PrayerCard } from '@/src/components/PrayerCard';

const { width } = Dimensions.get('window');

interface DayStatus {
  date: string;
  completed: number;
  total: number;
  status: 'complete' | 'partial' | 'missed' | 'future';
}

const prayerIcons = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
};

export default function AgendaScreen() {
  const { prayerRecords, markPrayerForDate, addPrayerNoteForDate, todaysPrayers } = usePrayerStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const handleMarkPrayerForDate = (prayerName: string, status: 'on-time' | 'late' | 'missed') => {
    if (selectedDate) {
      markPrayerForDate(selectedDate, prayerName, status);
    }
  };

  const handleAddNoteForDate = (prayerName: string, note: string) => {
    if (selectedDate) {
      addPrayerNoteForDate(selectedDate, prayerName, note);
    }
  };

  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const days: DayStatus[] = [];
    
    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const record = prayerRecords.find(r => r.date === dateStr);
      
      let completed = 0;
      const total = 5;
      let status: DayStatus['status'] = 'future';
      
      if (date > today) {
        // Future days
        status = 'future';
        completed = 0;
      } else if (record && record.prayers.some(p => p.status !== 'pending')) {
        // Days with actual prayer data (not just pending)
        completed = record.prayers.filter(p => p.status === 'on-time' || p.status === 'late').length;
        if (completed === total) {
          status = 'complete';
        } else if (completed > 0) {
          status = 'partial';
        } else {
          status = 'missed';
        }
      } else {
        // Days without prayer data (including today if no prayers marked yet)
        status = 'future';
        completed = 0;
      }
      
      days.push({
        date: dateStr,
        completed,
        total,
        status,
      });
    }
    
    return days;
  }, [currentMonth, prayerRecords]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: DayStatus['status']) => {
    switch (status) {
      case 'complete': return '#10B981';
      case 'partial': return '#F59E0B';
      case 'missed': return '#EF4444';
      case 'future': return '#E5E7EB';
      default: return '#E5E7EB';
    }
  };

  const getStatusIcon = (status: DayStatus['status']) => {
    switch (status) {
      case 'complete': return CheckCircle;
      case 'partial': return Clock;
      case 'missed': return XCircle;
      default: return null;
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate first day of month offset
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Calendar color="#FFFFFF" size={32} />
          <Text style={styles.headerTitle}>Prayer Agenda</Text>
          <Text style={styles.headerSubtitle}>Track your daily progress</Text>
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.calendarSection}>
          <View style={styles.monthHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthName}</Text>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight color="#6B7280" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysHeader}>
            {weekDays.map(day => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {emptyDays.map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyDay} />
            ))}
            {monthData.map((day) => {
              const StatusIcon = getStatusIcon(day.status);
              const dayNumber = new Date(day.date).getDate();
              
              return (
                <TouchableOpacity 
                  key={day.date} 
                  style={styles.dayContainer}
                  onPress={() => {
                    const today = new Date().toISOString().split('T')[0];
                    // Allow clicking on today and past days
                    if (day.date <= today) {
                      setSelectedDate(day.date);
                      setShowDayModal(true);
                    }
                  }}
                  activeOpacity={day.date <= new Date().toISOString().split('T')[0] ? 0.7 : 1}
                >
                  <View 
                    style={[
                      styles.dayCircle,
                      { backgroundColor: getStatusColor(day.status) }
                    ]}
                  >
                    <Text style={[
                      styles.dayNumber,
                      { color: day.status === 'future' ? '#6B7280' : '#FFFFFF' }
                    ]}>
                      {dayNumber}
                    </Text>
                  </View>
                  {StatusIcon && day.status !== 'future' && (
                    <StatusIcon 
                      color={getStatusColor(day.status)} 
                      size={10} 
                      style={styles.statusIcon}
                    />
                  )}
                  {day.status !== 'future' && (
                    <View style={styles.prayerCountContainer}>
                      <Text style={[
                        styles.prayerCount,
                        { 
                          color: '#1E293B',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderWidth: 1,
                          borderColor: 'rgba(30, 41, 59, 0.1)'
                        }
                      ]}>
                        {`${day.completed}/${day.total}`}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Complete (5/5)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Missed (0/5)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendCircle, { backgroundColor: '#E5E7EB' }]} />
              <Text style={styles.legendText}>Future</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDayModal(false)}
              style={styles.backButton}
            >
              <ArrowLeft color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : ''}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedDate && (() => {
              const today = new Date().toISOString().split('T')[0];
              const isToday = selectedDate === today;
              let record = prayerRecords.find(r => r.date === selectedDate);
              
              // If no record exists, create a default one for the selected date
              if (!record) {
                record = {
                  date: selectedDate,
                  prayers: [
                    { name: 'Fajr', status: 'pending' },
                    { name: 'Dhuhr', status: 'pending' },
                    { name: 'Asr', status: 'pending' },
                    { name: 'Maghrib', status: 'pending' },
                    { name: 'Isha', status: 'pending' },
                  ],
                };
              }
              
              return record?.prayers.map((prayer) => {
                const IconComponent = prayerIcons[prayer.name as keyof typeof prayerIcons];
                return (
                  <PrayerCard
                    key={prayer.name}
                    prayer={prayer}
                    icon={IconComponent}
                    readonly={false}
                    onMarkPrayer={handleMarkPrayerForDate}
                    onAddNote={handleAddNoteForDate}
                  />
                );
              });
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -30,
    right: -20,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -10,
    left: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  calendarSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 240,
  },
  emptyDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
  },
  dayContainer: {
    width: `${100/7}%`,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    position: 'relative',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusIcon: {
    position: 'absolute',
    top: 0,
    right: 6,
  },
  prayerCountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 16,
  },
  prayerCount: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    textAlign: 'center',
    minWidth: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  legendSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  legendTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  legendCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  noPrayersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noPrayersText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});