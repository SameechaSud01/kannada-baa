import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { PhraseCard } from '../../components/ui/PhraseCard';
import { ScriptToggle } from '../../components/lesson/ScriptToggle';
import { useProgressStore } from '../../stores/progressStore';
import { playAudio, startRecording, stopRecording } from '../../services/audio/audioService';
import lessonsData from '../../data/lessons.json';

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const { scriptModeDefault, setScriptMode } = useProgressStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  const [showScript, setShowScript] = useState(scriptModeDefault === 'script');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  // Collect all phrases for practice
  const allPhrases = lessonsData.lessons.flatMap((l) => l.phrases);
  // Shuffle deterministically by day so user gets same set within a day
  const today = new Date().getDate();
  const dailyPhrases = allPhrases
    .sort((a, b) => {
      const hashA = a.id.charCodeAt(a.id.length - 1) + today;
      const hashB = b.id.charCodeAt(b.id.length - 1) + today;
      return hashA - hashB;
    })
    .slice(0, 5);

  const handleToggle = useCallback(
    (mode: 'script' | 'roman') => {
      setShowScript(mode === 'script');
      setScriptMode(mode);
    },
    []
  );

  const handlePlay = useCallback(async (audioFile: string) => {
    setIsPlaying(true);
    await playAudio(audioFile);
    setTimeout(() => setIsPlaying(false), 2000);
  }, []);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
    } else {
      await startRecording();
      setIsRecording(true);
      setTimeout(async () => {
        await stopRecording();
        setIsRecording(false);
      }, 3000);
    }
  }, [isRecording]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.pageBg,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* App Bar */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          backgroundColor: Colors.primary,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: 20 }} />
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: 17,
              color: Colors.textOnGreen,
            }}
          >
            Kannada Baa
          </Text>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2c.5 3.5 4 6 4 10a4 4 0 0 1-8 0c0-4 3.5-6.5 4-10z"
              fill={Colors.accent}
              stroke={Colors.accent}
              strokeWidth={1.5}
            />
          </Svg>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 10,
            letterSpacing: 1.4,
            color: Colors.textTertiary,
            marginBottom: Spacing.md,
          }}
        >
          DAILY PRACTICE
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 16,
            color: Colors.textBody,
            marginBottom: Spacing.lg,
          }}
        >
          Practice these phrases today
        </Text>

        <View style={{ marginBottom: Spacing.lg }}>
          <ScriptToggle activeMode={showScript ? 'script' : 'roman'} onToggle={handleToggle} />
        </View>

        {dailyPhrases.map((phrase) => (
          <View key={phrase.id} style={{ marginBottom: Spacing.lg }}>
            <PhraseCard
              script={phrase.script}
              roman={phrase.roman}
              meaning={phrase.meaning}
              showScript={showScript}
              onPlay={() => handlePlay(phrase.audioFile)}
              onRecord={handleRecord}
              onCheck={() => {}}
              isPlaying={isPlaying}
              isRecording={isRecording}
            />
          </View>
        ))}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Animated.View>
  );
}
