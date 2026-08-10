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
import { ExerciseItem } from '../types';
import { theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';

interface SaveTemplateModalProps {
  visible: boolean;
  category: string;
  exercises: ExerciseItem[];
  onClose: () => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  visible,
  category,
  exercises,
  onClose,
}) => {
  const { addTemplate } = useWorkout();
  const [templateName, setTemplateName] = useState('');

  const handleSave = async () => {
    const finalName = templateName.trim() || `${category.toUpperCase()} Template`;
    await addTemplate({
      name: finalName,
      category,
      exercises,
    });
    setTemplateName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Save as Template</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Template Name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Heavy Push Day, Volume Pull"
            placeholderTextColor={theme.textMuted}
            value={templateName}
            onChangeText={setTemplateName}
          />

          <Text style={styles.subText}>
            Saving {exercises.length} exercise(s) under category "{category.toUpperCase()}"
          </Text>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>Save Template</Text>
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
  },
  subText: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 10,
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
