import { Text, useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import MainScreen from './screens/MainScreen';
import EventsScreen from './screens/EventsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import useDynamicColors from './hooks/useDynamicColors';
import PageNav from './components/PageNav';
import Navbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();
  const colors = useDynamicColors();

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
    return <Text>Loading...</Text>;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <SafeAreaView
          edges={['top', 'bottom']}
          style={{ flex: 1, backgroundColor: colors.surface }}
        >
          <NavigationContainer>
            <Navbar />
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{ title: 'Főoldal' }}
              />
              <Stack.Screen
                name="Events"
                component={EventsScreen}
                options={{ title: 'Events' }}
              />
            </Stack.Navigator>
            <PageNav />
          </NavigationContainer>
        </SafeAreaView>
      </AuthProvider>
    </PaperProvider>
  );
}
