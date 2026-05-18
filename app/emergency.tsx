import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Radius } from '../constants/spacing';
import { Icons } from '../constants/icons';
import { deviceTtsAudioService } from '../services/audio/deviceTtsAudioService';
import emergencyData from '../data/emergency.json';

type EmergencyItem = {
  kn: string;
  roman: string;
  en: string;
  audio: string;
};

type EmergencyGroup = {
  id: string;
  label: string;
  icon: string;
  items: EmergencyItem[];
};

type EmergencyFile = {
  groups: EmergencyGroup[];
};

const GROUPS = (emergencyData as EmergencyFile).groups;

function GroupIcon({ id }: { id: string }) {
  const color = Colors.primary;
  if (id === 'auto') return <Icons.emAuto size={18} color={color} />;
  if (id === 'trouble') return <Icons.emHelp size={18} color={color} />;
  return <Icons.emBasic size={18} color={color} />;
}

export default function EmergencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        >
          Emergency Kannada
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
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
          >
            Survival phrases for the auto, shop & street. Works offline.{'\n'}
            <Text style={{ fontFamily: Fonts.lora.italic, fontSize: 12 }}>
              [Unverified — pending Kannada-speaker review]
            </Text>
          </Text>

          {GROUPS.map((group, gi) => (
            <View
              key={group.id}
              style={{
                marginBottom: gi === GROUPS.length - 1 ? 0 : 28,
              }}
            >
              {/* Group label */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 14,
                  paddingHorizontal: 4,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
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
                    fontSize: 12,
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
                    key={`${group.id}-${idx}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      // surface shift acts as separator (§2 No-Line)
                      backgroundColor:
                        idx % 2 === 0
                          ? Colors.surfaceContainerHighest
                          : Colors.surfaceContainerHigh,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 14 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.notoSerifKannada.bold,
                          fontSize: 22,
                          lineHeight: 34,
                          color: Colors.primary,
                          marginBottom: 2,
                        }}
                        maxFontSizeMultiplier={1.4}
                      >
                        {item.kn}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.lora.italic,
                          fontSize: 13,
                          color: Colors.tertiary,
                          lineHeight: 18,
                        }}
                        maxFontSizeMultiplier={1.4}
                      >
                        {item.roman} · {item.en}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => play(item.audio)}
                      accessibilityRole="button"
                      accessibilityLabel={`Listen: ${item.en}`}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        width: 44,
                        height: 44,
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
              fontSize: 12,
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: 28,
            }}
          >
            Works offline. Audio uses your device&apos;s voice.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
