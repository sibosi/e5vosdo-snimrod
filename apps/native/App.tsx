import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import MainScreen from './MainScreen';
import {
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';

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

  const [fontsLoaded] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    Outfit: Outfit_400Regular,
  });

  if (!fontsLoaded) {
    return null; // vagy egy betöltési képernyő, ha szükséges
  }

  return (
    <PaperProvider theme={paperTheme}>
      <MainScreen />
    </PaperProvider>
  );
}
