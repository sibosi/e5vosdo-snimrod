import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme } from 'react-native';
import useDynamicColors from './hooks/useDynamicColors';

export default function MainScreen() {
  const colors = useDynamicColors();

  const colorEntries = Object.entries(colors);

  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Dynamic Colors {scheme}</Text>
      <FlatList
        data={colorEntries}
        keyExtractor={([name]) => name}
        numColumns={3}
        renderItem={({ item }) => {
          const [name, value] = item;
          return (
            <View style={styles.colorItem}>
              <View style={[styles.colorPreview, { backgroundColor: value }]} />
              <Text style={styles.colorName}>{name}</Text>
              <Text style={styles.colorValue}>{String(value)}</Text>
            </View>
          );
        }}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
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
