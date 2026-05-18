import { useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { transliterationMatches } from '../../../services/text/transliterationMatch';
import type { Phrase } from '../../../constants/lessons/types';

interface TypedResponseProps {
  expected: Phrase;
  value: string;
  onChangeValue: (next: string) => void;
  onMatchChange: (matched: boolean) => void;
}

export function TypedResponse({
  expected,
  value,
  onChangeValue,
  onMatchChange,
}: TypedResponseProps) {
  const matched = transliterationMatches(value, expected.transliteration);

  useEffect(() => {
    onMatchChange(matched);
  }, [matched, onMatchChange]);

  return (
    <View style={{ marginTop: Spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surfaceContainerHighest,
          borderWidth: matched ? 2 : 1,
          borderColor: matched ? Colors.primaryContainer : Colors.outlineVariant,
          borderRadius: Radius.md,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: 52,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeValue}
          placeholder={expected.transliteration.replace(/\[name\]/g, 'your name')}
          placeholderTextColor={Colors.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Type the Kannada transliteration"
          style={{
            flex: 1,
            fontFamily: Fonts.lora.italic,
            fontSize: 16,
            color: Colors.onSurface,
            paddingVertical: Spacing.sm,
          }}
        />
        {matched && (
          <View style={{ marginLeft: Spacing.sm }} accessibilityLabel="Match">
            <Icons.correct size={20} color={Colors.primaryContainer} />
          </View>
        )}
      </View>
    </View>
  );
}
