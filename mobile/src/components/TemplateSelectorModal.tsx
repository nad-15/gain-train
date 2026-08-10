import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Template } from '../types';
import { WORKOUT_COLORS, theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';

interface TemplateSelectorModalProps {
  visible: boolean;
  workoutType: string;
  onClose: () => void;
  onSelectTemplate: (template: Template | null) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  visible,
  workoutType,
  onClose,
  onSelectTemplate,
}) => {
  const { templates, customWorkoutTypes, deleteTemplate } = useWorkout();

  const getDisplayName = (type: string) => {
    const custom = customWorkoutTypes.find((c) => c.id === type);
    if (custom) return custom.name;
    if (type === 'warmup') return 'Warm-up';
    if (type === 'cooldown') return 'Cool-down';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getBadgeColor = (type: string) => {
    const custom = customWorkoutTypes.find((c) => c.id === type);
    if (custom) return custom.color;
    return WORKOUT_COLORS[type] || theme.primary;
  };

  const categoryTemplates = templates[workoutType] || [];
  const displayName = getDisplayName(workoutType);
  const badgeColor = getBadgeColor(workoutType);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.colorDot, { backgroundColor: badgeColor }]} />
              <Text style={styles.title}>Select {displayName} Template</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                onClose();
                onSelectTemplate(null);
              }}
            >
              <MaterialCommunityIcons name="plus" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            <TouchableOpacity
              style={[styles.templateCard, { borderColor: badgeColor }]}
              onPress={() => {
                onClose();
                onSelectTemplate(null);
              }}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Default {displayName} Routine</Text>
                <Text style={styles.cardSub}>Standard exercises & default sets</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textMuted} />
            </TouchableOpacity>

            {categoryTemplates.map((tpl, index) => (
              <View key={tpl.name + index} style={styles.userTemplateRow}>
                <TouchableOpacity
                  style={styles.userTemplateCard}
                  onPress={() => {
                    onClose();
                    onSelectTemplate(tpl);
                  }}
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{tpl.name}</Text>
                    <Text style={styles.cardSub}>
                      {tpl.exercises?.length || 0} exercises saved
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteTplBtn}
                  onPress={() => deleteTemplate(workoutType, tpl.name)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
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
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  addBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#edf2ff',
  },
  list: {
    marginBottom: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: theme.background,
    marginBottom: 12,
  },
  userTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  userTemplateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
  },
  deleteTplBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  cardSub: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
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
