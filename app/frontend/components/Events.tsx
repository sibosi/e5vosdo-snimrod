import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useEvents } from '../hooks/useEvents';
import { SideCard } from './ui/SideCard';
import { Section } from './ui/Section';
import Text from './ui/Text';
import Chip from './ui/Chip';
import useDynamicColors from '../hooks/useDynamicColors';

const shortWeekday: { [key: string]: string } = {
  hétfő: 'hétf.',
  kedd: 'kedd',
  szerda: 'szer.',
  csütörtök: 'csüt.',
  péntek: 'pént.',
  szombat: 'szom.',
  vasárnap: 'vas.',
};

const parseDateString = (dateStr: string): Date => {
  // return new Date(dateStr.replace(/-/g, '/'));
  return new Date(dateStr);
};

export const Events = ({ all = false }: { all?: boolean }) => {
  const { events, archivedEvents, futureEvents, isLoading } = useEvents(all);
  const colors = useDynamicColors();

  if (isLoading) return <Text style={styles.loadingText}>Betöltés...</Text>;
  if (!events || Object.keys(events).length === 0)
    return <Text style={styles.emptyText}>Nincs esemény</Text>;

  const sortedDates = Object.keys(events).sort(
    (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime()
  );

  const itemsToRender: Array<{
    type: 'month' | 'date';
    month?: string;
    date: string;
    key: string;
  }> = [];
  let currentMonth: string | null = null;

  sortedDates.forEach((dateKey) => {
    const eventDate = parseDateString(dateKey);
    const month = eventDate.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
    });

    if (currentMonth !== month) {
      itemsToRender.push({
        type: 'month',
        month,
        date: '',
        key: `month-${month}`,
      });
      currentMonth = month;
    }

    itemsToRender.push({
      type: 'date',
      date: dateKey,
      key: `date-${dateKey}`,
    });
  });

  const archivedItemsToRender: Array<{
    type: 'month' | 'date';
    month?: string;
    date: string;
    key: string;
  }> = [];

  if (archivedEvents) {
    let archivedCurrentMonth: string | null = null;
    const archivedSortedDates = Object.keys(archivedEvents).sort(
      (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime()
    );

    archivedSortedDates.forEach((dateKey) => {
      const eventDate = parseDateString(dateKey);
      const month = eventDate.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
      });

      if (archivedCurrentMonth !== month) {
        archivedItemsToRender.push({
          type: 'month',
          month,
          date: '',
          key: `archived-month-${month}`,
        });
        archivedCurrentMonth = month;
      }

      archivedItemsToRender.push({
        type: 'date',
        date: dateKey,
        key: `archived-date-${dateKey}`,
      });
    });
  }

  const futureItemsToRender: Array<{
    type: 'month' | 'date';
    month?: string;
    date: string;
    key: string;
  }> = [];

  if (futureEvents) {
    let futureCurrentMonth: string | null = null;
    const futureSortedDates = Object.keys(futureEvents).sort(
      (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime()
    );

    futureSortedDates.forEach((dateKey) => {
      const eventDate = parseDateString(dateKey);
      const month = eventDate.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
      });

      if (futureCurrentMonth !== month) {
        futureItemsToRender.push({
          type: 'month',
          month,
          date: '',
          key: `future-month-${month}`,
        });
        futureCurrentMonth = month;
      }

      futureItemsToRender.push({
        type: 'date',
        date: dateKey,
        key: `future-date-${dateKey}`,
      });
    });
  }

  const today = new Date();

  return (
    <ScrollView style={styles.container}>
      {all && archivedEvents && Object.keys(archivedEvents).length > 0 && (
        <Section
          title="Korábbi események"
          dropdownable
          defaultStatus="closed"
          savable={false}
          // style={styles.section}
          // titleStyle={styles.sectionTitle}
        >
          <View style={styles.eventsContainer}>
            {archivedItemsToRender.map((item) => {
              if (item.type === 'month') {
                return (
                  <View key={item.key} style={styles.monthHeader}>
                    <Text style={styles.monthText}>{item.month}</Text>
                  </View>
                );
              } else {
                const dateKey = item.date;
                const currentDateObj = parseDateString(dateKey);
                return (
                  <View key={item.key} style={styles.dateRow}>
                    <View style={styles.dateInfo}>
                      <Text style={styles.weekday}>
                        {
                          shortWeekday[
                            currentDateObj.toLocaleDateString('hu-HU', {
                              weekday: 'long',
                            })
                          ]
                        }
                      </Text>
                      <Text style={styles.dayNumber}>
                        {currentDateObj.toLocaleDateString('hu-HU', {
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.eventsColumn}>
                      {archivedEvents[dateKey].map((event) => (
                        <View
                          key={`archived-event-${event.id}`}
                          style={styles.eventItem}
                        >
                          <SideCard
                            title={
                              typeof event.title === 'object'
                                ? event.title.join(' ')
                                : event.title
                            }
                            details={event.description ?? undefined}
                            image={event.image ?? undefined}
                            popup={true}
                            makeStringToHTML={true}
                          >
                            <View style={styles.chipContainer}>
                              {event.show_time ? (
                                <Chip
                                  key={`archived-time-${event.id}`}
                                  size="sm"
                                  version="tertiary"
                                >
                                  {new Date(event.time).toLocaleTimeString(
                                    'hu-HU',
                                    {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                    }
                                  )}
                                </Chip>
                              ) : null}
                              {event.tags != undefined
                                ? event.tags.map((tag, tagIndex) => (
                                    <Chip
                                      key={`archived-tag-${event.id}-${tagIndex}`}
                                      version="primary"
                                      size="sm"
                                    >
                                      {tag}
                                    </Chip>
                                  ))
                                : null}
                            </View>
                          </SideCard>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }
            })}
          </View>
        </Section>
      )}

      {itemsToRender.map((item) => {
        if (item.type === 'month') {
          return (
            <View key={item.key} style={styles.monthHeader}>
              <Text style={styles.monthText}>{item.month}</Text>
            </View>
          );
        } else {
          const dateKey = item.date;
          const currentDateObj = parseDateString(dateKey);

          const isToday =
            currentDateObj.getFullYear() === today.getFullYear() &&
            currentDateObj.getMonth() === today.getMonth() &&
            currentDateObj.getDate() === today.getDate();

          return (
            <View key={item.key} style={styles.dateRow}>
              <View style={styles.dateInfo}>
                <Text style={styles.weekday}>
                  {
                    shortWeekday[
                      currentDateObj.toLocaleDateString('hu-HU', {
                        weekday: 'long',
                      })
                    ]
                  }
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    isToday && { backgroundColor: colors.primaryContainer },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && { color: colors.onPrimaryContainer },
                    ]}
                  >
                    {currentDateObj.toLocaleDateString('hu-HU', {
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.eventsColumn}>
                {events[dateKey].length === 0 ? (
                  <View style={styles.noEventCard}>
                    <Text style={styles.noEventText}>
                      A mai napon nincs esemény
                    </Text>
                  </View>
                ) : (
                  events[dateKey].map((event) => (
                    <View key={`event-${event.id}`} style={styles.eventItem}>
                      <SideCard
                        title={
                          typeof event.title === 'object'
                            ? event.title.join(' ')
                            : event.title
                        }
                        details={event.description ?? undefined}
                        description={''}
                        image={event.image ?? undefined}
                        popup={true}
                        makeStringToHTML={true}
                      >
                        <View style={styles.chipContainer}>
                          {event.show_time ? (
                            <Chip
                              key={`day-of-week-${event.id}`}
                              size="sm"
                              version="tertiary"
                            >
                              {new Date(event.time).toLocaleTimeString(
                                'hu-HU',
                                {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                }
                              )}
                            </Chip>
                          ) : null}
                          {event.tags != undefined
                            ? event.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={`tag-${event.id}-${tagIndex}`}
                                  version="primary"
                                  size="sm"
                                >
                                  {tag}
                                </Chip>
                              ))
                            : null}
                        </View>
                      </SideCard>
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        }
      })}

      {all && futureEvents && Object.keys(futureEvents).length > 0 && (
        <Section
          title="További események"
          dropdownable
          defaultStatus="closed"
          savable={false}
          // style={styles.section}
          // titleStyle={styles.sectionTitle}
        >
          <View style={styles.eventsContainer}>
            {futureItemsToRender.map((item) => {
              if (item.type === 'month') {
                return (
                  <View key={item.key} style={styles.monthHeader}>
                    <Text style={styles.monthText}>{item.month}</Text>
                  </View>
                );
              } else {
                const dateKey = item.date;
                const currentDateObj = parseDateString(dateKey);
                return (
                  <View key={item.key} style={styles.dateRow}>
                    <View style={styles.dateInfo}>
                      <Text style={styles.weekday}>
                        {
                          shortWeekday[
                            currentDateObj.toLocaleDateString('hu-HU', {
                              weekday: 'long',
                            })
                          ]
                        }
                      </Text>
                      <Text style={styles.dayNumber}>
                        {currentDateObj.toLocaleDateString('hu-HU', {
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.eventsColumn}>
                      {futureEvents[dateKey].map((event) => (
                        <View
                          key={`future-event-${event.id}`}
                          style={styles.eventItem}
                        >
                          <SideCard
                            title={
                              typeof event.title === 'object'
                                ? event.title.join(' ')
                                : event.title
                            }
                            details={event.description ?? undefined}
                            description={''}
                            image={event.image ?? undefined}
                            popup={true}
                            makeStringToHTML={true}
                          >
                            <View style={styles.chipContainer}>
                              {event.show_time ? (
                                <Chip
                                  key={`future-time-${event.id}`}
                                  size="sm"
                                  version="tertiary"
                                >
                                  {new Date(event.time).toLocaleTimeString(
                                    'hu-HU',
                                    {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                    }
                                  )}
                                </Chip>
                              ) : null}
                              {event.tags != undefined
                                ? event.tags.map((tag, tagIndex) => (
                                    <Chip
                                      key={`future-tag-${event.id}-${tagIndex}`}
                                      version="primary"
                                      size="sm"
                                    >
                                      {tag}
                                    </Chip>
                                  ))
                                : null}
                            </View>
                          </SideCard>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }
            })}
          </View>
        </Section>
      )}

      {!all && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => {
            /* Navigation logic here */
          }}
        >
          <Text style={styles.viewAllText}>
            Az összes esemény megtekintése ➡
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    height: '100%',
    minHeight: '100%',
  },
  eventsContainer: {
    flexGrow: 1,
  },
  section: {
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  monthHeader: {
    width: '100%',
    marginVertical: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568', // text-selfprimary-700 equivalent
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // border-selfprimary-200 equivalent
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateInfo: {
    alignItems: 'center',
  },
  weekday: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568', // text-selfprimary-700 equivalent
    textAlign: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  eventsColumn: {
    flex: 1,
    gap: 8,
  },
  eventItem: {
    marginBottom: 8,
  },
  noEventCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    backgroundColor: '#f7fafc', // bg-foreground-100 equivalent
    padding: 16,
    paddingVertical: 12,
  },
  noEventText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c', // text-foreground equivalent
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  chipSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: '#2D3748',
  },
  loadingText: {
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
  },
  emptyText: {
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
  },
  viewAllButton: {
    width: '100%',
    maxWidth: 384,
    borderRadius: 16,
    padding: 16,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c', // text-foreground equivalent
  },
});
