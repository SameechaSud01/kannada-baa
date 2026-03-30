import { useRef, useState, useEffect } from 'react';
import { View, Pressable, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

interface AudioButtonsProps {
  onPlay: () => void;
  onRecord: () => void;
  onCheck: () => void;
  isPlaying?: boolean;
  isRecording?: boolean;
}

export function AudioButtons({
  onPlay,
  onRecord,
  onCheck,
  isPlaying = false,
  isRecording = false,
}: AudioButtonsProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xl,
        marginTop: Spacing.lg,
      }}
    >
      {/* Mic Button */}
      <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
        <Pressable
          onPress={onRecord}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: Radius.full,
            backgroundColor: isRecording ? Colors.errorLight : Colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"
              fill={isRecording ? Colors.error : Colors.primary}
            />
            <Path
              d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
              stroke={isRecording ? Colors.error : Colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </Animated.View>

      {/* Play Button */}
      <Pressable
        onPress={onPlay}
        style={({ pressed }) => ({
          width: 56,
          height: 56,
          borderRadius: Radius.full,
          backgroundColor: isPlaying ? Colors.primaryDark : Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 4,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        {isPlaying ? (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M6 4h4v16H6zM14 4h4v16h-4z" fill={Colors.textOnGreen} />
          </Svg>
        ) : (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M8 5v14l11-7L8 5z" fill={Colors.textOnGreen} />
          </Svg>
        )}
      </Pressable>

      {/* Check Button */}
      <Pressable
        onPress={onCheck}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          borderRadius: Radius.full,
          backgroundColor: Colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} stroke={Colors.primary} strokeWidth={2} />
          <Path
            d="M8 12l3 3 5-5"
            stroke={Colors.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  );
}
