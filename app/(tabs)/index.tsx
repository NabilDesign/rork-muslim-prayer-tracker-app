import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Clock, MessageSquare, ChevronRight } from 'lucide-react-native';
import { useAppStore } from '@/src/store/app-store';
import { getHadithOfTheDay } from '@/src/data/hadiths';

const PRAYERS = [
  { id: 'fajr', name: 'Fajr', arabicName: 'الفجر' },
  { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر' },
  { id: 'asr', name: 'Asr', arabicName: 'العصر' },
  { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب' },
  { id: 'isha', name: 'Isha', arabicName: 'العشاء' },
];

type PrayerStatus = 'prayed' | 'late' | 'missed' | null;

export default function TodayScreen() {
  const { 
    prayerData,
    updatePrayerStatus,
    addPrayerComment,
    getTodaysPrayers,
  } = useAppStore();
  
  const [hadith, setHadith] = useState({ text: '', narrator: '' });
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [tempComment, setTempComment] = useState('');
  const [animatedValues] = useState(() => 
    PRAYERS.reduce((acc, prayer) => {
      acc[prayer.id] = new Animated.Value(0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );
  
  const todaysPrayers = getTodaysPrayers();

  useEffect(() => {
    setHadith(getHadithOfTheDay());
  }, []);

  const handleStatusChange = (prayerId: string, status: PrayerStatus) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const currentStatus = todaysPrayers[prayerId]?.status;
    
    console.log(`Updating prayer status for today: ${todayStr}`);
    
    if (currentStatus === status) {
      updatePrayerStatus(prayerId, null, todayStr);
    } else {
      updatePrayerStatus(prayerId, status, todayStr);
      
      // Animate the selection
      Animated.sequence([
        Animated.timing(animatedValues[prayerId], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues[prayerId], {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      if (status === 'prayed' || status === 'late') {
        setTimeout(() => {
          setSelectedPrayer(prayerId);
          setTempComment(todaysPrayers[prayerId]?.comment || '');
          setCommentModalVisible(true);
        }, 300);
      }
    }
  };

  const saveComment = () => {
    if (selectedPrayer) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      addPrayerComment(selectedPrayer, tempComment, todayStr);
    }
    setCommentModalVisible(false);
    setSelectedPrayer(null);
    setTempComment('');
  };

  const getStatusColor = (status: PrayerStatus) => {
    switch (status) {
      case 'prayed': return '#10B981';
      case 'late': return '#F59E0B';
      case 'missed': return '#EF4444';
      default: return '#E5E7EB';
    }
  };

  const getStatusIcon = (status: PrayerStatus) => {
    switch (status) {
      case 'prayed': return <Check size={18} color="white" />;
      case 'late': return <Clock size={18} color="white" />;
      case 'missed': return <X size={18} color="white" />;
      default: return null;
    }
  };

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
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Prayers */}
        <View style={styles.prayersSection}>
          <Text style={styles.sectionTitle}>Today's Prayers</Text>
          {PRAYERS.map((prayer) => {
            const prayerStatus = todaysPrayers[prayer.id];
            const animatedScale = animatedValues[prayer.id].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
            });
            
            return (
              <Animated.View 
                key={prayer.id} 
                style={[
                  styles.prayerCard,
                  { transform: [{ scale: animatedScale }] }
                ]}
              >
                <View style={styles.prayerHeader}>
                  <View>
                    <Text style={styles.prayerName}>{prayer.name}</Text>
                    <Text style={styles.prayerArabic}>{prayer.arabicName}</Text>
                  </View>
                  {prayerStatus?.comment && (
                    <View style={styles.commentIndicator}>
                      <MessageSquare size={16} color="#9CA3AF" />
                    </View>
                  )}
                </View>
                
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      prayerStatus?.status === 'prayed' && [
                        styles.statusButtonActive,
                        { backgroundColor: getStatusColor('prayed') },
                      ],
                    ]}
                    onPress={() => handleStatusChange(prayer.id, 'prayed')}
                    activeOpacity={0.7}
                  >
                    {prayerStatus?.status === 'prayed' ? (
                      getStatusIcon('prayed')
                    ) : (
                      <Text style={styles.statusButtonText}>Prayed</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      prayerStatus?.status === 'late' && [
                        styles.statusButtonActive,
                        { backgroundColor: getStatusColor('late') },
                      ],
                    ]}
                    onPress={() => handleStatusChange(prayer.id, 'late')}
                    activeOpacity={0.7}
                  >
                    {prayerStatus?.status === 'late' ? (
                      getStatusIcon('late')
                    ) : (
                      <Text style={styles.statusButtonText}>Late</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      prayerStatus?.status === 'missed' && [
                        styles.statusButtonActive,
                        { backgroundColor: getStatusColor('missed') },
                      ],
                    ]}
                    onPress={() => handleStatusChange(prayer.id, 'missed')}
                    activeOpacity={0.7}
                  >
                    {prayerStatus?.status === 'missed' ? (
                      getStatusIcon('missed')
                    ) : (
                      <Text style={styles.statusButtonText}>Missed</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {prayerStatus?.comment ? (
                  <TouchableOpacity 
                    style={styles.commentSection}
                    onPress={() => {
                      setSelectedPrayer(prayer.id);
                      setTempComment(prayerStatus.comment);
                      setCommentModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.commentText} numberOfLines={2}>
                      {prayerStatus.comment}
                    </Text>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </Animated.View>
            );
          })}
        </View>

        {/* Hadith of the Day */}
        <View style={styles.hadithCard}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.hadithGradient}
          >
            <Text style={styles.hadithTitle}>Hadith of the Day</Text>
            <Text style={styles.hadithText}>"{hadith.text}"</Text>
            <Text style={styles.hadithNarrator}>- {hadith.narrator}</Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCommentModalVisible(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Note</Text>
                  <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a note about this prayer..."
                  placeholderTextColor="#9CA3AF"
                  value={tempComment}
                  onChangeText={setTempComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setCommentModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={saveComment}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
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
    fontWeight: '800' as const,
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
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC',
  },
  prayersSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1E293B',
    marginBottom: 2,
  },
  prayerArabic: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  commentIndicator: {
    padding: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  statusButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  commentText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  hadithCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  hadithGradient: {
    padding: 24,
  },
  hadithTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  hadithText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic' as const,
  },
  hadithNarrator: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500' as const,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});