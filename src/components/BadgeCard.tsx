import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '@/src/store/app-store';

interface BadgeCardProps {
  badge: Badge;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  return (
    <View style={[styles.container, { borderColor: badge.color }]}>
      <Text style={styles.icon}>{badge.icon}</Text>
      <Text style={styles.title}>{badge.title}</Text>
      <Text style={styles.description}>{badge.description}</Text>
      <Text style={styles.earnedAt}>
        Earned {new Date(badge.earnedAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  earnedAt: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});