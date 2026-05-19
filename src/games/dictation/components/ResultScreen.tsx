import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../../constants/colors';
import { Fonts } from '../../../../constants/fonts';
import { Icons } from '../../../../constants/icons';
import { Radius, Spacing } from '../../../../constants/spacing';

type Props = {
  sessionAvg: number;
  answeredCount: number;
  totalWords: number;
  onReplay: () => void;
};

function resultIcon(avg: number) {
  if (avg === 100) return Icons.tabPractice;
  if (avg >= 80) return Icons.ratingEasy;
  if (avg >= 55) return Icons.ratingOk;
  return Icons.ratingHard;
}

function title(avg: number): string {
  if (avg === 100) return 'perfect score!';
  if (avg >= 80) return 'well done!';
  if (avg >= 55) return 'keep practising!';
  return 'keep learning!';
}

const ResultScreen: React.FC<Props> = ({ sessionAvg, answeredCount, totalWords, onReplay }) => {
  const router = useRouter();
  const skipped = totalWords - answeredCount;
  const ResultIcon = resultIcon(sessionAvg);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.lg }}>
      <ResultIcon size={moderateScale(24)} color={Colors.primary} />
      <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 22, color: Colors.onSurface }}>
        {title(sessionAvg)}
      </Text>
      <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 52, color: Colors.primary }}>
        {sessionAvg}%
      </Text>
      <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 14, color: Colors.tertiary, textAlign: 'center' }}>
        average match across {answeredCount} word{answeredCount !== 1 ? 's' : ''}
      </Text>
      {skipped > 0 && (
        <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 13, color: Colors.tertiary, textAlign: 'center' }}>
          {skipped} word{skipped !== 1 ? 's' : ''} skipped
        </Text>
      )}
      <Pressable
        onPress={onReplay}
        style={({ pressed }) => ({
          width: '100%',
          backgroundColor: Colors.primary,
          borderRadius: Radius.lg,
          paddingVertical: Spacing.lg,
          alignItems: 'center',
          marginTop: Spacing.md,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: Colors.onPrimary }}>
          play again
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: Spacing.md, width: '100%' }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/practice')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.lg,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: Colors.onSurface }}>
            back to games
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(tabs)/')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.lg,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: Colors.onSurface }}>
            back home
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ResultScreen;
