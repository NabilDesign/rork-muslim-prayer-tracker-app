import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Calendar, Share2, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
import { getHadithOfTheDay, getHadithByDate, type Hadith } from '@/src/data/hadiths';

export default function HadithScreen() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentHadith, setCurrentHadith] = useState<Hadith>(getHadithOfTheDay());
  const [isToday, setIsToday] = useState<boolean>(true);

  useEffect(() => {
    const today = new Date();
    const isCurrentDateToday = currentDate.toDateString() === today.toDateString();
    setIsToday(isCurrentDateToday);
    
    if (isCurrentDateToday) {
      setCurrentHadith(getHadithOfTheDay());
    } else {
      setCurrentHadith(getHadithByDate(currentDate));
    }
  }, [currentDate]);

  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const shareHadith = async () => {
    try {
      await Share.share({
        message: `${currentHadith.text}\n\n— ${currentHadith.narrator}\nSource: ${currentHadith.source}`,
        title: 'Hadith of the Day',
      });
    } catch (error) {
      console.error('Error sharing hadith:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <BookOpen color="#FFFFFF" size={32} />
          <Text style={styles.headerTitle}>Hadith of the Day</Text>
          <Text style={styles.headerSubtitle}>Daily wisdom from Prophet Muhammad (ﷺ)</Text>
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {/* Date Navigation */}
          <View style={styles.dateNavigation}>
            <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
              <ChevronLeft color="#6B7280" size={20} />
            </TouchableOpacity>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
              {!isToday && (
                <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
              <ChevronRight color="#6B7280" size={20} />
            </TouchableOpacity>
          </View>

          {/* Hadith Card */}
          <View style={styles.hadithCard}>
            <View style={styles.hadithHeader}>
              <View style={styles.categoryBadge}>
                <Star color="#F59E0B" size={16} fill="#F59E0B" />
                <Text style={styles.categoryText}>{currentHadith.category}</Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={shareHadith}>
                <Share2 color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.hadithContent}>
              <Text style={styles.hadithText}>"{currentHadith.text}"</Text>
              
              <View style={styles.hadithFooter}>
                <Text style={styles.narratorText}>— {currentHadith.narrator}</Text>
                <Text style={styles.sourceText}>Source: {currentHadith.source}</Text>
              </View>
            </View>
          </View>

          {/* Reflection Section */}
          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionTitle}>Reflect on this Hadith</Text>
            <Text style={styles.reflectionPrompt}>
              How can you apply this wisdom in your daily life? Take a moment to contemplate the deeper meaning and consider how it relates to your spiritual journey.
            </Text>
          </View>
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -20,
    right: 10,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 10,
    left: 30,
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  section: {
    padding: 20,
    paddingTop: 32,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  todayButton: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#2D5016',
    borderRadius: 12,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hadithCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  hadithHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  hadithContent: {
    gap: 20,
  },
  hadithText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1F2937',
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  hadithFooter: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  narratorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016',
  },
  sourceText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reflectionSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5016',
    marginBottom: 12,
  },
  reflectionPrompt: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '500',
  },
});