import useDynamicColors from '../../hooks/useDynamicColors';
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

const Text: React.FC<TextProps> = (props) => {
  const { style, ...rest } = props;
  const colors = useDynamicColors();

  // Just add Outfit font family and default color, let everything else pass through
  const defaultStyle = {
    fontFamily: 'Outfit_400Regular',
    color: colors.onSurface,
  };

  return <RNText style={[defaultStyle, style]} {...rest} />;
};

export default Text;
