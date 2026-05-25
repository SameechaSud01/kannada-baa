import type { ReactNode } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { useDbLesson } from '../../hooks/useLessons';
import { useLessonRunner } from '../../hooks/useLessonRunner';
import { SituationPhase } from '../../components/lesson/SituationPhase';
import { TeachWordsPhase } from '../../components/lesson/TeachWordsPhase';
import { PracticeWordsPhase } from '../../components/lesson/PracticeWordsPhase';
import { TeachPhrasesPhase } from '../../components/lesson/TeachPhrasesPhase';
import { PracticePhrasesPhase } from '../../components/lesson/PracticePhrasesPhase';
import { SummaryPhase } from '../../components/lesson/SummaryPhase';
import { RealWorldPhase } from '../../components/lesson/RealWorldPhase';
import { DoneCard } from '../../components/lesson/DoneCard';
import { ExitBackButton } from '../../components/ui/ExitBackButton';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lessonQuery = useDbLesson(id);
  const lesson = lessonQuery.data ?? null;
  const runner = useLessonRunner(lesson);

  if (lessonQuery.isLoading) {
    return <LessonLoading />;
  }

  if (!lesson) {
    return <LessonNotFound onBack={() => router.back()} />;
  }

  let phaseEl: ReactNode = null;
  switch (runner.phase) {
    case 'idle':
    case 'situation':
      phaseEl = <SituationPhase lesson={lesson} onAdvance={runner.advance} />;
      break;
    case 'teach_words':
      phaseEl = (
        <TeachWordsPhase
          words={lesson.words}
          wordIndex={runner.wordIndex}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'practice_words':
      phaseEl = (
        <PracticeWordsPhase
          words={lesson.words}
          practiceWordIndex={runner.practiceWordIndex}
          step={runner.practiceWordStep}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'teach_phrases':
      phaseEl = (
        <TeachPhrasesPhase
          phrases={lesson.phrases}
          words={lesson.words}
          phraseIndex={runner.phraseIndex}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'practice_phrases':
      phaseEl = (
        <PracticePhrasesPhase
          phrases={lesson.phrases}
          practicePhrasesIndex={runner.practicePhrasesIndex}
          step={runner.practicePhrasesStep}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'summary':
      phaseEl = (
        <SummaryPhase
          words={lesson.words}
          phrases={lesson.phrases}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'real_world':
      phaseEl = (
        <RealWorldPhase
          prompt={lesson.realWorldPrompt}
          title={lesson.title}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'done':
      return <DoneCard lesson={lesson} runner={runner} onClose={() => router.back()} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {phaseEl}
      <ExitBackButton />
    </View>
  );
}

function LessonLoading() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top,
      }}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

function LessonNotFound({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xxxl,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(20),
          color: Colors.onSurface,
          marginBottom: Spacing.sm,
        }}
      >
        Lesson not found
      </Text>
      <Text
        onPress={onBack}
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(14),
          color: Colors.primaryContainer,
          marginTop: Spacing.lg,
        }}
      >
        ← Back
      </Text>
    </View>
  );
}
