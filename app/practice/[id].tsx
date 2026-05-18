import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useCompletedLessons } from '../../hooks/progress';
import { LESSONS } from '../../constants/lessons';
import { PLANNED_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { GAMES } from '../(tabs)/practice';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();

  const game = GAMES.find((g) => g.id === id);

  // Default-all-selected chip set, one per completed lesson.
  const completedSlots = useMemo(() => {
    return completedLessons.map((lessonId, idx) => {
      const real = LESSONS[lessonId];
      const planned = PLANNED_LESSON_SLOTS[idx];
      return {
        lessonId,
        slot: idx + 1,
        title: real?.situation.title ?? planned?.title ?? `Lesson ${idx + 1}`,
        char: planned?.charPlaceholder ?? 'ಕ',
      };
    });
  }, [completedLessons]);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(completedLessons)
  );

  const toggle = (lessonId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  if (!game) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.surface,
          paddingTop: insets.top + 32,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 18,
            color: Colors.onSurface,
            marginBottom: 8,
          }}
        >
          Game not found
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 14,
              color: Colors.primary,
              paddingVertical: 12,
            }}
          >
            ← Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleStart = () => {
    if (selected.size === 0) return;
    // Game runners are out of scope for Spec 01 — this is the entrypoint only.
    Alert.alert(
      'Round queued',
      `Starting ${game.title} with ${selected.size} lesson${selected.size === 1 ? '' : 's'} loaded.\n\nGame runner UI is not implemented in this spec.`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={20} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 20,
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {game.title}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 14,
              color: Colors.tertiary,
              lineHeight: 20,
              marginBottom: 28,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Pick which lessons to practice. Everything you&apos;ve completed is available.
          </Text>

          {completedSlots.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.surfaceContainerHighest,
                borderRadius: Radius.lg,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.medium,
                  fontSize: 14,
                  color: Colors.onSurface,
                  marginBottom: 6,
                }}
              >
                No lessons completed yet
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: 13,
                  color: Colors.tertiary,
                  lineHeight: 18,
                }}
              >
                Finish Lesson 1 to start practicing here.
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {completedSlots.map((slot) => {
                const isSelected = selected.has(slot.lessonId);
                return (
                  <Pressable
                    key={slot.lessonId}
                    onPress={() => toggle(slot.lessonId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`Lesson ${slot.slot}: ${slot.title}`}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: Radius.full,
                      minHeight: 44,
                      backgroundColor: isSelected
                        ? Colors.secondaryFixed
                        : Colors.surfaceContainerHigh,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.notoSerifKannada.bold,
                        fontSize: 18,
                        lineHeight: 26,
                        paddingTop: 2,
                        color: isSelected
                          ? Colors.onSecondaryContainer
                          : Colors.primary,
                      }}
                      maxFontSizeMultiplier={1.2}
                    >
                      {slot.char}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.bold,
                        fontSize: 13,
                        color: isSelected
                          ? Colors.onSecondaryContainer
                          : Colors.onSurface,
                      }}
                      maxFontSizeMultiplier={1.3}
                    >
                      Lesson {slot.slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom — Start round */}
      {completedSlots.length > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 12 + insets.bottom,
            backgroundColor: Colors.surface,
          }}
        >
          <Pressable
            onPress={handleStart}
            disabled={selected.size === 0}
            accessibilityRole="button"
            accessibilityLabel={`Start round with ${selected.size} lesson${
              selected.size === 1 ? '' : 's'
            }`}
            style={({ pressed }) => ({
              backgroundColor:
                selected.size === 0 ? Colors.surfaceDim : Colors.primary,
              borderRadius: Radius.lg,
              paddingVertical: 16,
              alignItems: 'center',
              transform: [{ scale: pressed && selected.size > 0 ? 0.98 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 16,
                color: selected.size === 0 ? Colors.tertiary : Colors.surface,
                letterSpacing: 0.2,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {selected.size === 0
                ? 'Select at least one lesson'
                : `Start round · ${selected.size} lesson${selected.size === 1 ? '' : 's'}`}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
