import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  label: string;
  isActive: boolean;
  onToggle: () => void;
};

const PillSelector = ({ label, isActive, onToggle }: Props) => {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        isActive ? styles.pillActive : styles.pillInactive
      ]}
      onPress={onToggle}
    >
      <Text
        style={[
          styles.pillText,
          isActive ? styles.pillTextActive : styles.pillTextInactive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillInactive: {
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  pillActive: {
    borderColor: '#facc15', // yellow-400
    backgroundColor: '#fef08a', // yellow-200
  },
  pillText: {
    fontWeight: '700',
    fontSize: 14,
  },
  pillTextInactive: {
    color: '#475569',
  },
  pillTextActive: {
    color: '#1e293b', // darker text when active
  },
});

export default PillSelector;
