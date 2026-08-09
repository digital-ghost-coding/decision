import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  BellIcon,
  CaretRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleIcon,
  ClipboardTextIcon,
  ClockIcon,
  CompassIcon,
  DatabaseIcon,
  HouseIcon,
  ListChecksIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrophyIcon,
  TrashIcon,
  UserCircleIcon,
  XIcon,
  type Icon,
} from 'phosphor-react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors, iconSizes, iconWeights } from '../theme';

const icons = {
  add: PlusIcon,
  archive: ArchiveIcon,
  back: ArrowLeftIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'chevron-right': CaretRightIcon,
  circle: CircleIcon,
  close: XIcon,
  clock: ClockIcon,
  database: DatabaseIcon,
  decision: ClipboardTextIcon,
  decisions: ListChecksIcon,
  delete: TrashIcon,
  home: HouseIcon,
  journey: CompassIcon,
  notification: BellIcon,
  profile: UserCircleIcon,
  restore: ArrowCounterClockwiseIcon,
  search: MagnifyingGlassIcon,
  statistics: ChartBarIcon,
  trophy: TrophyIcon,
} satisfies Record<string, Icon>;

export type AppIconName = keyof typeof icons;
export type AppIconSize = keyof typeof iconSizes;
export type AppIconWeight = keyof typeof iconWeights;

type Props = {
  accessibilityLabel?: string;
  active?: boolean;
  color?: string;
  decorative?: boolean;
  mirrored?: boolean;
  name: AppIconName;
  size?: AppIconSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  weight?: AppIconWeight;
};

/**
 * Source unique des icônes fonctionnelles Decisionly.
 *
 * Les contrôles interactifs portent leur libellé d'accessibilité sur leur
 * Pressable parent. Une icône seule peut être annoncée en passant
 * `decorative={false}` et `accessibilityLabel`.
 */
export function AppIcon({
  accessibilityLabel,
  active = false,
  color = colors.secondaryText,
  decorative = true,
  mirrored = false,
  name,
  size = 'md',
  style,
  testID,
  weight = 'regular',
}: Props) {
  const IconComponent = icons[name];
  const resolvedSize = iconSizes[size];
  const resolvedWeight = iconWeights[active ? 'active' : weight];
  const isAccessible = !decorative && Boolean(accessibilityLabel);

  return (
    <View
      accessibilityElementsHidden={!isAccessible}
      accessibilityLabel={isAccessible ? accessibilityLabel : undefined}
      accessibilityRole={isAccessible ? 'image' : undefined}
      accessible={isAccessible}
      importantForAccessibility={isAccessible ? 'yes' : 'no'}
      pointerEvents="none"
      style={[
        styles.container,
        { height: resolvedSize, width: resolvedSize },
        style,
      ]}
      testID={testID}
    >
      <IconComponent
        color={color}
        mirrored={mirrored}
        size={resolvedSize}
        weight={resolvedWeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
