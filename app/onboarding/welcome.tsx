import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { useCopy } from '../../hooks/useCopy';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = useCopy();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xxl,
        justifyContent: 'space-between',
      }}
    >
      <ProgressDots total={5} current={0} />

      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: moderateScale(72),
            color: Colors.primaryContainer,
            lineHeight: moderateScale(110),
            paddingTop: moderateScale(10),
            textAlign: 'center',
            marginBottom: Spacing.sm,
          }}
        >
          ಕನ್ನಡ ಬಾ
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            textAlign: 'center',
            marginBottom: Spacing.sm,
          }}
        >
          Kannada Baa
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(16),
            color: Colors.tertiary,
            textAlign: 'center',
            lineHeight: moderateScale(24),
            maxWidth: moderateScale(280),
          }}
        >
          {copy('onboardingWelcome')}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/onboarding/name')}
        style={({ pressed }) => ({
          backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
          borderRadius: moderateScale(16),
          paddingVertical: moderateScale(18),
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.97 : 1 }],
          shadowColor: Colors.primaryContainer,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 6,
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(17),
            color: Colors.onPrimary,
          }}
        >
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
