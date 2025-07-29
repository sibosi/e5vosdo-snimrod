import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Animated } from 'react-native';

interface ChangingComponentProps {
  startComponent: ReactNode;
  endComponent: ReactNode;
  duration?: number;
  fadeDuration?: number;
}

export default function ChangingComponent({
  startComponent,
  endComponent,
  duration = 3000,
  fadeDuration = 1000,
}: ChangingComponentProps) {
  const [showStart, setShowStart] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Start fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start(() => {
        // Switch components
        setShowStart(false);
        // Fade in the new component
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }).start();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, fadeDuration, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.component, { opacity: fadeAnim }]}>
        {showStart ? startComponent : endComponent}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  component: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
