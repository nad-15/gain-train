import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExerciseItem } from '../types';
import { theme } from '../theme/colors';
import {
  calculateVolume,
  compareExerciseVolume,
  getLastExerciseData,
} from '../services/workoutUtils';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseCardProps {
  exercise: ExerciseItem;
  index: number;
  onUpdate: (updated: ExerciseItem) => void;
  onDelete: () => void;
  onOpenHistory: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onUpdate,
  onDelete,
  onOpenHistory,
}) => {
  const { workouts } = useWorkout();
  const lastRecord = getLastExerciseData(workouts, exercise.name);
  const volumeComparison = compareExerciseVolume(exercise, lastRecord);
  const currentVol = calculateVolume(exercise);

  const updateField = (field: keyof ExerciseItem, value: any) => {
    onUpdate({
      ...exercise,
      [field]: value,
    });
  };

  const adjustNumber = (field: 'sets' | 'reps' | 'weight', delta: number) => {
    const current = (exercise[field] as number) || 0;
    const next = Math.max(0, current + delta);
    updateField(field, next);
  };

  return (
    <View style={styles.card}>
      {/* Exercise Card Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.titleRow} onPress={onOpenHistory}>
          <Text style={styles.name}>{exercise.name}</Text>
          <MaterialCommunityIcons name="history" size={18} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Volume comparison badge */}
      {volumeComparison.status !== 'none' && (
        <View
          style={[
            styles.volumeBadge,
            volumeComparison.status === 'increased' && styles.badgeSuccess,
            volumeComparison.status === 'decreased' && styles.badgeDanger,
            volumeComparison.status === 'same' && styles.badgeNeutral,
          ]}
        >
          <MaterialCommunityIcons
            name={
              volumeComparison.status === 'increased'
                ? 'arrow-up-bold'
                : volumeComparison.status === 'decreased'
                ? 'arrow-down-bold'
                : 'minus'
            }
            size={14}
            color={
              volumeComparison.status === 'increased'
                ? theme.success
                : volumeComparison.status === 'decreased'
                ? theme.danger
                : theme.textMuted
            }
          />
          <Text
            style={[
              styles.volumeBadgeText,
              volumeComparison.status === 'increased' && { color: theme.success },
              volumeComparison.status === 'decreased' && { color: theme.danger },
            ]}
          >
            Vol: {currentVol} kg ({volumeComparison.diff} kg vs last)
          </Text>
        </View>
      )}

      {/* Inputs for Sets, Reps, Weight */}
      <View style={styles.inputsRow}>
        {/* Sets */}
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>Sets</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustNumber('sets', -1)}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stepInput}
              keyboardType="numeric"
              value={String(exercise.sets || 0)}
              onChangeText={(v) => updateField('sets', parseInt(v, 10) || 0)}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustNumber('sets', 1)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reps */}
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>Reps</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustNumber('reps', -1)}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stepInput}
              keyboardType="numeric"
              value={String(exercise.reps || 0)}
              onChangeText={(v) => updateField('reps', parseInt(v, 10) || 0)}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustNumber('reps', 1)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weight */}
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustNumber('weight', -2.5)}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.stepInput}
              keyboardType="numeric"
              value={String(exercise.weight || 0)}
              onChangeText={(v) => updateField('weight', parseFloat(v) || 0)}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustNumber('weight', 2.5)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notes */}
      <TextInput
        style={styles.notesInput}
        placeholder="Exercise notes (e.g. form cues, seat height)"
        placeholderTextColor={theme.textMuted}
        value={exercise.notes || ''}
        onChangeText={(v) => updateField('notes', v)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  deleteBtn: {
    padding: 4,
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeSuccess: {
    backgroundColor: '#ebffed',
  },
  badgeDanger: {
    backgroundColor: '#fff5f5',
  },
  badgeNeutral: {
    backgroundColor: '#f1f3f5',
  },
  volumeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.background,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#e9ecef',
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
  },
  stepInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    paddingVertical: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.text,
  },
});
