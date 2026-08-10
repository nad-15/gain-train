import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';

interface RescheduleModalProps {
  visible: boolean;
  workoutId: number | string | null;
  currentDate: string;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  workoutId,
  currentDate,
  onClose,
}) => {
  const { rescheduleWorkout } = useWorkout();
  const todayISO = new Date().toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(todayISO);

  const handleConfirm = async () => {
    if (!workoutId || !newDate.trim()) return;
    const targetISO = new Date(newDate).toISOString();
    await rescheduleWorkout(workoutId, targetISO);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Reschedule Workout</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.info}>
            Moving workout from date:{' '}
            <Text style={styles.boldDate}>{currentDate ? new Date(currentDate).toLocaleDateString() : ''}</Text>
          </Text>

          <Text style={styles.label}>Select Target Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textMuted}
            value={newDate}
            onChangeText={setNewDate}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleConfirm}>
              <Text style={styles.submitBtnText}>Confirm Move</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  info: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 16,
  },
  boldDate: {
    fontWeight: 'bold',
    color: theme.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
