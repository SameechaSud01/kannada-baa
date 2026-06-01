import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';

export function AppleGlyph() {
  const box = moderateScale(20);
  const glyph = moderateScale(18);
  return (
    <View
      style={{
        width: box,
        height: box,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={glyph} height={glyph} viewBox="0 0 24 24">
        <Path
          fill={Colors.onSurface}
          d="M17.564 12.74c-.025-2.55 2.082-3.78 2.178-3.84-1.187-1.736-3.034-1.974-3.692-2.001-1.572-.158-3.072.926-3.871.926-.812 0-2.039-.904-3.354-.879-1.726.025-3.319 1.003-4.207 2.547-1.794 3.108-.459 7.706 1.288 10.232.853 1.235 1.87 2.624 3.203 2.574 1.286-.052 1.77-.832 3.323-.832 1.553 0 1.989.832 3.348.806 1.382-.026 2.256-1.262 3.097-2.504.977-1.434 1.378-2.823 1.404-2.894-.031-.013-2.692-1.034-2.717-4.135zM15.04 5.193c.71-.86 1.189-2.054 1.058-3.24-1.023.041-2.26.681-2.994 1.54-.657.762-1.232 1.977-1.077 3.145 1.142.089 2.302-.581 3.013-1.445z"
        />
      </Svg>
    </View>
  );
}
