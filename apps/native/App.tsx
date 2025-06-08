import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import MainScreen from './MainScreen';

export default function App() {
  const colorScheme = useColorScheme();
  // ha nem adsz át semmit, Android 12+ alatt valóban a rendszer által generált dinamikus színeket kapod vissza
  const { theme } = useMaterial3Theme();

  // theme.light / theme.dark innen már MD3 kulcsokat tartalmaz:
  // theme.light.primaryContainer, theme.light.onPrimaryContainer, theme.light.secondaryContainer, stb.
  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };

  return (
    <PaperProvider theme={paperTheme}>
      <MainScreen />
    </PaperProvider>
  );
}
