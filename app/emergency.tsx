import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Spacing, Radius } from '../constants/spacing';
import { Icons } from '../constants/icons';
import { deviceTtsAudioService } from '../services/audio/deviceTtsAudioService';
import { useEmergencyPhrases } from '../hooks/useEmergencyPhrases';

function GroupIcon({ id }: { id: string }) {
  const color = Colors.primary;
  if (id === 'auto') return <Icons.emAuto size={18} color={color} />;
  if (id === 'trouble') return <Icons.emHelp size={18} color={color} />;
  return <Icons.emBasic size={18} color={color} />;
}

export default function EmergencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: groups, isLoading, isError, refetch } = useEmergencyPhrases();

  const play = (text: string) => {
    deviceTtsAudioService
      .play(text)
      .catch((err) => console.warn('[audio] emergency phrase failed', err));
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header — back arrow + title, no hamburger, no tab bar change */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
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
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
        >
          Emergency Kannada
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError || !groups ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: Spacing.xxl,
            gap: Spacing.md,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(16),
              color: Colors.onSurface,
              textAlign: 'center',
            }}
          >
            Couldn&apos;t load phrases
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              textAlign: 'center',
            }}
          >
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            style={({ pressed }) => ({
              backgroundColor: Colors.primary,
              borderRadius: Radius.lg,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.xl,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(14),
                color: Colors.onPrimary,
              }}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
        >
          <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(14),
                color: Colors.tertiary,
                lineHeight: moderateScale(20),
                marginBottom: moderateScale(28),
              }}
            >
              Survival phrases for the auto, shop & street.{'\n'}
              <Text style={{ fontFamily: Fonts.lora.italic, fontSize: moderateScale(12) }}>
                [Unverified — pending Kannada-speaker review]
              </Text>
            </Text>

            {groups.map((group, gi) => (
              <View
                key={group.id}
                style={{
                  marginBottom: gi === groups.length - 1 ? 0 : moderateScale(28),
                }}
              >
                {/* Group label */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: moderateScale(10),
                    marginBottom: moderateScale(14),
                    paddingHorizontal: Spacing.xs,
                  }}
                >
                  <View
                    style={{
                      width: moderateScale(28),
                      height: moderateScale(28),
                      borderRadius: Radius.sm,
                      backgroundColor: Colors.surfaceContainerHigh,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GroupIcon id={group.id} />
                  </View>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: moderateScale(12),
                      letterSpacing: 2,
                      color: Colors.tertiary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {group.label}
                  </Text>
                </View>

                {/* Phrase rows — tonal surface, no border */}
                <View
                  style={{
                    backgroundColor: Colors.surfaceContainerHighest,
                    borderRadius: Radius.lg,
                    overflow: 'hidden',
                  }}
                >
                  {group.items.map((item, idx) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: moderateScale(14),
                        paddingHorizontal: Spacing.lg,
                        // surface shift acts as separator (§2 No-Line)
                        backgroundColor:
                          idx % 2 === 0
                            ? Colors.surfaceContainerHighest
                            : Colors.surfaceContainerHigh,
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: moderateScale(14) }}>
                        {item.transliteration ? (
                          <Text
                            style={{
                              fontFamily: Fonts.lora.italic,
                              fontSize: moderateScale(20),
                              lineHeight: moderateScale(28),
                              color: Colors.onSurface,
                              marginBottom: moderateScale(2),
                            }}
                            maxFontSizeMultiplier={1.3}
                          >
                            {item.transliteration}
                          </Text>
                        ) : null}
                        <Text
                          style={{
                            fontFamily: Fonts.dmSans.medium,
                            fontSize: moderateScale(14),
                            color: Colors.tertiary,
                            lineHeight: moderateScale(19),
                          }}
                          maxFontSizeMultiplier={1.4}
                        >
                          {item.meaning}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.notoSerifKannada.regular,
                            fontSize: moderateScale(13),
                            color: Colors.tertiary,
                            lineHeight: moderateScale(20),
                            marginTop: moderateScale(4),
                            opacity: 0.7,
                          }}
                          maxFontSizeMultiplier={1.4}
                        >
                          {item.kannada}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => play(item.audioUrl ?? item.kannada)}
                        accessibilityRole="button"
                        accessibilityLabel={`Listen: ${item.meaning}`}
                        hitSlop={8}
                        style={({ pressed }) => ({
                          width: moderateScale(44),
                          height: moderateScale(44),
                          borderRadius: Radius.full,
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: pressed ? 0.6 : 1,
                        })}
                      >
                        <Icons.audio size={18} color={Colors.secondary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(12),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: moderateScale(28),
              }}
            >
              Audio uses your device&apos;s voice.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
