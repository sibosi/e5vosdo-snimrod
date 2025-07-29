import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Text from '../ui/Text';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import useDynamicColors from '../hooks/useDynamicColors';
import { usePageSettings } from '../hooks/usePageSettings';
import Chip from '../ui/Chip';
import { PossibleUserType } from '@repo/types/index';
import ChangingComponent from './ChangingComponent';
import Logo from '../assets/logo.svg';

interface NavbarProps {
  selfUser: PossibleUserType;
  className?: string;
  isActiveHeadSpace?: boolean;
}

// GetApp Component (simplified PWA button)
const GetApp = ({ size = 'medium' }: { size?: 'small' | 'medium' }) => {
  const iconSize = size === 'small' ? 20 : 24;

  return (
    <TouchableOpacity style={styles.getAppButton}>
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <Path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
      </Svg>
    </TouchableOpacity>
  );
};

// HelloMessage Component
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

  if (!selfUser) return null;

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

// LiveScore Component (placeholder)
const LiveScore = () => {
  const colors = useDynamicColors();

  return (
    <View style={styles.liveScoreContainer}>
      <Text style={[styles.liveScoreText, { color: colors.primary }]}>
        Live Score
      </Text>
    </View>
  );
};

const NavbarForPhone = ({
  selfUser,
  className,
  isActiveHeadSpace,
}: NavbarProps) => {
  const colors = useDynamicColors();
  const route = useRoute();
  const navigation = useNavigation();

  const PageTitles: Record<string, string> = {
    Main: 'E5vös DÖ',
    Events: 'Események',
    Clubs: 'Szakkörök',
    Me: 'Profilom',
    EST: 'E5 Podcast',
    AdminPage: 'Admin panel',
  };

  const [currentTitle, setCurrentTitle] = useState('E5vös DÖ');

  useEffect(() => {
    setCurrentTitle(PageTitles[route.name] ?? 'E5vös DÖ');
  }, [route.name]);

  return (
    <View style={[styles.navbar, { backgroundColor: colors.surface }]}>
      <View style={styles.navbarContent}>
        <View style={styles.leftContent}>
          <GetApp size="small" />
        </View>

        <View style={styles.centerContent}>
          <ChangingComponent
            startComponent={
              <HelloMessage selfUser={selfUser} size="sm" padding={false} />
            }
            endComponent={
              isActiveHeadSpace ? (
                <LiveScore />
              ) : (
                <TouchableOpacity
                  style={styles.titleContainer}
                  onPress={() => navigation.navigate('Main' as never)}
                >
                  <Logo />
                  <Text style={[styles.title, { color: colors.onSurface }]}>
                    {currentTitle}
                  </Text>
                </TouchableOpacity>
              )
            }
          />
        </View>

        <View style={styles.rightContent}>
          {selfUser?.permissions.includes('tester') && (
            <View style={styles.chipContainer}>
              <Chip version="secondary" size="sm">
                <View style={styles.chipContent}>
                  <Svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <Path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l3.5-3.5a.5.5 0 0 0-.708 0" />
                  </Svg>
                </View>
              </Chip>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const NavbarForDesktop = ({
  selfUser,
  className,
  isActiveHeadSpace,
}: NavbarProps) => {
  const colors = useDynamicColors();
  const navigation = useNavigation();

  // Navigation items (you can customize these based on your app's structure)
  const navItems = [
    { href: 'Events', label: 'Események' },
    { href: 'Clubs', label: 'Szakkörök' },
    { href: 'Me', label: 'Profilom' },
  ];

  return (
    <View style={[styles.navbar, { backgroundColor: colors.surface }]}>
      <View style={styles.desktopContent}>
        <View style={styles.leftSection}>
          {!selfUser?.permissions.includes('user') ? (
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => navigation.navigate('Main' as never)}
            >
              <Logo />
              <Text style={[styles.logoText, { color: colors.onSurface }]}>
                E5
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.userSection}>
              <HelloMessage selfUser={selfUser} size="sm" padding={false} />
              {selfUser?.permissions.includes('tester') && (
                <Chip version="secondary" size="sm">
                  <Text>Tesztverzió</Text>
                </Chip>
              )}
            </View>
          )}

          <GetApp size={isActiveHeadSpace ? 'small' : 'medium'} />

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
  selfUser,
  className,
}: Omit<NavbarProps, 'isActiveHeadSpace'>) => {
  const { pageSettings } = usePageSettings();
  const isActiveHeadSpace = pageSettings?.headspace === 1;

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const { width } = Dimensions.get('window');
    setIsMobile(width < 768);

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width < 768);
    });

    return () => subscription?.remove();
  }, []);

  if (isMobile) {
    return (
      <NavbarForPhone
        selfUser={selfUser}
        className={className}
        isActiveHeadSpace={isActiveHeadSpace}
      />
    );
  }

  return (
    <NavbarForDesktop
      selfUser={selfUser}
      className={className}
      isActiveHeadSpace={isActiveHeadSpace}
    />
  );
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
    fontSize: 20,
    fontWeight: '700',
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
