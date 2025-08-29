import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Sunrise, Sun, CloudSun, Sunset, Moon } from 'lucide-react-native';
import { usePrayerStore } from '@/src/store/app-store';
import { PrayerCard } from '@/src/components/PrayerCard';

import { StatsOverview } from '@/src/components/StatsOverview';


const prayerIcons = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
};

export default function TodayScreen() {
  const {
    todaysPrayers,
    initializeTodaysPrayers,
    markPrayer,
    addPrayerNote,
    getStreakDays,
    getOnTimeRate,
  } = usePrayerStore();
  
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    initializeTodaysPrayers();
  }, [initializeTodaysPrayers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeTodaysPrayers();
    setRefreshing(false);
  };

  const handleMarkPrayer = (prayerName: string, status: 'on-time' | 'late' | 'missed') => {
    markPrayer(prayerName, status);
  };

  const handleAddNote = (prayerName: string, note: string) => {
    addPrayerNote(prayerName, note);
  };

  const handleMarkAllOnTime = () => {
    todaysPrayers.forEach(prayer => {
      if (prayer.status === 'pending') {
        markPrayer(prayer.name, 'on-time');
      }
    });
  };

  const streakDays = getStreakDays();
  const onTimeRate = getOnTimeRate();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>As-salamu alaykum</Text>
          <Text style={styles.date}>{today}</Text>
          <StatsOverview streakDays={streakDays} onTimeRate={onTimeRate} />
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.prayersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Prayers</Text>
            {todaysPrayers.some(prayer => prayer.status === 'pending') && (
              <TouchableOpacity 
                style={styles.allOnTimeButton}
                onPress={handleMarkAllOnTime}
                activeOpacity={0.8}
              >
                <Text style={styles.allOnTimeText}>All On Time</Text>
              </TouchableOpacity>
            )}
          </View>

          {todaysPrayers.map((prayer) => {
            const IconComponent = prayerIcons[prayer.name as keyof typeof prayerIcons];
            return (
              <PrayerCard
                key={prayer.name}
                prayer={prayer}
                icon={IconComponent}
                onMarkPrayer={handleMarkPrayer}
                onAddNote={handleAddNote}
              />
            );
          })}
        </View>
      </ScrollView>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -20,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    left: -10,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 20,
    left: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  prayersSection: {
    padding: 20,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  allOnTimeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allOnTimeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});