import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExerciseItem } from '../types';
import { DEFAULT_TEMPLATES } from '../services/workoutUtils';
import { theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (exercise: ExerciseItem) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { customWorkoutTypes } = useWorkout();
  const [activeTab, setActiveTab] = useState<string>('push');
  const [name, setName] = useState<string>('');
  const [sets, setSets] = useState<string>('3');
  const [reps, setReps] = useState<string>('10');
  const [weight, setWeight] = useState<string>('0');
  const [isBodyweight, setIsBodyweight] = useState<boolean>(false);

  const categories = [
    { key: 'push', label: 'Push' },
    { key: 'pull', label: 'Pull' },
    { key: 'legs', label: 'Legs' },
    { key: 'upper', label: 'Upper' },
    { key: 'lower', label: 'Lower' },
    { key: 'whole', label: 'Whole' },
    ...customWorkoutTypes.map((c) => ({ key: c.id, label: c.name })),
  ];

  const getExercisesForTab = (): string[] => {
    if (DEFAULT_TEMPLATES[activeTab]) {
      return DEFAULT_TEMPLATES[activeTab];
    }
    const custom = customWorkoutTypes.find((c) => c.id === activeTab);
    return custom ? custom.exercises.map((e) => e.name) : [];
  };

  const handleSelectPreset = (presetName: string) => {
    setName(presetName);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      sets: parseInt(sets, 10) || 1,
      reps: parseInt(reps, 10) || 1,
      weight: isBodyweight ? 0 : parseFloat(weight) || 0,
      isBodyweight,
      notes: '',
      rest: 60,
    });
    setName('');
    setSets('3');
    setReps('10');
    setWeight('0');
    setIsBodyweight(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Exercise</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.tab, activeTab === cat.key && styles.activeTab]}
                onPress={() => setActiveTab(cat.key)}
              >
                <Text style={[styles.tabText, activeTab === cat.key && styles.activeTabText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.body}>
            <Text style={styles.label}>Exercise Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bench Press"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Quick Select Preset</Text>
            <View style={styles.presetGrid}>
              {getExercisesForTab().map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetChip, name === preset && styles.presetChipActive]}
                  onPress={() => handleSelectPreset(preset)}
                >
                  <Text
                    style={[styles.presetText, name === preset && styles.presetTextActive]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={sets}
                  onChangeText={setSets}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={reps}
                  onChangeText={setReps}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={[styles.input, isBodyweight && styles.disabledInput]}
                  keyboardType="numeric"
                  editable={!isBodyweight}
                  value={isBodyweight ? '0' : weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Bodyweight Exercise</Text>
              <Switch
                value={isBodyweight}
                onValueChange={setIsBodyweight}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Add Exercise</Text>
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
    maxHeight: '85%',
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
  tabBar: {
    flexGrow: 0,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  activeTabText: {
    color: '#fff',
  },
  body: {
    maxHeight: 320,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.text,
  },
  disabledInput: {
    backgroundColor: '#f1f3f5',
    color: theme.textMuted,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
  },
  presetChipActive: {
    borderColor: theme.primary,
    backgroundColor: '#ebffed',
  },
  presetText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  presetTextActive: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
