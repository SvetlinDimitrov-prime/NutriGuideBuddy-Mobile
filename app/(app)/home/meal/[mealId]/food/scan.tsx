import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type RouteParams = { mealId?: string };

/** Try to turn whatever we scanned into an OFF code */
function normalizeOffCode(raw: string): string | null {
  const trimmed = raw.trim();

  // 1) if the whole string is just digits – treat that as the barcode
  if (/^\d{6,20}$/.test(trimmed)) {
    return trimmed;
  }

  // 2) otherwise, try to find the first "long enough" run of digits anywhere in the string
  const anyDigitsMatch = trimmed.match(/(\d{6,20})/);
  if (anyDigitsMatch) {
    return anyDigitsMatch[1];
  }

  return null;
}

export default function QrAddFoodScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { mealId } = useLocalSearchParams<RouteParams>();
  const numericMealId = Number(mealId ?? 0);

  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  // blocks *only* while we're actively navigating away
  const barcodeLockRef = useRef(false);

  // ask for camera permission on mount
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (barcodeLockRef.current) return;

    const data = String(result.data ?? '').trim();
    if (!data) return;

    if (!numericMealId) {
      setError('Missing meal context. Please go back and open a meal first.');
      return;
    }

    const offId = normalizeOffCode(data);
    if (!offId) {
      // keep scanning – just show a hint
      setError("Couldn't read this barcode. Try moving a bit farther away and holding still.");
      return;
    }

    // We got something that looks like a barcode → navigate once.
    barcodeLockRef.current = true;
    setError(null);

    router.push({
      pathname: '/home/meal/[mealId]/food/open-food',
      params: { mealId: String(numericMealId), offId },
    });
  };

  if (!permission?.granted) {
    return (
      <PageShell>
        <View style={styles.centerWrap}>
          <Text style={styles.infoText}>We need camera access to scan barcodes.</Text>
          <Button mode="contained" onPress={requestPermission}>
            Grant camera permission
          </Button>
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <View style={styles.container}>
        <Text style={styles.title}>Scan food barcode</Text>
        <Text style={styles.subtitle}>
          Align the barcode inside the frame. Hold your phone a little back so it can focus, and
          we&apos;ll open its details from Open Food Facts.
        </Text>

        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            // always scanning; we only lock while navigating
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
          </CameraView>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.actionsRow}>
          <Button mode="outlined" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </View>
    </PageShell>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const maxWidth = bp.isXL ? s(640) : bp.isLG ? s(520) : '100%';

  return StyleSheet.create({
    container: {
      width: '100%',
      maxWidth,
      alignSelf: 'center',
      paddingHorizontal: s(16),
      paddingTop: vs(12),
      gap: vs(12),
    },
    centerWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: s(16),
      gap: vs(12),
    },
    title: {
      fontSize: ms(20, 0.2),
      fontWeight: '600',
    },
    subtitle: {
      fontSize: ms(13, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
    cameraWrapper: {
      marginTop: vs(10),
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: s(16),
      overflow: 'hidden',
      backgroundColor: '#000',
      alignSelf: 'center',
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cornerTL: {
      position: 'absolute',
      top: vs(40),
      left: s(40),
      width: s(24),
      height: s(24),
      borderColor: theme.colors.primary,
      borderLeftWidth: 3,
      borderTopWidth: 3,
      borderRadius: s(4),
    },
    cornerTR: {
      position: 'absolute',
      top: vs(40),
      right: s(40),
      width: s(24),
      height: s(24),
      borderColor: theme.colors.primary,
      borderRightWidth: 3,
      borderTopWidth: 3,
      borderRadius: s(4),
    },
    cornerBL: {
      position: 'absolute',
      bottom: vs(40),
      left: s(40),
      width: s(24),
      height: s(24),
      borderColor: theme.colors.primary,
      borderLeftWidth: 3,
      borderBottomWidth: 3,
      borderRadius: s(4),
    },
    cornerBR: {
      position: 'absolute',
      bottom: vs(40),
      right: s(40),
      width: s(24),
      height: s(24),
      borderColor: theme.colors.primary,
      borderRightWidth: 3,
      borderBottomWidth: 3,
      borderRadius: s(4),
    },
    errorText: {
      marginTop: vs(8),
      color: theme.colors.error,
      fontSize: ms(13, 0.2),
    },
    infoText: {
      fontSize: ms(14, 0.2),
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    actionsRow: {
      marginTop: vs(12),
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: s(8),
    },
  });
}
