import { TouchableOpacity } from 'react-native';
import Text from './Text';
import { ChipProps } from '@repo/types/index';
import useDynamicColors from '../hooks/useDynamicColors';

export default function Chip({
  children,
  onPress,
  version = 'surface',
  selected = false,
  disabled = false,
  size = 'md',
}: ChipProps & { size?: 'sm' | 'md' | 'lg' }) {
  const colors = useDynamicColors();
  const backgroundColor = colors[`${version}${selected ? '' : 'Container'}`];
  const textColor =
    colors[
      `on${version.charAt(0).toUpperCase() + version.slice(1)}${
        selected ? '' : 'Container'
      }` as keyof typeof colors
    ];

  const sizeStyles = {
    sm: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    md: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    lg: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: backgroundColor,
        ...sizeStyles[size],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: textColor }}>{children}</Text>
    </TouchableOpacity>
  );
}
