import { View, Text, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface ScriptToggleProps {
  activeMode: 'script' | 'roman';
  onToggle: (mode: 'script' | 'roman') => void;
}

export function ScriptToggle({ activeMode, onToggle }: ScriptToggleProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.surfaceContainerHigh,
        borderRadius: Radius.sm,
        padding: 3,
      }}
    >
      {(['script', 'roman'] as const).map((mode) => {
        const isActive = activeMode === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onToggle(mode)}
            style={{
              flex: 1,
              paddingVertical: Spacing.sm,
              borderRadius: Radius.sm - 2,
              // Active pill = solid tonal step (surface-highest) on container-high
              // bg. Inactive = transparent. No border, no shadow (§2/§4).
              backgroundColor: isActive ? Colors.surfaceContainerHighest : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 12,
                color: isActive ? Colors.primaryContainer : Colors.tertiary,
              }}
            >
              {mode === 'script' ? 'Script' : 'Roman'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
