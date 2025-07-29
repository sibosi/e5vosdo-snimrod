import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Text from '../ui/Text';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import useDynamicColors from '../hooks/useDynamicColors';
import Chip from '../ui/Chip';
import { PossibleUserType } from '@repo/types/index';
import ChangingComponent from './ChangingComponent';
import Logo from '../assets/logo.svg';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  className?: string;
}

const HelloMessage = ({
  selfUser,
  size = 'md',
  padding = true,
}: {
  selfUser: PossibleUserType;
  size?: 'sm' | 'md';
  padding?: boolean;
}) => {
  const colors = useDynamicColors();
  const textSize = size === 'sm' ? 14 : 16;

  if (!selfUser) return (
    <View style={[styles.helloContainer, padding && { padding: 8 }]}>
      <Text
        style={[
          styles.helloText,
          { color: colors.onSurface, fontSize: textSize },
        ]}
      >
        Helló Eötvös Népe!
      </Text>
    </View>
  );

  return (
    <View style={[styles.helloContainer, padding && { padding: 8 }]}>
      <Text
        style={[
          styles.helloText,
          { color: colors.onSurface, fontSize: textSize },
        ]}
      >
        Szia, {selfUser.nickname || selfUser.name}!
      </Text>
    </View>
  );
};

const NavbarForPhone = () => {
  const colors = useDynamicColors();
  const navigation = useNavigation();
  const { selfUser } = useAuth();
  const [currentTitle, setCurrentTitle] = useState('E5vös DÖ');

  const PageTitles: Record<string, string> = {
    Main: 'E5vös DÖ',
    Events: 'Események',
    Clubs: 'Szakkörök',
    Me: 'Profilom',
    EST: 'E5 Podcast',
    AdminPage: 'Admin panel',
  };

  useEffect(() => {
    try {
      const state = navigation.getState();
      if (state?.routes && state.routes.length > 0) {
        const routeName = state.routes[state.index]?.name || 'Main';
        setCurrentTitle(PageTitles[routeName] ?? 'E5vös DÖ');
      }
    } catch (error) {
      console.log('Error getting initial state:', error);
      setCurrentTitle('E5vös DÖ');
    }

    const unsubscribe = navigation.addListener('state', (e) => {
      try {
        const routeName =
          e.data?.state?.routes?.[e.data.state.index]?.name || 'Main';
        setCurrentTitle(PageTitles[routeName] ?? 'E5vös DÖ');
      } catch (error) {
        console.log('Error in state listener:', error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={[styles.navbar, { backgroundColor: colors.surface }]}>
      <View style={styles.navbarContent}>
        <View style={styles.centerContent}>
          <ChangingComponent
            startComponent={
              <HelloMessage selfUser={selfUser} size="sm" padding={false} />
            }
            endComponent={
              <TouchableOpacity
                style={styles.titleContainer}
                onPress={() => navigation.navigate('Main' as never)}
              >
                <Logo height={44} width={44} />
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  {currentTitle}
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      </View>
    </View>
  );
};

const NavbarForDesktop = ({ className }: NavbarProps) => {
  const colors = useDynamicColors();
  const navigation = useNavigation();

  const navItems = [
    { href: 'Main', label: 'Főoldal' },
    { href: 'Events', label: 'Események' },
    { href: 'Clubs', label: 'Szakkörök' },
    { href: 'Me', label: 'Profilom' },
  ];

  return (
    <View style={[styles.navbar, { backgroundColor: colors.surface }]}>
      <View style={styles.desktopContent}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => navigation.navigate('Main' as never)}
          >
            <Logo height={44} width={44} />
          </TouchableOpacity>

          <View style={styles.navLinks}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.href}
                onPress={() => navigation.navigate(item.href as never)}
                style={styles.navLink}
              >
                <Text style={[styles.navLinkText, { color: colors.onSurface }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.profileIcon}>
            <Svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <Path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const Navbar = ({
  className,
}: Omit<NavbarProps, 'isActiveHeadSpace'>) => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const { width } = Dimensions.get('window');
    setIsMobile(width < 768);

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width < 768);
    });

    return () => subscription?.remove();
  }, []);

  if (isMobile) return <NavbarForPhone />;

  return <NavbarForDesktop />;
};

const styles = StyleSheet.create({
  navbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  leftContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContent: {
    flex: 2,
    alignItems: 'center',
  },
  rightContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  desktopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 16,
  },
  navLink: {
    padding: 8,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  helloContainer: {
    alignItems: 'center',
  },
  helloText: {
    fontSize: 14,
    fontWeight: '500',
  },
  liveScoreContainer: {
    padding: 8,
  },
  liveScoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  getAppButton: {
    padding: 8,
    borderRadius: 8,
  },
  profileIcon: {
    padding: 8,
    borderRadius: 8,
  },
  chipContainer: {
    // Container for the chip
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default Navbar;
