import React from 'react';
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useDynamicColors from './hooks/useDynamicColors';
import Timetable from './ui/DateContext/Timetable';
import { MenuTray } from './ui/DateContext/MenuTray';
import { DateProvider } from './ui/DateContext/DateContext';
import GoogleLogin from './ui/SignIn';
import DisplayProfile from './ui/dev/DisplayProfile';

type StackParamList = {
  Main: undefined;
  Events: undefined;
};
export default function MainScreen() {
  const colors = useDynamicColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList, 'Main'>>();


  return (

      <View style={{ flex: 1 }}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.surface }]}
        >
          <Button
            title="Go to Events"
            onPress={() => navigation.navigate('Events')}
          />
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
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
