import useDynamicColors from '../hooks/useDynamicColors';
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
  default: 'Outfit_400Regular',
  normal: 'Outfit_400Regular',
  bold: 'Outfit_700Bold',
  ultralight: 'Outfit_200ExtraLight',
  light: 'Outfit_300Light',
  thin: 'Outfit_100Thin',
  black: 'Outfit_900Black',
  medium: 'Outfit_500Medium',
  regular: 'Outfit_400Regular',
  semibold: 'Outfit_600SemiBold',
  extrabold: 'Outfit_800ExtraBold',
  condensedBold: 'Outfit_700Bold',
  condensedExtraBold: 'Outfit_800ExtraBold',
  condensed: 'Outfit_400Regular',
  heavy: 'Outfit_900Black',
};

const Text: React.FC<TextProps> = (props) => {
  const { style, ...rest } = props;
  const fontWeight = String((style as TextStyle)?.fontWeight ?? '400');
  const colors = useDynamicColors();
  const color = (style as TextStyle)?.color ?? colors.onSurface;
  const filteredStyle = Object.fromEntries(
    Object.entries(style ?? {}).filter(
      ([key]) => !['fontFamily', 'fontWeight', 'color'].includes(key)
    )
  );

  return (
    <RNText
      style={[
        {
          fontFamily: fontFamilys[fontWeight as keyof typeof fontFamilys],
          fontWeight: undefined,
          color: color,
        },
        filteredStyle,
      ]}
      {...rest}
    />
  );
};

export default Text;
