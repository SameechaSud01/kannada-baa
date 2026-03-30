import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StreakRingProps {
  days: number;
  maxDays?: number;
  size?: number;
}

export function StreakRing({ days, maxDays = 7, size = 120 }: StreakRingProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(days / maxDays, 1);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.primaryLight}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Fill */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.accent}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center text */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 28,
            color: Colors.primary,
          }}
        >
          {days}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 9,
            color: Colors.textTertiary,
            letterSpacing: 1.5,
          }}
        >
          DAYS
        </Text>
      </View>
    </View>
  );
}
