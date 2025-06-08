import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Section component for React Native with NativeWind
interface SectionProps {
  title: string;
  defaultStatus?: 'opened' | 'closed';
  dropdownable?: boolean;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
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
  className = '',
  titleClassName = '',
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
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => updateVersion(false)}
            className={`px-2 py-1 rounded ${
              !isNewVersion ? 'bg-primary-100' : ''
            }`}
          >
            <Text
              className={isNewVersion ? 'text-primary-500' : 'text-primary-900'}
            >
              {oldVersionName}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateVersion(true)}
            className={`px-2 py-1 rounded ${
              isNewVersion ? 'bg-primary-100' : ''
            }`}
          >
            <Text
              className={isNewVersion ? 'text-primary-900' : 'text-primary-500'}
            >
              {newVersionName}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      className={`overflow-hidden ${
        isCard ? 'bg-primary-50 rounded-2xl p-6' : ''
      } ${isOpen ? 'py-4 text-foreground' : 'py-0 text-gray-500'} ${className}`}
    >
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={toggleDropdown}
          className="flex-row items-center space-x-2"
        >
          {dropdownable && (
            <Text
              className={`text-2xl transform ${
                isOpen ? '' : 'rotate-180'
              } text-primary-500`}
            >
              ⌄
            </Text>
          )}
          <Text className={titleClassName}>{title}</Text>
          {chip && <View className="ml-2">{chip}</View>}
        </TouchableOpacity>
        {renderSide()}
      </View>
      {isOpen && (
        <View className="mt-3">
          {newVersion && isNewVersion ? newVersion : children}
        </View>
      )}
    </View>
  );
};
