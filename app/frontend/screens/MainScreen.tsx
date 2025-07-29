import React from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import useDynamicColors from '../hooks/useDynamicColors';
import Timetable from '../components/DateContext/Timetable';
import { MenuTray } from '../components/DateContext/MenuTray';
import { DateProvider } from '../components/DateContext/DateContext';
import GoogleLogin from '../components/SignIn';

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
