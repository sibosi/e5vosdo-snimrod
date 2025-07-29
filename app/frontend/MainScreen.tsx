import React from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import useDynamicColors from './hooks/useDynamicColors';
import Timetable from './ui/DateContext/Timetable';
import { MenuTray } from './ui/DateContext/MenuTray';
import { DateProvider } from './ui/DateContext/DateContext';
import GoogleLogin from './ui/SignIn';

export default function MainScreen() {
  const colors = useDynamicColors();

  return (
    <ScrollView
      style={[styles.container, { flex: 1, backgroundColor: colors.surface }]}
    >
      <GoogleLogin />
      <DateProvider>
        <Timetable
          style={{ paddingHorizontal: 16 }}
        />
        <MenuTray style={{ paddingHorizontal: 16 }} />
      </DateProvider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
