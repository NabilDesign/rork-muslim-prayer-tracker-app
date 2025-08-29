import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, BookOpen, Calendar, Edit3 } from 'lucide-react-native';
import { usePrayerStore } from '@/src/store/app-store';
import { ReflectionCard } from '@/src/components/ReflectionCard';

export default function JourneyScreen() {
  const { reflections, addReflection, updateReflection, deleteReflection } = usePrayerStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    if (editingId) {
      updateReflection(editingId, { title: title.trim(), content: content.trim() });
    } else {
      addReflection({ title: title.trim(), content: content.trim() });
    }

    setTitle('');
    setContent('');
    setEditingId(null);
    setShowEditor(false);
  };

  const handleEdit = (reflection: any) => {
    setTitle(reflection.title);
    setContent(reflection.content);
    setEditingId(reflection.id);
    setShowEditor(true);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this reflection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteReflection(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <BookOpen color="#FFFFFF" size={32} />
          <Text style={styles.headerTitle}>Reflections</Text>
          <Text style={styles.headerSubtitle}>Document your spiritual journey</Text>
        </View>
        <View style={styles.headerDecoration}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </LinearGradient>

      {showEditor ? (
        <View style={styles.editor}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorTitle}>
              {editingId ? 'Edit Reflection' : 'New Reflection'}
            </Text>
            <View style={styles.editorActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TextInput
            style={styles.titleInput}
            placeholder="Reflection title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          
          <TextInput
            style={styles.contentInput}
            placeholder="Share your thoughts, insights, or prayers..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Reflections</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowEditor(true)}
              >
                <Plus color="#FFFFFF" size={20} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {reflections.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen color="#9CA3AF" size={48} />
                <Text style={styles.emptyTitle}>Start Your Journey</Text>
                <Text style={styles.emptySubtitle}>
                  Write your first reflection to begin documenting your spiritual growth
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setShowEditor(true)}
                >
                  <Edit3 color="#2D5016" size={16} />
                  <Text style={styles.emptyButtonText}>Write Reflection</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.reflectionsList}>
                {reflections.map((reflection) => (
                  <ReflectionCard
                    key={reflection.id}
                    reflection={reflection}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5016',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  editor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 32,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  editorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2D5016',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    marginBottom: 20,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emptyButtonText: {
    color: '#2D5016',
    fontWeight: '600',
    marginLeft: 8,
  },
  reflectionsList: {
    gap: 16,
  },
});