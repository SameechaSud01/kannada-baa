import { View, Text, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

const TAB_ICONS: Record<string, { icon: TablerIcon; label: string }> = {
  index: { icon: Icons.tabHome, label: 'Home' },
  learn: { icon: Icons.tabLearn, label: 'Learn' },
  practice: { icon: Icons.tabPractice, label: 'Practice' },
  profile: { icon: Icons.tabProfile, label: 'Profile' },
};

const TAB_ICON_SIZE = 19; // Spec 03 §sizing

export function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        // Tonal step (surface-container-low) separates the tab bar from page
        // content — no border (§2 No-Line).
        backgroundColor: Colors.surfaceContainerLow,
        paddingBottom: Spacing.xl,
        paddingTop: Spacing.md,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabInfo = TAB_ICONS[route.name];
        if (!tabInfo) return null;
        const Icon = tabInfo.icon;

        const color = isFocused ? Colors.primaryContainer : Colors.tertiary;
        const iconColor = isFocused ? Colors.onPrimary : color;

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
            accessibilityRole="button"
            accessibilityLabel={tabInfo.label}
            accessibilityState={{ selected: isFocused }}
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
                backgroundColor: isFocused ? Colors.primaryContainer : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={TAB_ICON_SIZE} color={iconColor} strokeWidth={2} />
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
