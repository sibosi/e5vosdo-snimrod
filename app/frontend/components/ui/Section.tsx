import React, { useState, useEffect } from 'react';
import Text from './Text';
import {
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useDynamicColors from '../../hooks/useDynamicColors'; // Import the custom hook for dynamic colors
import ArrowIcon from 'packages/icons/src/arrow.svg';

// Section component for React Native with inline styles
interface SectionProps {
  title: string;
  defaultStatus?: 'opened' | 'closed';
  dropdownable?: boolean;
  children: React.ReactNode;
  style?: any;
  titleStyle?: any;
  savable?: boolean;
  chip?: React.ReactNode;
  newVersion?: React.ReactNode;
  oldVersionName?: string;
  newVersionName?: string;
  isCard?: boolean;
  sideComponent?: React.ReactNode;
}

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = (name: string) => `section_${name}`;
const STORAGE_NEW_VER = (name: string) => `section_${name}_new_version`;

export const Section: React.FC<SectionProps> = ({
  title,
  defaultStatus = 'opened',
  dropdownable = true,
  children,
  style = {},
  titleStyle = {},
  savable = true,
  chip,
  newVersion,
  oldVersionName = 'Régi nézet',
  newVersionName = 'Új nézet',
  isCard = false,
  sideComponent,
}) => {
  const [isOpen, setIsOpen] = useState(defaultStatus === 'opened');
  const [isNewVersion, setIsNewVersion] = useState(false);
  const colors = useDynamicColors();

  titleStyle = {
    ...titleStyle,
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '600',
  };

  // Load status from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        if (savable) {
          const stored = await AsyncStorage.getItem(STORAGE_KEY(title));
          if (stored !== null) setIsOpen(stored === 'true');
        }
        if (newVersion) {
          const storedVer = await AsyncStorage.getItem(STORAGE_NEW_VER(title));
          if (storedVer !== null) setIsNewVersion(storedVer === 'true');
        }
      } catch {}
    })();
  }, []);

  const toggleDropdown = async () => {
    if (!dropdownable) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !isOpen;
    setIsOpen(next);
    if (savable) {
      await AsyncStorage.setItem(STORAGE_KEY(title), next.toString());
    }
  };

  const updateVersion = async (newVer: boolean) => {
    setIsNewVersion(newVer);
    if (newVersion) {
      await AsyncStorage.setItem(STORAGE_NEW_VER(title), newVer.toString());
    }
  };

  const renderSide = () => {
    if (sideComponent) return sideComponent;
    if (newVersion && isOpen) {
      return (
        <View style={styles.flexRow}>
          <TouchableOpacity
            onPress={() => updateVersion(false)}
            style={[
              styles.versionButton,
              !isNewVersion && styles.activeVersionButton,
            ]}
          >
            <Text
              style={
                isNewVersion
                  ? styles.inactiveVersionText
                  : styles.activeVersionText
              }
            >
              {oldVersionName}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateVersion(true)}
            style={[
              styles.versionButton,
              isNewVersion && styles.activeVersionButton,
            ]}
          >
            <Text
              style={
                isNewVersion
                  ? styles.activeVersionText
                  : styles.inactiveVersionText
              }
            >
              {newVersionName}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const containerStyle = [
    styles.container,
    isCard && styles.card,
    isOpen ? styles.openContainer : styles.closedContainer,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.titleContainer}
        >
          {dropdownable && (
            <View style={[!isOpen && styles.arrowRotated]}>
              <ArrowIcon width={24} height={24} fill={colors.primary} />
            </View>
          )}
          <Text style={titleStyle}>{title}</Text>
          {chip && <View style={styles.chipContainer}>{chip}</View>}
        </TouchableOpacity>
        {renderSide()}
      </View>
      {isOpen && (
        <View style={styles.contentContainer}>
          {newVersion && isNewVersion ? newVersion : children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#f8fafc', // primary-50
    borderRadius: 16,
    padding: 24,
  },
  openContainer: {
    paddingVertical: 16,
  },
  closedContainer: {
    paddingVertical: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    color: '#6366f1', // primary-500
  },
  arrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  chipContainer: {
    marginLeft: 8,
  },
  contentContainer: {
    marginTop: 4,
  },
  flexRow: {
    flexDirection: 'row',
  },
  versionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  activeVersionButton: {
    backgroundColor: '#eff6ff', // primary-100
  },
  activeVersionText: {
    color: '#1e3a8a', // primary-900
  },
  inactiveVersionText: {
    color: '#6366f1', // primary-500
  },
});
