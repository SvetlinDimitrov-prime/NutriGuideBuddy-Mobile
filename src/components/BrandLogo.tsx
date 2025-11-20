import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { s } from 'react-native-size-matters';

const logo = require('@assets/images/logo.png');

type Props = { size?: number; round?: number };

export function BrandLogo({ size = 112 }: Props) {
  const styles = StyleSheet.create({
    img: { width: s(size), height: s(size) },
  });
  return <Image source={logo} style={styles.img} contentFit="contain" />;
}

export function BrandLogoSmall({ size = 28, round = 8 }: Props) {
  const clamped = Math.min(s(size), 32);
  const styles = StyleSheet.create({
    img: { width: clamped, height: clamped, borderRadius: Math.min(s(round), 10) },
  });
  return <Image source={logo} style={styles.img} contentFit="contain" />;
}
