import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import useDynamicColors from '../hooks/useDynamicColors';

const ICON_SIZE = 20;

const HomeIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <Path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5" />
  </Svg>
);

const ClubsIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <Path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
  </Svg>
);

const EventsIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <Path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5M2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
  </Svg>
);

const MeIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <Path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
  </Svg>
);

const pages = {
  home: {
    route: 'Main',
    icon: <HomeIcon />,
    label: 'Home',
  },
  clubs: {
    route: 'Clubs',
    icon: <ClubsIcon />,
    label: 'Clubs',
  },
  events: {
    route: 'Events',
    icon: <EventsIcon />,
    label: 'Events',
  },
  me: {
    route: 'Me',
    icon: <MeIcon />,
    label: 'Me',
  },
};

const tabs = [pages.events, pages.home, pages.clubs, pages.me];

let isInitialized = false;
const globalHighlightLeft = new Animated.Value(0);
const globalHighlightWidth = new Animated.Value(60);

export default function PageNav() {
  const navigation = useNavigation();
  const itemRefs = useRef<(View | null)[]>([]);
  const colors = useDynamicColors();
  const [currentRoute, setCurrentRoute] = useState('Main');

  useEffect(() => {
    try {
      const state = navigation.getState();
      if (state?.routes && state.routes.length > 0) {
        const routeName = state.routes[state.index]?.name || 'Main';
        setCurrentRoute(routeName);
      }
    } catch (error) {
      console.log('Error getting initial state:', error);
      setCurrentRoute('Main');
    }

    const unsubscribe = navigation.addListener('state', (e) => {
      try {
        const routeName = e.data?.state?.routes?.[e.data.state.index]?.name || 'Main';
        setCurrentRoute(routeName);
      } catch (error) {
        console.log('Error in state listener:', error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const newPage = tabs.find((page) => page.route === currentRoute);

    if (newPage) {
      const index = tabs.indexOf(newPage);
      const ref = itemRefs.current[index];
      if (ref) {
        setTimeout(() => {
          ref.measure((_x, _y, _width) => {
            globalHighlightWidth.setValue(_width);

            if (!isInitialized) {
              console.log('Setting initial position to:', _x);
              globalHighlightLeft.setValue(_x);
              isInitialized = true;
            } else {
              console.log('Starting animation to:', _x);
              Animated.timing(globalHighlightLeft, {
                toValue: _x,
                duration: 300,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: false,
              }).start();
            }
          });
        }, 100);
      }
    }
  }, [currentRoute]);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Animated.View
          style={[
            styles.highlight,
            {
              left: globalHighlightLeft,
              width: globalHighlightWidth,
              height: globalHighlightWidth,
              backgroundColor: colors.primaryContainer,
            },
          ]}
        />
        {tabs.map((page, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(page.route as never)}
              style={styles.tab}
              ref={(ref) => {
                if (ref) itemRefs.current[index] = ref;
              }}
            >
              <View>{page.icon}</View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  inner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: 320,
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 14,
  },
  highlight: {
    position: 'absolute',
    borderRadius: 24,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    zIndex: 1,
  },
});
