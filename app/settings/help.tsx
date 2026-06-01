import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import * as Linking from 'expo-linking';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { safeOpenUrl } from '../../lib/safeOpenUrl';

// `[OPEN]` per spec_profile_settings_wiring §5 — owner must fill in.
// Rows referencing a null value are hidden at render time so no dead links ship.
const SUPPORT_EMAIL: string | null = null;
const PRIVACY_URL: string | null = null;
const TERMS_URL: string | null = null;

function bugReportBody(): string {
  const lines = [
    `Build: ${Application.nativeBuildVersion ?? 'unknown'}`,
    `Version: ${Application.nativeApplicationVersion ?? 'unknown'}`,
    `Device: ${Device.modelName ?? 'unknown'}`,
    '',
    '---',
    '',
    '[describe what happened]',
  ];
  return lines.join('\n');
}

function buildMailto(address: string, subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${address}?${params.toString()}`;
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const version = Application.nativeApplicationVersion ?? 'unknown';
  const build = Application.nativeBuildVersion ?? '';
  const versionLabel = build ? `${version} · ${build}` : version;

  function openContact() {
    if (!SUPPORT_EMAIL) return;
    Linking.openURL(buildMailto(SUPPORT_EMAIL, 'Kannada Baa support')).catch(() => undefined);
  }

  function openBugReport() {
    if (!SUPPORT_EMAIL) return;
    Linking.openURL(buildMailto(SUPPORT_EMAIL, 'Bug report — Kannada Baa', bugReportBody()))
      .catch(() => undefined);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={20} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Help & feedback
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingBottom: insets.bottom + Spacing.xxl,
          paddingTop: Spacing.md,
          gap: moderateScale(20),
        }}
      >
        {SUPPORT_EMAIL ? (
          <>
            <SectionHeader label="Contact" />
            <View
              style={{
                backgroundColor: Colors.surfaceContainerLow,
                borderRadius: Radius.lg,
                overflow: 'hidden',
              }}
            >
              <Row label="Contact us" onPress={openContact} idx={0} />
              <Row label="Report a bug" onPress={openBugReport} idx={1} />
            </View>
          </>
        ) : null}

        <SectionHeader label="About" />
        <View
          style={{
            backgroundColor: Colors.surfaceContainerLow,
            borderRadius: Radius.lg,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: moderateScale(14),
              paddingHorizontal: Spacing.lg,
              minHeight: moderateScale(56),
              backgroundColor: Colors.surfaceContainerLow,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(14),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Version
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {versionLabel}
            </Text>
          </View>
          {PRIVACY_URL ? <Row label="Privacy policy" onPress={() => safeOpenUrl(PRIVACY_URL)} idx={1} /> : null}
          {TERMS_URL ? (
            <Row
              label="Terms of service"
              onPress={() => safeOpenUrl(TERMS_URL)}
              idx={PRIVACY_URL ? 0 : 1}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, onPress, idx }: { label: string; onPress: () => void; idx: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(14),
        paddingHorizontal: Spacing.lg,
        minHeight: moderateScale(56),
        backgroundColor:
          idx % 2 === 0 ? Colors.surfaceContainerLow : Colors.surfaceContainerHigh,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(14),
          color: Colors.onSurface,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
      <Icons.forward size={18} color={Colors.tertiary} />
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        letterSpacing: 2.5,
        color: Colors.tertiary,
        textTransform: 'uppercase',
      }}
      maxFontSizeMultiplier={1.4}
    >
      {label}
    </Text>
  );
}
