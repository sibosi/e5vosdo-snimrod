import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type AlertProps = {
  children: React.ReactNode;
  style: ViewStyle;
  padding?: boolean;
  icon?: boolean;
};

export const Alert: React.FC<AlertProps> = ({
  children,
  padding = true,
  icon = true,
  style = {},
}) => {
  return (
    <View style={[styles.container, padding && styles.padding, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {/* Simple Info SVG as React Native SVG is not included by default */}
          <Text style={styles.iconText}>ℹ️</Text>
        </View>
      )}
      <View style={styles.content}>
        {typeof children === 'string' ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginVertical: 8,
  },
  padding: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: '#222',
  },
});

export default Alert;
