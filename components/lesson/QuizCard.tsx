import { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface QuizCardProps {
  question: string;
  options: string[];
  correctIndex: number;
  onAnswer: (isCorrect: boolean) => void;
}

export function QuizCard({ question, options, correctIndex, onAnswer }: QuizCardProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  const handlePress = (index: number) => {
    const isCorrect = index === correctIndex;

    if (isCorrect) {
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    onAnswer(isCorrect);
  };

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.surfaceContainerHighest, Colors.secondaryFixed],
  });

  return (
    <Animated.View
      style={{
        backgroundColor: bgColor,
        borderRadius: Radius.xl,
        padding: Spacing.xxl,
        transform: [{ translateX: shakeAnim }],
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: 16,
          color: Colors.onSurface,
          textAlign: 'center',
          marginBottom: Spacing.xl,
        }}
      >
        {question}
      </Text>

      {options.map((option, index) => (
        <Pressable
          key={index}
          onPress={() => handlePress(index)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.secondaryFixed : Colors.surfaceContainerHigh,
            borderRadius: Radius.md,
            padding: Spacing.md,
            marginBottom: Spacing.sm,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 14,
              color: Colors.onSurface,
              textAlign: 'center',
            }}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}
