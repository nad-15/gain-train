import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, Template, CustomWorkoutType, WeightLog } from '../types';

const KEYS = {
  WORKOUTS: 'workouts',
  TEMPLATES: 'templates',
  CUSTOM_WORKOUT_TYPES: 'customWorkoutTypes',
  WEIGHT_LOGS: 'weightLogs',
  CALENDAR_TEXT_MODE: 'calendarTextMode',
  DETAILS_EXPANDED: 'isDetailsExpanded',
  CURRENT_GRAPH_TYPE: 'currentGraphType',
};

export const storageService = {
  async getWorkouts(): Promise<Workout[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  async getTemplates(): Promise<Record<string, Template[]>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TEMPLATES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async saveTemplates(templates: Record<string, Template[]>): Promise<void> {
    await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },

  async getCustomWorkoutTypes(): Promise<CustomWorkoutType[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CUSTOM_WORKOUT_TYPES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveCustomWorkoutTypes(types: CustomWorkoutType[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CUSTOM_WORKOUT_TYPES, JSON.stringify(types));
  },

  async getWeightLogs(): Promise<WeightLog[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WEIGHT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveWeightLogs(logs: WeightLog[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WEIGHT_LOGS, JSON.stringify(logs));
  },

  async getCalendarTextMode(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(KEYS.CALENDAR_TEXT_MODE);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setCalendarTextMode(value: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.CALENDAR_TEXT_MODE, value ? 'true' : 'false');
  },

  async getGraphType(): Promise<'workouts' | 'weight'> {
    try {
      const val = await AsyncStorage.getItem(KEYS.CURRENT_GRAPH_TYPE);
      return (val as 'workouts' | 'weight') || 'workouts';
    } catch {
      return 'workouts';
    }
  },

  async setGraphType(value: 'workouts' | 'weight'): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_GRAPH_TYPE, value);
  },
};
