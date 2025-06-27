import useDynamicColors from 'apps/native/hooks/useDynamicColors';
import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';

const fontFamilys = {
  '100': 'Outfit_100Thin',
  '200': 'Outfit_200ExtraLight',
  '300': 'Outfit_300Light',
  '400': 'Outfit_400Regular',
  '500': 'Outfit_500Medium',
  '600': 'Outfit_600SemiBold',
  '700': 'Outfit_700Bold',
  '800': 'Outfit_800ExtraBold',
  '900': 'Outfit_900Black',
  default: 'Outfit_400Regular', // Fallback to regular if fontWeight is not recognized
  normal: 'Outfit_400Regular', // Normal is also regular
  bold: 'Outfit_700Bold', // Bold is Outfit_700Bold
  ultralight: 'Outfit_200ExtraLight', // Ultralight is Outfit_200ExtraLight
  light: 'Outfit_300Light', // Light is Outfit_300Light
  thin: 'Outfit_100Thin', // Thin is Outfit_100Thin
  black: 'Outfit_900Black', // Black is Outfit_900Black
  medium: 'Outfit_500Medium', // Medium is Outfit_500Medium
  regular: 'Outfit_400Regular', // Regular is Outfit_400Regular
  semibold: 'Outfit_600SemiBold', // Semibold is Outfit_600SemiBold
  extrabold: 'Outfit_800ExtraBold', // ExtraBold is Outfit_800ExtraBold,
  condensedBold: 'Outfit_700Bold', // CondensedBold is also Outfit_700Bold
  condensedExtraBold: 'Outfit_800ExtraBold', // CondensedExtraBold is Outfit_800ExtraBold
  condensed: 'Outfit_400Regular', // Condensed is also Outfit_400Regular
  heavy: 'Outfit_900Black', // Heavy is Outfit_900Black
};

const Text: React.FC<TextProps> = (props) => {
  const { style, ...rest } = props;
  const fontWeight = String((style as TextStyle)?.fontWeight ?? '400'); // Default to regular if no fontWeight is provided
  const colors = useDynamicColors();
  const color = (style as TextStyle).color ?? colors.onSurface;

  return (
    <RNText
      style={[
        {
          fontFamily: fontFamilys[fontWeight as keyof typeof fontFamilys],
          fontWeight: undefined,
          color: color,
        },
        style,
      ]}
      {...rest}
    />
  );
};

export default Text;
