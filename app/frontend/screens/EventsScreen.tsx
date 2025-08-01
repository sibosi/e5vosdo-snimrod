import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Events } from '../components/Events';

const EventsScreen = () => {
  return (
    <View style={styles.container}>
      <Events />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

  },
});

export default EventsScreen;
