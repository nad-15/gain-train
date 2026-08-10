import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { getAllExerciseData, calculatePersonalBest } from '../services/workoutUtils';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseHistoryModalProps {
  visible: boolean;
  exerciseName: string;
  onClose: () => void;
}

export const ExerciseHistoryModal: React.FC<ExerciseHistoryModalProps> = ({
  visible,
  exerciseName,
  onClose,
}) => {
  const { workouts, mergeExerciseNames } = useWorkout();
  const [showMerge, setShowMerge] = useState(false);
  const [targetName, setTargetName] = useState('');

  const history = getAllExerciseData(workouts, exerciseName);
  const pb = calculatePersonalBest(workouts, exerciseName);

  const handleMerge = async () => {
    if (!targetName.trim() || targetName.trim().toLowerCase() === exerciseName.trim().toLowerCase()) {
      return;
    }
    await mergeExerciseNames(exerciseName, targetName.trim());
    setShowMerge(false);
    setTargetName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{exerciseName} History</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* PB Banner */}
          <View style={styles.pbCard}>
            <View style={styles.pbItem}>
              <Text style={styles.pbLabel}>Max Weight</Text>
              <Text style={styles.pbValue}>{pb.maxWeight} kg</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pbItem}>
              <Text style={styles.pbLabel}>Max Volume</Text>
              <Text style={styles.pbValue}>{pb.maxVolume} kg</Text>
            </View>
          </View>

          {/* Merge Option Toggle */}
          {!showMerge ? (
            <TouchableOpacity style={styles.mergeToggle} onPress={() => setShowMerge(true)}>
              <MaterialCommunityIcons name="call-merge" size={18} color={theme.primary} />
              <Text style={styles.mergeToggleText}>Merge / Rename Exercise</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.mergeContainer}>
              <Text style={styles.mergeLabel}>Rename "{exerciseName}" to:</Text>
              <View style={styles.mergeRow}>
                <TextInput
                  style={styles.mergeInput}
                  placeholder="Target exercise name"
                  placeholderTextColor={theme.textMuted}
                  value={targetName}
                  onChangeText={setTargetName}
                />
                <TouchableOpacity style={styles.mergeConfirmBtn} onPress={handleMerge}>
                  <Text style={styles.mergeConfirmText}>Merge</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView style={styles.historyList}>
            {history.length === 0 ? (
              <Text style={styles.emptyText}>No previous logs found for this exercise.</Text>
            ) : (
              history.map((record, i) => (
                <View key={record.workoutId + '_' + i} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {record.date.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.historyType}>{record.workoutType.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.historyStats}>
                    {record.sets} sets × {record.reps} reps @{' '}
                    {record.isBodyweight ? 'Bodyweight' : `${record.weight} kg`}
                  </Text>
                  {record.notes ? (
                    <Text style={styles.historyNotes}>Note: {record.notes}</Text>
                  ) : null}
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
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
    maxHeight: '85%',
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
  pbCard: {
    flexDirection: 'row',
    backgroundColor: '#ebffed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#b7eb8f',
  },
  pbItem: {
    flex: 1,
    alignItems: 'center',
  },
  pbLabel: {
    fontSize: 12,
    color: '#276749',
    fontWeight: '600',
  },
  pbValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2da44e',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#b7eb8f',
  },
  mergeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#edf2ff',
    alignSelf: 'flex-start',
  },
  mergeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  mergeContainer: {
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  mergeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  mergeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mergeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: theme.text,
  },
  mergeConfirmBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  mergeConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.textMuted,
    marginVertical: 20,
  },
  historyCard: {
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
  },
  historyType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.primary,
  },
  historyStats: {
    fontSize: 14,
    color: theme.text,
    marginTop: 2,
  },
  historyNotes: {
    fontSize: 12,
    color: theme.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
  },
});
