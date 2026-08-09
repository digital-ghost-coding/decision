import type { ColorSchemeName, ImageSourcePropType } from 'react-native';

import type { JourneyIllustrationKey } from '../types/journey';

type JourneyIllustrationVariants = Record<
  'light' | 'dark',
  ImageSourcePropType
>;

export const journeyIllustrations: Record<
  JourneyIllustrationKey,
  JourneyIllustrationVariants
> = {
  explorer: {
    light: require('../../assets/illustrations/journey/explorer/chapter-1-light.png'),
    dark: require('../../assets/illustrations/journey/explorer/chapter-1-dark.png'),
  },
  analyst: {
    light: require('../../assets/illustrations/journey/analyst/chapter-2-light.png'),
    dark: require('../../assets/illustrations/journey/analyst/chapter-2-dark.png'),
  },
  strategist: {
    light: require('../../assets/illustrations/journey/strategist/chapter-3-light.png'),
    dark: require('../../assets/illustrations/journey/strategist/chapter-3-dark.png'),
  },
  'decision-maker': {
    light: require('../../assets/illustrations/journey/decision-maker/chapter-4-light.png'),
    dark: require('../../assets/illustrations/journey/decision-maker/chapter-4-dark.png'),
  },
  visionary: {
    light: require('../../assets/illustrations/journey/visionary/chapter-5-light.png'),
    dark: require('../../assets/illustrations/journey/visionary/chapter-5-dark.png'),
  },
};

export function getJourneyIllustration(
  key: JourneyIllustrationKey,
  colorScheme: ColorSchemeName,
) {
  return journeyIllustrations[key][colorScheme === 'dark' ? 'dark' : 'light'];
}
