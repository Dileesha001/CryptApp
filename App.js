// App.js – Root app: no-blocking font loading, safe area, and navigation
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import HomeScreen    from './src/screens/HomeScreen';
import GenKeyScreen  from './src/screens/GenKeyScreen';
import EncryptScreen from './src/screens/EncryptScreen';
import DecryptScreen from './src/screens/DecryptScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

const NavTheme = {
  dark: true,
  colors: {
    primary:      colors.primary,
    background:   colors.bg1,
    card:         colors.bg2,
    text:         colors.text,
    border:       colors.border,
    notification: colors.rose,
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load fonts non-blocking — app renders immediately, fonts swap in when ready
    Font.loadAsync({
      SpaceGrotesk_400Regular,
      SpaceGrotesk_500Medium,
      SpaceGrotesk_600SemiBold,
      SpaceGrotesk_700Bold,
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
      Inter_700Bold,
    })
      .catch(() => {}) // Fail silently — system fonts will be used as fallback
      .finally(() => setReady(true));
  }, []);

  // Don't block render — show app immediately (fonts swap in asynchronously)
  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <NavigationContainer theme={NavTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg1 },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="GenKey"
            component={GenKeyScreen}
            options={{ headerShown: true, headerTransparent: true, headerTitle: '', headerTintColor: colors.white }}
          />
          <Stack.Screen
            name="Encrypt"
            component={EncryptScreen}
            options={{ headerShown: true, headerTransparent: true, headerTitle: '', headerTintColor: colors.white }}
          />
          <Stack.Screen
            name="Decrypt"
            component={DecryptScreen}
            options={{ headerShown: true, headerTransparent: true, headerTitle: '', headerTintColor: colors.white }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
});
