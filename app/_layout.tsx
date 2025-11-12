import { ThemeProvider } from '@/theme/ThemeProvider';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require('../assets/fonts/InterVariable.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Asset.fromModule(require('../assets/images/logo.png')).downloadAsync();
      } catch {}
      if (mounted) setAssetsLoaded(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ready = fontsLoaded && assetsLoaded;

  const onLayout = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return <View style={styles.flex} onLayout={onLayout} />;

  return (
    <GestureHandlerRootView style={styles.flex} onLayout={onLayout}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
