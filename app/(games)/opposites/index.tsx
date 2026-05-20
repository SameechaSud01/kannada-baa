import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { GAMES } from '@/constants/games';
import { LessonSelector } from '@/components/lesson/LessonSelector';
import { useLessons } from '@/hooks/useLessons';

export default function OppositesLessonSelectorScreen() {
  const router = useRouter();
  const lessons = useLessons();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <LessonSelector
        game={GAMES.opposites}
        lessons={lessons}
        onSelectLesson={(lesson) => router.push(`/opposites/${lesson.n}`)}
        onBack={() => router.replace('/practice')}
      />
    </SafeAreaView>
  );
}
