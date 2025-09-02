import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronLeft, ChevronRight, X, Check, Clock, Edit3, MessageSquare, BarChart3, ArrowLeft, ArrowRight, Home } from 'lucide-react-native';
import { useAppStore } from '@/src/store/app-store';

const { width } = Dimensions.get('window');

const PRAYERS = [
  { id: 'fajr', name: 'Fajr', arabicName: 'الفجر' },
  { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر' },
  { id: 'asr', name: 'Asr', arabicName: 'العصر' },
  { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب' },
  { id: 'isha', name: 'Isha', arabicName: 'العشاء' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AgendaScreen() {
  const { prayerData, getPrayerDataForDate, updatePrayerStatus, addPrayerComment } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');
  const [showStats, setShowStats] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayStatus = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayData = prayerData[dateStr];
    
    if (!dayData) return null;
    
    let prayedCount = 0;
    let lateCount = 0;
    let missedCount = 0;
    
    Object.values(dayData).forEach((prayer: any) => {
      if (prayer.status === 'prayed') prayedCount++;
      else if (prayer.status === 'late') lateCount++;
      else if (prayer.status === 'missed') missedCount++;
    });
    
    if (missedCount > 0) return 'missed';
    if (lateCount > 0) return 'late';
    if (prayedCount === 5) return 'perfect';
    if (prayedCount > 0) return 'partial';
    return null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'perfect': return '#10B981';
      case 'partial': return '#60A5FA';
      case 'late': return '#F59E0B';
      case 'missed': return '#EF4444';
      default: return 'transparent';
    }
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const handleDayPress = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    setSelectedDate(selected);
    setModalVisible(true);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setModalVisible(true);
  };

  const goToPreviousDay = () => {
    if (selectedDate) {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
      setCurrentDate(new Date(prevDay.getFullYear(), prevDay.getMonth()));
    }
  };

  const goToNextDay = () => {
    if (selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
      setCurrentDate(new Date(nextDay.getFullYear(), nextDay.getMonth()));
    }
  };

  const handlePrayerStatusChange = (prayerId: string, status: 'prayed' | 'late' | 'missed' | null) => {
    if (!selectedDate) return;
    
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const currentData = getPrayerDataForDate(dateStr);
    const currentStatus = currentData[prayerId]?.status;
    
    if (currentStatus === status) {
      updatePrayerStatusForDate(dateStr, prayerId, null);
    } else {
      updatePrayerStatusForDate(dateStr, prayerId, status);
    }
  };

  const updatePrayerStatusForDate = (dateStr: string, prayerId: string, status: 'prayed' | 'late' | 'missed' | null) => {
    updatePrayerStatus(prayerId, status, dateStr);
  };

  const handleEditComment = (prayerId: string) => {
    if (!selectedDate) return;
    
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dayData = getPrayerDataForDate(dateStr);
    setEditingPrayer(prayerId);
    setTempComment(dayData[prayerId]?.comment || '');
  };

  const saveComment = () => {
    if (editingPrayer && selectedDate) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      addPrayerComment(editingPrayer, tempComment, dateStr);
    }
    setEditingPrayer(null);
    setTempComment('');
  };

  const getMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    
    let totalPrayers = 0;
    let prayedCount = 0;
    let lateCount = 0;
    let missedCount = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayData = prayerData[dateStr];
      
      if (dayData) {
        Object.values(dayData).forEach((prayer: any) => {
          totalPrayers++;
          if (prayer.status === 'prayed') prayedCount++;
          else if (prayer.status === 'late') lateCount++;
          else if (prayer.status === 'missed') missedCount++;
        });
      }
    }
    
    return { totalPrayers, prayedCount, lateCount, missedCount };
  };

  const getSelectedDateData = () => {
    if (!selectedDate) return {};
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return getPrayerDataForDate(dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Calendar color="#FFFFFF" size={32} />
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.headerSubtitle}>Track your prayer journey</Text>
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
              <ChevronLeft size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.monthTitleContainer}>
              <Text style={styles.monthTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                <Home size={16} color="#059669" />
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <ChevronRight size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
          
          {/* Stats Toggle */}
          <TouchableOpacity 
            style={styles.statsToggle}
            onPress={() => setShowStats(!showStats)}
          >
            <BarChart3 size={16} color="#059669" />
            <Text style={styles.statsToggleText}>Monthly Stats</Text>
          </TouchableOpacity>
          
          {showStats && (
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                {(() => {
                  const stats = getMonthStats();
                  return (
                    <React.Fragment>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.prayedCount}</Text>
                        <Text style={styles.statLabel}>Prayed</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.lateCount}</Text>
                        <Text style={styles.statLabel}>Late</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.missedCount}</Text>
                        <Text style={styles.statLabel}>Missed</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#6B7280' }]}>{stats.totalPrayers}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                      </View>
                    </React.Fragment>
                  );
                })()}
              </View>
            </View>
          )}

          {/* Weekday Headers */}
          <View style={styles.weekdayHeader}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              
              const date = new Date(currentYear, currentMonth, day);
              const status = getDayStatus(date);
              const statusColor = getStatusColor(status);
              const today = isToday(day);
              
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    today && styles.todayCell,
                  ]}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayText,
                    today && styles.todayText,
                  ]}>
                    {day}
                  </Text>
                  {status && (
                    <View 
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor }
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>All Prayed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#60A5FA' }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Some Late</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Missed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Day Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedDate?.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <View style={styles.dayNavigation}>
                      <TouchableOpacity onPress={goToPreviousDay} style={styles.dayNavButton}>
                        <ArrowLeft size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={goToNextDay} style={styles.dayNavButton}>
                        <ArrowRight size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {PRAYERS.map((prayer) => {
                    const dayData = getSelectedDateData();
                    const prayerData = dayData[prayer.id];
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const selectedDateStr = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';
                    const isToday = selectedDateStr === todayStr;
                    
                    return (
                      <View key={prayer.id} style={styles.prayerDetail}>
                        <View style={styles.prayerDetailHeader}>
                          <View style={styles.prayerInfo}>
                            <Text style={styles.prayerDetailName}>{prayer.name}</Text>
                            <Text style={styles.prayerDetailArabic}>{prayer.arabicName}</Text>
                          </View>
                          <View style={styles.prayerActions}>
                            {prayerData?.status && (
                              <View 
                                style={[
                                  styles.statusBadge,
                                  { backgroundColor: 
                                    prayerData.status === 'prayed' ? '#10B981' :
                                    prayerData.status === 'late' ? '#F59E0B' :
                                    '#EF4444'
                                  }
                                ]}
                              >
                                {prayerData.status === 'prayed' && <Check size={14} color="white" />}
                                {prayerData.status === 'late' && <Clock size={14} color="white" />}
                                {prayerData.status === 'missed' && <X size={14} color="white" />}
                                <Text style={styles.statusBadgeText}>
                                  {prayerData.status.charAt(0).toUpperCase() + prayerData.status.slice(1)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        
                        {/* Status Buttons */}
                        <View style={styles.statusButtonsModal}>
                            <TouchableOpacity
                              style={[
                                styles.statusButtonModal,
                                prayerData?.status === 'prayed' && { backgroundColor: '#10B981' },
                              ]}
                              onPress={() => handlePrayerStatusChange(prayer.id, 'prayed')}
                            >
                              <Check size={16} color={prayerData?.status === 'prayed' ? 'white' : '#6B7280'} />
                              <Text style={[
                                styles.statusButtonModalText,
                                prayerData?.status === 'prayed' && { color: 'white' }
                              ]}>Prayed</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[
                                styles.statusButtonModal,
                                prayerData?.status === 'late' && { backgroundColor: '#F59E0B' },
                              ]}
                              onPress={() => handlePrayerStatusChange(prayer.id, 'late')}
                            >
                              <Clock size={16} color={prayerData?.status === 'late' ? 'white' : '#6B7280'} />
                              <Text style={[
                                styles.statusButtonModalText,
                                prayerData?.status === 'late' && { color: 'white' }
                              ]}>Late</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[
                                styles.statusButtonModal,
                                prayerData?.status === 'missed' && { backgroundColor: '#EF4444' },
                              ]}
                              onPress={() => handlePrayerStatusChange(prayer.id, 'missed')}
                            >
                              <X size={16} color={prayerData?.status === 'missed' ? 'white' : '#6B7280'} />
                              <Text style={[
                                styles.statusButtonModalText,
                                prayerData?.status === 'missed' && { color: 'white' }
                              ]}>Missed</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Comment Section */}
                        <View style={styles.commentSection}>
                          {editingPrayer === prayer.id ? (
                            <View style={styles.commentEditContainer}>
                              <TextInput
                                style={styles.commentInput}
                                placeholder="Add a note..."
                                placeholderTextColor="#9CA3AF"
                                value={tempComment}
                                onChangeText={setTempComment}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                              />
                              <View style={styles.commentButtons}>
                                <TouchableOpacity 
                                  style={styles.commentCancelButton}
                                  onPress={() => setEditingPrayer(null)}
                                >
                                  <Text style={styles.commentCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={styles.commentSaveButton}
                                  onPress={saveComment}
                                >
                                  <Text style={styles.commentSaveText}>Save</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity 
                              style={styles.commentDisplay}
                              onPress={() => handleEditComment(prayer.id)}
                            >
                              {prayerData?.comment ? (
                                <View style={styles.commentWithText}>
                                  <MessageSquare size={16} color="#6B7280" />
                                  <Text style={styles.prayerComment}>{prayerData.comment}</Text>
                                  <Edit3 size={14} color="#9CA3AF" />
                                </View>
                              ) : (
                                <View style={styles.commentPlaceholder}>
                                  <MessageSquare size={16} color="#D1D5DB" />
                                  <Text style={styles.commentPlaceholderText}>Add a note...</Text>
                                  <Edit3 size={14} color="#D1D5DB" />
                                </View>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
        </KeyboardAvoidingView>
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
    fontWeight: '800' as const,
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
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 32,
    borderRadius: 20,
    padding: 20,
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
  },
  monthTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E293B',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    gap: 4,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#059669',
  },
  statsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  statsToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
  },
  statsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748B',
    textTransform: 'uppercase' as const,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  todayText: {
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 8,
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#64748B',
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginBottom: 8,
  },
  dayNavigation: {
    flexDirection: 'row',
    gap: 8,
  },
  dayNavButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  prayerInfo: {
    flex: 1,
  },
  prayerActions: {
    alignItems: 'flex-end',
  },
  statusButtonsModal: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  statusButtonModal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  statusButtonModalText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  commentSection: {
    marginTop: 8,
  },
  commentEditContainer: {
    gap: 12,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  commentCancelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  commentCancelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  commentSaveButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  commentSaveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  commentDisplay: {
    minHeight: 40,
    justifyContent: 'center',
  },
  commentWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  commentPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed' as const,
  },
  commentPlaceholderText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    fontStyle: 'italic' as const,
  },
  modalScroll: {
    padding: 24,
  },
  prayerDetail: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  prayerDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerDetailName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  prayerDetailArabic: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  prayerComment: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});