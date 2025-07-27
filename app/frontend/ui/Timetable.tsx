import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  TeacherChangesByDate,
  useSubstitutions,
} from '../hooks/useSubstitutions';
import { PossibleUserType, TimetableLesson } from '@repo/types/index';
import { useTimetable } from '../hooks/useTimetable';
import Alert from './Alert';
import Text from './Text';
import useDynamicColors from '../hooks/useDynamicColors';

function extendLessonWithSubstitutions(
  lesson: TimetableLesson,
  substitutions: TeacherChangesByDate
): TimetableLesson {
  function getSlot0ByDate(date: string) {
    const weekday: 'h' | 'k' | 's' | 'c' | 'p' = new Date(date)
      .toLocaleDateString('hu-HU', { weekday: 'narrow' })
      .toLocaleLowerCase()[0] as any;
    return weekday;
  }

  const allChanges = Object.values(substitutions).flatMap((changes) =>
    changes.flatMap((change) => change.changes)
  );

  const lessonChanges = allChanges.filter(
    (change) =>
      lesson.slot.startsWith(getSlot0ByDate(change.date)) &&
      lesson.slot[1] === change.period &&
      lesson.code === change.group
  );
  if (lessonChanges.length !== 1) return lesson;
  lesson.isSubstitution = true;
  if (lessonChanges[0].replacementTeacher)
    lesson.substitutionTeacher = lessonChanges[0].replacementTeacher;
  else lesson.substitutionTeacher = lessonChanges[0].comment;

  return lesson;
}

const Timetable = ({ selfUser }: { selfUser: PossibleUserType }) => {
  if (!selfUser) return null;
  const studentCode = selfUser.EJG_code;

  const { tableData: substitutions, isLoaded } = useSubstitutions();
  const {
    timetable,
    isLoading,
    isError,
    selectedDay,
    setSelectedDay,
    days,
    isConfigured,
  } = useTimetable({ studentCode });
  const colors = useDynamicColors();

  if (isConfigured === null || !isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 120,
        }}
      >
        <ActivityIndicator size="large" color="#6d1213" />
      </View>
    );
  }

  if (!isConfigured) {
    return (
      <Alert
        style={{
          backgroundColor: '#dbeafe',
          borderColor: '#93c5fd',
        }}
      >
        Hiányos adatok. Kérjük, add meg a hiányzó adataidat a profilodban, a
        Személyes adatok fülnél.
      </Alert>
    );
  }

  const renderLesson = (lesson: TimetableLesson, period: number) => {
    if (lesson.code === '-') return null;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <Text
          style={{
            width: 24,
            fontWeight: 'bold',
            color: colors.onSecondaryContainer,
            fontSize: 16,
          }}
        >
          {period}.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 15 }}>
            {lesson.subject_name}{' '}
            {lesson.isSubstitution ? (
              <Text style={{ color: colors.error }}>
                ({lesson.substitutionTeacher})
              </Text>
            ) : (
              <Text
                style={{
                  color: colors.onSecondaryContainer,
                  fontWeight: '300',
                }}
              >
                ({lesson.teacher})
              </Text>
            )}
          </Text>
          <Text style={{ marginLeft: 6, fontWeight: '500' }}>
            {lesson.room}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        borderRadius: 16,
        paddingVertical: 12,
        maxWidth: 400,
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={{
              borderRadius: 8,
              paddingHorizontal: 16,
              height: 32,
              justifyContent: 'center',
              borderWidth: 1,
              borderColor:
                selectedDay !== day
                  ? colors.outlineVariant
                  : colors.secondaryContainer,
              backgroundColor:
                selectedDay === day ? colors.secondaryContainer : undefined,
            }}
          >
            <Text
              style={{
                color:
                  selectedDay === day
                    ? colors.onSecondaryContainer
                    : colors.onSurface,
                fontWeight: '600',
              }}
            >
              {day.slice(0, 2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 120,
          }}
        >
          <ActivityIndicator size="large" color="#6d1213" />
        </View>
      )}

      {isError && (
        <Alert
          style={{
            backgroundColor: '#fee2e2',
            borderColor: '#fca5a5',
          }}
        >
          <Text>
            Hiba történt az órarend betöltése közben. Kérjük, próbáld újra
            később. {isError.message}
          </Text>
        </Alert>
      )}

      {timetable ? (
        <View
          style={{
            backgroundColor: colors.secondaryContainer,
            borderRadius: 8,
            padding: 8,
            gap: 8,
          }}
        >
          {timetable[selectedDay] &&
            Object.entries(timetable[selectedDay]).map(
              ([period, lesson]: [any, any]) =>
                lesson.code !== '-' && (
                  <View key={period}>
                    {renderLesson(
                      extendLessonWithSubstitutions(lesson, substitutions),
                      parseInt(period)
                    )}
                  </View>
                )
            )}

          {timetable[selectedDay] &&
            Object.values(timetable[selectedDay]).every(
              (lesson) => lesson.code === '-'
            ) && (
              <Alert
                style={{
                  backgroundColor: '#fef9c3',
                  borderColor: '#facc15',
                }}
              >
                Nincs óra ezen a napon.
              </Alert>
            )}
        </View>
      ) : null}

      {!timetable && !isError && !isLoading && (
        <Alert
          style={{
            backgroundColor: '#fef9c3',
            borderColor: '#facc15',
          }}
        >
          Nem található órarend.
        </Alert>
      )}
    </View>
  );
};

export default Timetable;
