import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { Check, Clock, X, Plus, Edit3 } from 'lucide-react-native';
import { Prayer } from '@/src/store/app-store';

interface PrayerCardProps {
  prayer: Prayer;
  icon: React.ComponentType<any>;
  onMarkPrayer?: (prayerName: string, status: 'on-time' | 'late' | 'missed') => void;
  onAddNote?: (prayerName: string, note: string) => void;
  readonly?: boolean;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  icon: Icon,
  onMarkPrayer,
  onAddNote,
  readonly = false,
}) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState(prayer.note || '');

  const [scaleAnim] = useState(new Animated.Value(1));

  const getStatusColor = () => {
    switch (prayer.status) {
      case 'on-time': return '#059669';
      case 'late': return '#D97706';
      case 'missed': return '#DC2626';
      default: return '#64748B';
    }
  };



  const getStatusIcon = () => {
    switch (prayer.status) {
      case 'on-time': return <Check color="#FFFFFF" size={16} />;
      case 'late': return <Clock color="#FFFFFF" size={16} />;
      case 'missed': return <X color="#FFFFFF" size={16} />;
      default: return null;
    }
  };

  const handleMarkPrayer = (status: 'on-time' | 'late' | 'missed') => {
    if (!onMarkPrayer || readonly) return;
    
    // Add a subtle animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onMarkPrayer(prayer.name, status);
  };



  const handleSaveNote = () => {
    if (!onAddNote || readonly) {
      setShowNoteModal(false);
      return;
    }
    onAddNote(prayer.name, noteText);
    setShowNoteModal(false);
  };

  const openNoteModal = () => {
    setNoteText(prayer.note || '');
    setShowNoteModal(true);
  };



  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <View style={styles.header}>
          <View style={styles.prayerInfo}>
            <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
              <Icon color={getStatusColor()} size={24} />
            </View>
            <View style={styles.prayerDetails}>
              <Text style={styles.prayerName}>{prayer.name}</Text>
            </View>
          </View>
          
          <View style={styles.actions}>
            {prayer.status !== 'pending' && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                {getStatusIcon()}
              </View>
            )}
            
            {!readonly && (
              <TouchableOpacity
                style={[styles.noteButton, prayer.note && styles.noteButtonActive]}
                onPress={openNoteModal}
              >
                {prayer.note ? (
                  <Edit3 color="#2D5016" size={18} />
                ) : (
                  <Plus color="#9CA3AF" size={18} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {prayer.note && (
          <TouchableOpacity 
            style={styles.noteContainer}
            onPress={readonly ? undefined : openNoteModal}
            activeOpacity={readonly ? 1 : 0.7}
            disabled={readonly}
          >
            <Text style={styles.noteText}>{prayer.note}</Text>
            {!readonly && <Text style={styles.tapToEdit}>Tap to edit</Text>}
          </TouchableOpacity>
        )}

        {!readonly && (
          <View style={styles.actionSection}>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[
                  styles.quickActionButton, 
                  styles.onTimeButton,
                  prayer.status === 'on-time' && styles.selectedButton
                ]}
                onPress={() => handleMarkPrayer('on-time')}
                activeOpacity={0.8}
              >
                <Check color="#FFFFFF" size={16} />
                <Text style={styles.quickActionText}>On Time</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.quickActionButton, 
                  styles.lateButton,
                  prayer.status === 'late' && styles.selectedButton
                ]}
                onPress={() => handleMarkPrayer('late')}
                activeOpacity={0.8}
              >
                <Clock color="#FFFFFF" size={16} />
                <Text style={styles.quickActionText}>Late</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.quickActionButton, 
                  styles.missedButton,
                  prayer.status === 'missed' && styles.selectedButton
                ]}
                onPress={() => handleMarkPrayer('missed')}
                activeOpacity={0.8}
              >
                <X color="#FFFFFF" size={16} />
                <Text style={styles.quickActionText}>Missed</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      <Modal
        visible={showNoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowNoteModal(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{readonly ? 'Prayer Note' : 'Add Note'}</Text>
            {!readonly && (
              <TouchableOpacity 
                onPress={handleSaveNote}
                style={styles.modalButton}
              >
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            )}
            {readonly && <View style={styles.modalButton} />}
          </View>
          
          <View style={styles.modalContent}>
            {!readonly && (
              <Text style={styles.modalSubtitle}>How was your {prayer.name} prayer?</Text>
            )}
            <TextInput
              style={[styles.noteInput, readonly && styles.readonlyInput]}
              placeholder={readonly ? "No note added" : "e.g., Prayed at the mosque, felt peaceful, rushed due to meeting..."}
              value={noteText}
              onChangeText={readonly ? undefined : setNoteText}
              multiline
              textAlignVertical="top"
              autoFocus={!readonly}
              maxLength={200}
              editable={!readonly}
            />
            {!readonly && (
              <Text style={styles.characterCount}>{noteText.length}/200</Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  prayerDetails: {
    flex: 1,
  },
  prayerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.3,
  },


  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  noteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteButtonActive: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noteContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  tapToEdit: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  onTimeButton: {
    backgroundColor: '#10B981',
  },
  lateButton: {
    backgroundColor: '#F59E0B',
  },
  missedButton: {
    backgroundColor: '#EF4444',
  },
  selectedButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },



  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 22,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  readonlyInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    color: '#6B7280',
  },
});