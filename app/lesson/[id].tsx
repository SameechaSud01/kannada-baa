import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { PhraseCard } from '../../components/ui/PhraseCard';
import { CultureCard } from '../../components/ui/CultureCard';
import { ScriptToggle } from '../../components/lesson/ScriptToggle';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useProgressStore } from '../../stores/progressStore';
import { playAudio, startRecording, stopRecording } from '../../services/audio/audioService';
import lessonsData from '../../data/lessons.json';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    scriptModeDefault,
    setScriptMode,
    updateLessonProgress,
    completeLesson,
    updateStreak,
    recordActivity,
    lessonProgress,
  } = useProgressStore();

  const lesson = lessonsData.lessons.find((l) => l.id === id);
  if (!lesson) return null;

  const savedIndex = lessonProgress[lesson.id] ?? 0;
  const [currentIndex, setCurrentIndex] = useState(savedIndex);
  const [showScript, setShowScript] = useState(scriptModeDefault === 'script');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const phrase = lesson.phrases[currentIndex];
  const progress = (currentIndex + 1) / lesson.totalPhrases;

  const handlePlay = useCallback(async () => {
    setIsPlaying(true);
    await playAudio(phrase.audioFile);
    // Auto-reset after a reasonable duration
    setTimeout(() => setIsPlaying(false), 2000);
  }, [phrase.audioFile]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
    } else {
      await startRecording();
      setIsRecording(true);
      // Auto-reset after 3 seconds
      setTimeout(async () => {
        await stopRecording();
        setIsRecording(false);
      }, 3000);
    }
  }, [isRecording]);

  const handleCheck = useCallback(() => {
    // For MVP, just advance to the next phrase
    handleNext();
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < lesson.phrases.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      updateLessonProgress(lesson.id, nextIndex);
    } else {
      // Lesson complete
      completeLesson(lesson.id, lesson.totalPhrases, lesson.estimatedMinutes);
      updateStreak();
      recordActivity();
      router.back();
    }
  }, [currentIndex, lesson]);

  const handleToggle = useCallback(
    (mode: 'script' | 'roman') => {
      setShowScript(mode === 'script');
      setScriptMode(mode);
    },
    []
  );

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
          <Pressable onPress={() => router.back()}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={Colors.textOnGreen}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

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

      {/* Gold progress strip */}
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.sm,
          }}
        >
          <View style={{ flex: 1, marginRight: Spacing.md }}>
            <ProgressBar progress={progress} height={6} />
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            {currentIndex + 1} / {lesson.totalPhrases}
          </Text>
        </View>
      </View>

      {/* Script Toggle */}
      <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
        <ScriptToggle
          activeMode={showScript ? 'script' : 'roman'}
          onToggle={handleToggle}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: Spacing.lg }}>
        {/* Phrase Card */}
        <PhraseCard
          script={phrase.script}
          roman={phrase.roman}
          meaning={phrase.meaning}
          showScript={showScript}
          onPlay={handlePlay}
          onRecord={handleRecord}
          onCheck={handleCheck}
          isPlaying={isPlaying}
          isRecording={isRecording}
        />

        {/* Culture card */}
        <View style={{ marginTop: Spacing.xl }}>
          <CultureCard
            label={lesson.culturalNote.label}
            text={lesson.culturalNote.text}
          />
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + 2,
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.medium,
              fontSize: 15,
              color: Colors.textOnGreen,
            }}
          >
            {currentIndex < lesson.phrases.length - 1 ? 'ಮುಂದುವರಿಸಿ →' : 'ಪೂರ್ಣಗೊಂಡಿದೆ ✓'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
