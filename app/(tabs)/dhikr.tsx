import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Plus, Edit3, Trash2, Play, Pause, RotateCcw, Check } from 'lucide-react-native';
import { useDhikrStore } from '@/src/store/dhikr-store';

interface DhikrItem {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  count: number;
  category: string;
}

const AVAILABLE_DHIKR: DhikrItem[] = [
  {
    id: '1',
    text: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    count: 33,
    category: 'Tasbih'
  },
  {
    id: '2',
    text: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'Praise be to Allah',
    count: 33,
    category: 'Tahmid'
  },
  {
    id: '3',
    text: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    count: 34,
    category: 'Takbir'
  },
  {
    id: '4',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illa Allah',
    translation: 'There is no god but Allah',
    count: 100,
    category: 'Tahlil'
  },
  {
    id: '5',
    text: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    count: 100,
    category: 'Istighfar'
  },
  {
    id: '6',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhan Allahi wa bihamdihi',
    translation: 'Glory be to Allah and praise Him',
    count: 100,
    category: 'Tasbih'
  },
  {
    id: '7',
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no power except with Allah',
    count: 100,
    category: 'Hawqala'
  },
  {
    id: '8',
    text: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbi ghfir li',
    translation: 'My Lord, forgive me',
    count: 100,
    category: 'Dua'
  },
];

export default function DhikrScreen() {
  const {
    routines,
    activeRoutine,
    currentDhikrIndex,
    currentCount,
    isActive,
    createRoutine,
    deleteRoutine,
    startRoutine,
    pauseRoutine,
    resetRoutine,
    incrementCount,
    nextDhikr,
  } = useDhikrStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [selectedDhikr, setSelectedDhikr] = useState<string[]>([]);
  const [customCounts, setCustomCounts] = useState<Record<string, number>>({});

  const handleCreateRoutine = () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (selectedDhikr.length === 0) {
      Alert.alert('Error', 'Please select at least one dhikr');
      return;
    }

    const dhikrItems = selectedDhikr.map(id => {
      const dhikr = AVAILABLE_DHIKR.find(d => d.id === id)!;
      return {
        ...dhikr,
        count: customCounts[id] || dhikr.count,
      };
    });

    createRoutine({
      name: routineName,
      dhikrList: dhikrItems,
    });

    setShowCreateModal(false);
    setRoutineName('');
    setSelectedDhikr([]);
    setCustomCounts({});
  };

  const toggleDhikrSelection = (dhikrId: string) => {
    setSelectedDhikr(prev => 
      prev.includes(dhikrId) 
        ? prev.filter(id => id !== dhikrId)
        : [...prev, dhikrId]
    );
  };

  const updateCustomCount = (dhikrId: string, count: number) => {
    setCustomCounts(prev => ({ ...prev, [dhikrId]: count }));
  };

  const currentDhikr = activeRoutine?.dhikrList[currentDhikrIndex];
  const progress = activeRoutine ? (currentDhikrIndex / activeRoutine.dhikrList.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Dhikr Routines</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>

        {activeRoutine ? (
          <View style={styles.activeRoutineContainer}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentDhikrIndex + 1} of {activeRoutine.dhikrList.length}
              </Text>
            </View>

            <View style={styles.dhikrCard}>
              <Text style={styles.dhikrArabic}>{currentDhikr?.text}</Text>
              <Text style={styles.dhikrTransliteration}>{currentDhikr?.transliteration}</Text>
              <Text style={styles.dhikrTranslation}>{currentDhikr?.translation}</Text>
              
              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                  {currentCount} / {currentDhikr?.count}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.tapButton}
                onPress={incrementCount}
              >
                <Text style={styles.tapButtonText}>TAP TO COUNT</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetRoutine}
              >
                <RotateCcw color="#6B7280" size={24} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={isActive ? pauseRoutine : () => {}}
              >
                {isActive ? (
                  <Pause color="#FFFFFF" size={24} />
                ) : (
                  <Play color="#FFFFFF" size={24} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={nextDhikr}
              >
                <Check color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Select a routine to begin</Text>
          </View>
        )}

        <View style={styles.routinesContainer}>
          <Text style={styles.sectionTitle}>My Routines</Text>
          {routines.length === 0 ? (
            <View style={styles.noRoutines}>
              <Text style={styles.noRoutinesText}>No routines created yet</Text>
              <Text style={styles.noRoutinesSubtext}>Tap the + button to create your first routine</Text>
            </View>
          ) : (
            routines.map((routine: any) => (
              <View key={routine.id} style={styles.routineCard}>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <Text style={styles.routineDetails}>
                    {routine.dhikrList.length} dhikr • {routine.dhikrList.reduce((sum: number, d: any) => sum + d.count, 0)} total
                  </Text>
                </View>
                <View style={styles.routineActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => startRoutine(routine.id)}
                  >
                    <Play color="#059669" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteRoutine(routine.id)}
                  >
                    <Trash2 color="#EF4444" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Routine</Text>
            <TouchableOpacity onPress={handleCreateRoutine}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Routine Name</Text>
              <TextInput
                style={styles.textInput}
                value={routineName}
                onChangeText={setRoutineName}
                placeholder="Enter routine name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.dhikrSelectionContainer}>
              <Text style={styles.inputLabel}>Select Dhikr</Text>
              {AVAILABLE_DHIKR.map((dhikr) => {
                const isSelected = selectedDhikr.includes(dhikr.id);
                return (
                  <View key={dhikr.id} style={styles.dhikrOption}>
                    <TouchableOpacity
                      style={[styles.dhikrCheckbox, isSelected && styles.dhikrCheckboxSelected]}
                      onPress={() => toggleDhikrSelection(dhikr.id)}
                    >
                      {isSelected && <Check color="#FFFFFF" size={16} />}
                    </TouchableOpacity>
                    
                    <View style={styles.dhikrOptionContent}>
                      <Text style={styles.dhikrOptionArabic}>{dhikr.text}</Text>
                      <Text style={styles.dhikrOptionTransliteration}>{dhikr.transliteration}</Text>
                      <Text style={styles.dhikrOptionTranslation}>{dhikr.translation}</Text>
                      
                      {isSelected && (
                        <View style={styles.countInputContainer}>
                          <Text style={styles.countLabel}>Count:</Text>
                          <TextInput
                            style={styles.countInput}
                            value={(customCounts[dhikr.id] || dhikr.count).toString()}
                            onChangeText={(text) => updateCustomCount(dhikr.id, parseInt(text) || dhikr.count)}
                            keyboardType="numeric"
                            placeholder={dhikr.count.toString()}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRoutineContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dhikrCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dhikrArabic: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 40,
  },
  dhikrTransliteration: {
    fontSize: 18,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  dhikrTranslation: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  counterContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  tapButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  tapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#059669',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  routinesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  noRoutines: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRoutinesText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  noRoutinesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  routineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  routineDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  routineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dhikrSelectionContainer: {
    marginBottom: 20,
  },
  dhikrOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dhikrCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  dhikrCheckboxSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  dhikrOptionContent: {
    flex: 1,
  },
  dhikrOptionArabic: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  dhikrOptionTransliteration: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 4,
  },
  dhikrOptionTranslation: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  countInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  countLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  countInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 80,
  },
});