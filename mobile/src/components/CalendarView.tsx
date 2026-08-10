import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { WORKOUT_COLORS, theme } from '../theme/colors';
import { useWorkout } from '../context/WorkoutContext';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const { workouts, customWorkoutTypes, weightLogs, calendarTextMode, toggleCalendarTextMode } =
    useWorkout();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getWorkoutForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workouts.find((w) => format(new Date(w.date), 'yyyy-MM-dd') === dateStr);
  };

  const getWeightForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return weightLogs.find((wl) => format(new Date(wl.date), 'yyyy-MM-dd') === dateStr);
  };

  const getBadgeColor = (type: string) => {
    const custom = customWorkoutTypes.find((c) => c.id === type);
    if (custom) return custom.color;
    return WORKOUT_COLORS[type] || theme.primary;
  };

  const daysToRender = (): Date[] => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(weekStart);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  };

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const days = daysToRender();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.calendarContainer}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleCalendarTextMode}>
            <MaterialCommunityIcons
              name={calendarTextMode ? 'format-text' : 'format-color-fill'}
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
          >
            <MaterialCommunityIcons
              name={viewMode === 'month' ? 'calendar-week' : 'calendar-month'}
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navArrow} onPress={handlePrev}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navArrow} onPress={handleNext}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Header */}
      <View style={styles.weekdayRow}>
        {weekdays.map((w) => (
          <Text key={w} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {days.map((day) => {
          const workout = getWorkoutForDate(day);
          const weightLog = getWeightForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, currentDate);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.dayCell,
                !inMonth && styles.outOfMonthCell,
                isSelected && styles.selectedCell,
                isToday && styles.todayCell,
              ]}
              onPress={() => onSelectDate(day)}
            >
              <Text
                style={[
                  styles.dayNum,
                  !inMonth && styles.outOfMonthText,
                  isSelected && styles.selectedDayNum,
                  isToday && styles.todayDayNum,
                ]}
              >
                {format(day, 'd')}
              </Text>

              {/* Workout Indicator */}
              {workout && (
                <View
                  style={[
                    styles.workoutPill,
                    { backgroundColor: getBadgeColor(workout.type) },
                  ]}
                >
                  <Text style={styles.workoutPillText} numberOfLines={1}>
                    {calendarTextMode ? workout.type.toUpperCase() : ''}
                  </Text>
                </View>
              )}

              {/* Weight Log Dot */}
              {weightLog && <View style={styles.weightDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#edf2ff',
  },
  navArrow: {
    padding: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  outOfMonthCell: {
    opacity: 0.3,
  },
  selectedCell: {
    backgroundColor: '#ebffed',
    borderWidth: 1.5,
    borderColor: theme.primary,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: '#ff922b',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },
  outOfMonthText: {
    color: theme.textMuted,
  },
  selectedDayNum: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  todayDayNum: {
    color: '#ff922b',
    fontWeight: 'bold',
  },
  workoutPill: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutPillText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  weightDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#e8590c',
    marginTop: 2,
  },
});
