import { Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { Shadows } from '../../../constants/shadows';
import { Takeover } from '../Takeover';
import { Button } from '../../ui/Button';

export const STREAK_MILESTONES = [3, 7, 12, 30, 60, 100, 365] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export function isStreakMilestone(n: number): n is StreakMilestone {
  return (STREAK_MILESTONES as readonly number[]).includes(n);
}

const COPY: Record<StreakMilestone, { title: string; body: string; word: string }> = {
  3: {
    word: 'three',
    title: 'Three days.',
    body: "A start. Most apps never see a Day 3 — quietly, you're already past that.",
  },
  7: {
    word: 'seven',
    title: 'Seven days in.',
    body: 'A full week. Sixteen-ish phrases are starting to feel like yours.',
  },
  12: {
    word: 'twelve',
    title: 'Twelve days in.',
    body: "Quietly impressive. You've met your phrases — most of which are starting to feel like yours.",
  },
  30: {
    word: 'thirty',
    title: 'A month with us.',
    body: "Thirty days is when habits start to feel less like rules. Eat some thindi, you've earned it.",
  },
  60: {
    word: 'sixty',
    title: 'Two months strong.',
    body: "You're past the part where it gets hard. Now it just compounds.",
  },
  100: {
    word: 'one hundred',
    title: 'One hundred days.',
    body: "Sakkath. Most people don't keep a promise for a hundred days. You did.",
  },
  365: {
    word: 'three hundred and sixty-five',
    title: 'A whole year.',
    body: "Ondhu varsha. From here, it's not learning — it's living in it.",
  },
};

export interface StreakMilestoneTakeoverProps {
  streak: StreakMilestone;
  nWordsLearned: number;
  onContinue: () => void;
  onShare?: () => void;
}

/**
 * Full-screen streak-milestone celebration (MODALS §6.6). Numbers, copy, and
 * milestone list locked in spec. Confetti is implemented as static dots — the
 * spec calls out optional Reanimated drift as a follow-up.
 */
export function StreakMilestoneTakeover({
  streak,
  nWordsLearned,
  onContinue,
  onShare,
}: StreakMilestoneTakeoverProps) {
  const insets = useSafeAreaInsets();
  const copy = COPY[streak];

  return (
    <Takeover onClose={onContinue}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + Spacing.xxxl,
          paddingHorizontal: Spacing.xxl,
        }}
      >
        <Confetti />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: moderateScale(14) }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 1.8,
              color: Colors.secondary,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.4}
          >
            Streak · Day {copy.word}
          </Text>
          <Medallion streak={streak} />
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(32),
              letterSpacing: -0.6,
              lineHeight: moderateScale(36),
              color: Colors.onSurface,
              textAlign: 'center',
              marginTop: moderateScale(6),
            }}
            maxFontSizeMultiplier={1.3}
          >
            {capitalise(copy.word)} days in.
          </Text>
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: moderateScale(17),
              lineHeight: moderateScale(25),
              color: Colors.tertiary,
              textAlign: 'center',
              maxWidth: moderateScale(280),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {interpolate(copy.body, { nWordsLearned: String(nWordsLearned) })}
          </Text>
        </View>
        <View
          style={{
            paddingBottom: insets.bottom + Spacing.xxl,
            gap: moderateScale(10),
          }}
        >
          <Button
            label="Keep going"
            variant="primary"
            onPress={onContinue}
            trailingIcon="forward"
          />
          {onShare ? (
            <Button label="Share with a friend" variant="ghost" onPress={onShare} />
          ) : null}
        </View>
      </View>
    </Takeover>
  );
}

function Medallion({ streak }: { streak: number }) {
  const size = moderateScale(220);
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.medallion,
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="med" cx="50%" cy="50%" rx="70%" ry="70%" fx="50%" fy="40%">
            <Stop offset="0%" stopColor={Colors.secondaryFixed} stopOpacity="1" />
            <Stop offset="100%" stopColor={Colors.surface} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#med)" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - moderateScale(14)}
          stroke={Colors.secondaryContainer}
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeDasharray="2 6"
          fill="transparent"
        />
      </Svg>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(108),
          letterSpacing: -6,
          lineHeight: moderateScale(108),
          color: Colors.primary,
          paddingBottom: moderateScale(6),
        }}
        maxFontSizeMultiplier={1.2}
        accessibilityLabel={`${streak} day streak`}
      >
        {streak}
      </Text>
    </View>
  );
}

function Confetti() {
  // Nine scattered dots in the top 60% — static first pass per spec.
  const dots = [
    { top: 8, left: 12, size: 6, color: Colors.secondaryContainer },
    { top: 16, left: 80, size: 5, color: Colors.primaryContainer },
    { top: 12, left: 56, size: 4, color: Colors.secondaryContainer },
    { top: 32, left: 24, size: 7, color: Colors.primaryContainer },
    { top: 40, left: 88, size: 5, color: Colors.secondaryContainer },
    { top: 48, left: 8, size: 4, color: Colors.primaryContainer },
    { top: 22, left: 40, size: 5, color: Colors.secondaryContainer },
    { top: 50, left: 70, size: 6, color: Colors.primaryContainer },
    { top: 28, left: 95, size: 4, color: Colors.secondaryContainer },
  ];
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '40%' }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: moderateScale(d.size),
            height: moderateScale(d.size),
            borderRadius: moderateScale(d.size),
            backgroundColor: d.color,
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}
