import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { useLessonRunner } from '../../hooks/useLessonRunner';
import { ScenarioPhase } from '../../components/lesson/ScenarioPhase';
import { IntakePhase } from '../../components/lesson/IntakePhase';
import { DrillPhase } from '../../components/lesson/drill/DrillPhase';
import { OutputPhase } from '../../components/lesson/output/OutputPhase';
import { DoneCard } from '../../components/lesson/DoneCard';
import { ExitBackButton } from '../../components/ui/ExitBackButton';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, advance, recordDrillAttempts } = useLessonRunner(id ?? '');
  const { lesson, phase, intakeIndex, drillAttempts } = state;

  if (!lesson) {
    return <LessonNotFound onBack={() => router.back()} />;
  }

  if (phase === 'done') {
    return (
      <DoneCard
        lesson={lesson}
        drillAttempts={drillAttempts}
        onClose={() => router.back()}
      />
    );
  }

  let phaseEl: ReactNode = null;
  switch (phase) {
    case 'idle':
    case 'scenario':
      phaseEl = <ScenarioPhase lesson={lesson} onContinue={advance} />;
      break;
    case 'intake':
      phaseEl = (
        <IntakePhase
          lesson={lesson}
          phraseIndex={intakeIndex}
          onAdvance={advance}
        />
      );
      break;
    case 'drill':
      phaseEl = (
        <DrillPhase
          lesson={lesson}
          onComplete={(attempts) => {
            recordDrillAttempts(attempts);
            advance();
          }}
        />
      );
      break;
    case 'output':
      phaseEl = <OutputPhase lesson={lesson} onAdvance={advance} />;
      break;
  }

  return (
    <View style={{ flex: 1 }}>
      {phaseEl}
      <ExitBackButton />
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
