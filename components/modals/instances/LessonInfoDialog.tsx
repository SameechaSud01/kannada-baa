import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { Halo } from '../Halo';
import { Button } from '../../ui/Button';

export interface LessonInfoDialogProps {
  lessonNumber: number;
  lessonTitle: string;
  description: string;
  phraseCount: number;
  estimatedMinutes: number;
  locked?: boolean;
  prevLessonNumber?: number;
  prevLessonTitle?: string;
  onDismiss: () => void;
}

export function LessonInfoDialog({
  lessonNumber,
  lessonTitle,
  description,
  phraseCount,
  estimatedMinutes,
  locked,
  prevLessonNumber,
  prevLessonTitle,
  onDismiss,
}: LessonInfoDialogProps) {
  const stats =
    phraseCount > 0
      ? `${phraseCount} phrases · ~${estimatedMinutes} min`
      : `~${estimatedMinutes} min`;

  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon="info" iconSize={26} stroke={2} iconColor={Colors.secondary} />
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
        Lesson {lessonNumber}
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
        {lessonTitle}
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
        {description}
      </Text>
      <View
        style={{
          alignItems: 'center',
          paddingVertical: Spacing.xs,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.4}
        >
          {stats}
        </Text>
      </View>
      {locked && prevLessonNumber && prevLessonTitle ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            lineHeight: moderateScale(19),
            color: Colors.tertiary,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.4}
        >
          Complete{' '}
          <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
            Lesson {prevLessonNumber} · {prevLessonTitle}
          </Text>{' '}
          to unlock.
        </Text>
      ) : null}
      <Button label="Got it" variant="primary" onPress={onDismiss} />
    </View>
  );
}
