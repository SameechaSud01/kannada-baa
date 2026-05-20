import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { Button, ButtonRow } from '../../ui/Button';

export interface GoalCompleteDialogProps {
  goalMinutes: number;
  streakDays: number;
  onOneMore: () => void;
  onDone: () => void;
}

/**
 * Daily goal celebration dialog (MODALS §6.7). Lighter version of the streak
 * takeover — fires the first time today the user crosses their minutes goal.
 */
export function GoalCompleteDialog({
  goalMinutes,
  streakDays,
  onOneMore,
  onDone,
}: GoalCompleteDialogProps) {
  const ringSize = moderateScale(96);
  const stroke = moderateScale(8);
  const r = (ringSize - stroke) / 2;

  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: ringSize,
            height: ringSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Svg
            width={ringSize}
            height={ringSize}
            style={{ transform: [{ rotate: '-90deg' }] }}
          >
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke={Colors.surfaceContainerHigh}
              strokeWidth={stroke}
              fill="transparent"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke={Colors.secondaryContainer}
              strokeWidth={stroke}
              fill="transparent"
              strokeLinecap="round"
            />
          </Svg>
          <View style={{ position: 'absolute' }}>
            <Icons.check
              size={moderateScale(36)}
              color={Colors.secondary}
              strokeWidth={3}
            />
          </View>
        </View>
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
        Today&apos;s {goalMinutes} minutes
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(22),
          letterSpacing: -0.4,
          color: Colors.onSurface,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.3}
      >
        Done for today.
      </Text>
      <Text
        style={{
          fontFamily: Fonts.lora.italic,
          fontSize: moderateScale(14),
          lineHeight: moderateScale(20),
          color: Colors.tertiary,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.4}
      >
        Proud of you — go eat some thindi.
      </Text>
      <View
        style={{
          backgroundColor: Colors.secondaryFixed,
          borderRadius: Radius.lg,
          paddingVertical: moderateScale(10),
          paddingHorizontal: moderateScale(12),
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(10),
        }}
      >
        <Icons.flame
          size={moderateScale(16)}
          color={Colors.secondary}
          strokeWidth={2}
        />
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            color: Colors.onSecondaryContainer,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {streakDays}-day streak still alive
        </Text>
      </View>
      <ButtonRow>
        <Button label="I'm done" variant="ghost" onPress={onDone} flex />
        <Button
          label="One more"
          variant="secondary"
          onPress={onOneMore}
          trailingIcon="forward"
          flex
        />
      </ButtonRow>
    </View>
  );
}
