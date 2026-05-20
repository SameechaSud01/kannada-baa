import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Icons, type IconName } from '../../constants/icons';

export interface HaloProps {
  icon: IconName;
  /** Outer circle size in design units (will be scaled). */
  size?: number;
  /** Icon size. */
  iconSize?: number;
  /** Tabler stroke width. */
  stroke?: number;
  iconColor?: string;
  /** Inner glow start (origin). */
  glowFrom?: string;
  /** Outer fade target. */
  glowTo?: string;
}

/**
 * Decorative radial-gradient halo used by exit/lock/permission/TTS dialogs
 * and the streak medallion (MODALS §6.1/§6.3/§6.6/§6.8/§6.9).
 *
 * Implemented with react-native-svg so the radial gradient renders properly
 * across iOS and Android — plain RN <View> cannot do radial gradients.
 */
export function Halo({
  icon,
  size = 72,
  iconSize = 28,
  stroke = 2.4,
  iconColor = Colors.primary,
  glowFrom = Colors.secondaryFixed,
  glowTo = Colors.surfaceContainerHigh,
}: HaloProps) {
  const dim = moderateScale(size);
  const IconCmp = Icons[icon];
  return (
    <View
      style={{
        width: dim,
        height: dim,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Svg width={dim} height={dim} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient
            id="halo"
            cx="30%"
            cy="30%"
            rx="70%"
            ry="70%"
            fx="30%"
            fy="30%"
          >
            <Stop offset="0%" stopColor={glowFrom} stopOpacity="1" />
            <Stop offset="100%" stopColor={glowTo} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle cx={dim / 2} cy={dim / 2} r={dim / 2} fill="url(#halo)" />
      </Svg>
      <IconCmp size={moderateScale(iconSize)} color={iconColor} strokeWidth={stroke} />
    </View>
  );
}
