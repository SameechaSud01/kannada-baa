import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, { active: (color: string) => React.ReactElement; label: string }> = {
  index: {
    label: 'Home',
    active: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
          fill={color === Colors.primary ? Colors.primary : 'none'}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  learn: {
    label: 'Learn',
    active: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          fill={color === Colors.primary ? Colors.primary : 'none'}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  practice: {
    label: 'Practice',
    active: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"
          fill={color === Colors.primary ? Colors.primary : 'none'}
          stroke={color}
          strokeWidth={2}
        />
        <Path
          d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  profile: {
    label: 'Profile',
    active: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={12}
          cy={7}
          r={4}
          fill={color === Colors.primary ? Colors.primary : 'none'}
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    ),
  },
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.cardBg,
        borderTopWidth: 0.5,
        borderTopColor: Colors.border,
        paddingBottom: Spacing.xl,
        paddingTop: Spacing.md,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabInfo = TAB_ICONS[route.name];
        if (!tabInfo) return null;

        const color = isFocused ? Colors.primary : Colors.textTertiary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: Spacing.xs,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: Radius.sm,
                backgroundColor: isFocused ? Colors.primaryLight : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tabInfo.active(color)}
            </View>
            <Text
              style={{
                fontFamily: isFocused ? Fonts.dmSans.bold : Fonts.dmSans.regular,
                fontSize: 10,
                color,
              }}
            >
              {tabInfo.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
