import { View, TouchableOpacity } from 'react-native';
import ArrowIcon from '../../assets/arrow.svg';
import Text from '../Text';
import { useDateContext } from './DateContext';
import useDynamicColors from '../../hooks/useDynamicColors';

export default function DatePicker() {
  const colors = useDynamicColors();
  const { dateInMenuFormat, nextDay, prevDay } = useDateContext();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primaryContainer,
        borderRadius: 9999,
        gap: 8,
        height: 32,
        width: 140,
      }}
    >
      <TouchableOpacity
        onPress={prevDay}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 32,
          paddingHorizontal: 8,
          borderRadius: 9999,
        }}
      >
        <ArrowIcon
          width={16}
          height={16}
          fill={colors.onPrimaryContainer}
          rotation={90}
        />
      </TouchableOpacity>
      <Text
        style={{
          color: colors.onPrimaryContainer,
          fontWeight: '500',
        }}
      >
        {dateInMenuFormat}
      </Text>
      <TouchableOpacity
        onPress={nextDay}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 32,
          paddingHorizontal: 8,
          borderRadius: 9999,
        }}
      >
        <ArrowIcon
          width={16}
          height={16}
          fill={colors.onPrimaryContainer}
          rotation={270}
        />
      </TouchableOpacity>
    </View>
  );
}
