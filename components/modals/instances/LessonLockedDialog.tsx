import { Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Halo } from '../Halo';
import { Button } from '../../ui/Button';

export interface LessonLockedDialogProps {
  /** 1-indexed lesson number being tapped. */
  lessonNumber: number;
  lessonTitle: string;
  prevLessonNumber: number;
  prevLessonTitle: string;
  onGoToPrev: () => void;
  onDismiss: () => void;
}

/**
 * Info dialog shown when the user taps a locked lesson on /(tabs)/learn
 * (MODALS §6.3). Uses the lighter 0.4 backdrop dim — non-destructive.
 */
export function LessonLockedDialog({
  lessonNumber,
  lessonTitle,
  prevLessonNumber,
  prevLessonTitle,
  onGoToPrev,
  onDismiss,
}: LessonLockedDialogProps) {
  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo
          icon="lock"
          iconSize={26}
          stroke={2}
          iconColor={Colors.secondary}
        />
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
        {lessonTitle} — coming up next
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
        Finish{' '}
        <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
          Lesson {prevLessonNumber} · {prevLessonTitle}
        </Text>{' '}
        to open this one. We unlock as you go — no shortcuts, no shaming.
      </Text>
      <Button
        label={`Continue Lesson ${prevLessonNumber}`}
        variant="secondary"
        onPress={onGoToPrev}
        trailingIcon="forward"
      />
      <Pressable
        onPress={onDismiss}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Not now"
        style={({ pressed }) => ({
          alignItems: 'center',
          paddingVertical: moderateScale(8),
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Not now
        </Text>
      </Pressable>
    </View>
  );
}
