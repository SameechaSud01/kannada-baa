import { ScrollView, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import type { GuideSection } from '../../constants/guide';
import { GlyphCard } from './GlyphCard';
import { RuleCard } from './RuleCard';
import { KeyRow } from './KeyRow';

interface GuidePageProps {
  section: GuideSection;
  width: number;
  height: number;
  showOnboardingHeader?: boolean;
}

/**
 * One pager page = one Beginners' Guide section.
 * Owns the section's title + subtitle and an internal vertical ScrollView so
 * long sections (consonants: 34 items) still scroll inside their own page.
 */
export function GuidePage({
  section,
  width,
  height,
  showOnboardingHeader = false,
}: GuidePageProps) {
  const isKeySection = section.slug === 'pronunciation-key';

  return (
    <View style={{ width, height }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.lg,
          paddingBottom: Spacing.xxl,
        }}
      >
        {showOnboardingHeader && (
          <>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(28),
                color: Colors.onSurface,
                marginBottom: Spacing.sm,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Before you start
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(15),
                lineHeight: moderateScale(22),
                color: Colors.tertiary,
                marginBottom: Spacing.xxl,
              }}
              maxFontSizeMultiplier={1.4}
            >
              A quick guide to how Kannada sounds. You can revisit this anytime from the Learn tab.
            </Text>
          </>
        )}

        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            marginBottom: Spacing.xs,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {section.title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            lineHeight: moderateScale(19),
            color: Colors.tertiary,
            marginBottom: Spacing.lg,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {section.subtitle}
        </Text>

        {isKeySection ? (
          <View>
            {section.items.map((item, idx) => {
              if (item.kind !== 'key') return null;
              return (
                <KeyRow
                  key={`${item.symbol}-${idx}`}
                  symbol={item.symbol}
                  example={item.example}
                />
              );
            })}
          </View>
        ) : (
          <View style={{ gap: Spacing.md }}>
            {section.items.map((item, idx) => {
              if (item.kind === 'glyph') {
                return (
                  <GlyphCard
                    key={`${section.slug}-${item.kannada}-${idx}`}
                    kannada={item.kannada}
                    transliteration={item.transliteration}
                    example={item.example}
                  />
                );
              }
              if (item.kind === 'rule') {
                return (
                  <RuleCard
                    key={`${section.slug}-${item.ruleKind}`}
                    title={item.title}
                    description={item.description}
                    examples={item.examples}
                  />
                );
              }
              return null;
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
