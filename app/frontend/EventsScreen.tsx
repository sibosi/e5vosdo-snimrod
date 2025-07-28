import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PageNav from './components/PageNav';

const EventsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello world!</Text>
      <PageNav currentRoute="Events" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default EventsScreen;
