import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Halo } from '../Halo';
import { Button } from '../../ui/Button';

export interface LearningTimeInfoDialogProps {
  minutes: 5 | 10 | 20;
  onDismiss: () => void;
}

const COPY: Record<5 | 10 | 20, { title: string; body: string }> = {
  5: {
    title: '5 minutes a day',
    body: 'Best for building the habit. About one short lesson or a quick game. Small, steady wins.',
  },
  10: {
    title: '10 minutes a day',
    body: 'A solid daily rhythm. Finish a lesson and revisit one drill, or chain two short games.',
  },
  20: {
    title: '20 minutes a day',
    body: 'Serious pace. A full lesson plus practice — you’ll see noticeable progress week over week.',
  },
};

/**
 * Informational dialog explaining what a daily-time choice unlocks
 * (spec_onboarding_tweaks §commitment). Non-destructive, backdrop-tap dismisses.
 */
export function LearningTimeInfoDialog({ minutes, onDismiss }: LearningTimeInfoDialogProps) {
  const { title, body } = COPY[minutes];

  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon="clock" iconSize={26} stroke={2} iconColor={Colors.secondary} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11),
          letterSpacing: 1.4,
          color: Colors.secondary,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
        maxFontSizeMultiplier={1.4}
      >
        Daily goal
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(20),
          letterSpacing: -0.3,
          color: Colors.onSurface,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.3}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(14),
          lineHeight: moderateScale(20),
          color: Colors.tertiary,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.4}
      >
        {body}
      </Text>
      <Button label="Got it" variant="primary" onPress={onDismiss} />
    </View>
  );
}
