import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface RealWorldPhaseProps {
  prompt: string;
  title: string;
  onAdvance: () => void;
}

export function RealWorldPhase({ prompt, title, onAdvance }: RealWorldPhaseProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + Spacing.xxxl,
          paddingBottom: Spacing.lg,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.md,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {title}
        </Text>

        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.xl,
            paddingVertical: Spacing.xxxl,
            paddingHorizontal: Spacing.xl,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(22),
              lineHeight: moderateScale(30),
              color: Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {prompt}
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I'll try this"
          onPress={onAdvance}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
            minHeight: moderateScale(44),
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.onPrimary,
            }}
          >
            I'll try this
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
          onPress={onAdvance}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.surfaceContainerHigh : 'transparent',
            borderRadius: Radius.md,
            paddingVertical: Spacing.md,
            minHeight: moderateScale(44),
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
            }}
          >
            Skip for now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
