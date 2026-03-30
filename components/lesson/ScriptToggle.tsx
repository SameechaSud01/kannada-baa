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
        backgroundColor: Colors.primaryLight,
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
              backgroundColor: isActive ? Colors.cardBg : 'transparent',
              borderWidth: isActive ? 0.5 : 0,
              borderColor: Colors.border,
              alignItems: 'center',
              shadowColor: isActive ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isActive ? 0.06 : 0,
              shadowRadius: 2,
              elevation: isActive ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 12,
                color: Colors.primary,
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
