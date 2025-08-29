import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Edit3, Trash2, Calendar } from 'lucide-react-native';
import { Reflection } from '@/src/store/app-store';

interface ReflectionCardProps {
  reflection: Reflection;
  onEdit: (reflection: Reflection) => void;
  onDelete: (id: string) => void;
}

export const ReflectionCard: React.FC<ReflectionCardProps> = ({
  reflection,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this reflection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(reflection.id) },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{reflection.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(reflection)}
          >
            <Edit3 color="#6B7280" size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Trash2 color="#EF4444" size={16} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.content} numberOfLines={3}>
        {reflection.content}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Calendar color="#9CA3AF" size={12} />
          <Text style={styles.date}>{formatDate(reflection.createdAt)}</Text>
        </View>
        {reflection.updatedAt !== reflection.createdAt && (
          <Text style={styles.updated}>Updated</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  updated: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});