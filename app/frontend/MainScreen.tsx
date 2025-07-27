import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import useDynamicColors from './hooks/useDynamicColors';
import Timetable from './ui/DateContext/Timetable';
import { MenuTray } from './ui/DateContext/MenuTray';
import { DateProvider } from './ui/DateContext/DateContext';
import { AuthProvider } from './ui/AuthContext';
import GoogleLogin from './ui/SignIn';
import DisplayProfile from './ui/dev/DisplayProfile';

export default function MainScreen() {
  const colors = useDynamicColors();

  return (
    <AuthProvider>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.surface }]}
      >
        <GoogleLogin />
        <DateProvider>
          <Timetable
            style={{ padding: 16 }}
            selfUser={{
              name: 'Nimród Simon',
              EJG_code: '2023C25EJG462',
              username: 'nimrod.simon',
              nickname: 'Nimród',
              email: 'simon.nimrod.zalan@e5vos.hu',
              image: 'https://avatars.githubusercontent.com/u/81036480?v=4',
              last_login: '2023-10-01T12:00:00Z',
              permissions: ['view_timetable', 'view_events'],
              food_menu: '',
              coming_year: 2024,
              class_character: '10.A',
              order_number: 1,
              tickets: [],
              hidden_lessons: [],
              default_group: null,
              push_permission: true,
              push_about_games: true,
              push_about_timetable: true,
            }}
          />
          <MenuTray style={{ paddingHorizontal: 16 }} />
          <ScrollView horizontal style={{ gap: 8, marginTop: 16 }}>
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.primary,
              }}
            />
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.secondary,
              }}
            />
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.primary,
              }}
            />
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.secondary,
              }}
            />
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.primary,
              }}
            />
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.secondary,
              }}
            />
          </ScrollView>

          <DisplayProfile />
        </DateProvider>
      </ScrollView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    // paddingTop: 40,
    // fontFamily: 'Outfit',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    gap: 12,
  },
  colorItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  colorValue: {
    fontSize: 12,
    color: '#555',
  },
});
