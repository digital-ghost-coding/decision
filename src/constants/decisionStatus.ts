import type { AppIconName } from '../components/AppIcon';
import { colors } from '../theme';
import type { DecisionStatus } from '../types/decision';

export type DecisionStatusPresentation = {
  backgroundColor: string;
  color: string;
  icon: AppIconName;
  label: string;
};

export const decisionStatusPresentation: Record<
  DecisionStatus,
  DecisionStatusPresentation
> = {
  draft: {
    backgroundColor: colors.surfaceMuted,
    color: colors.secondaryText,
    icon: 'decision',
    label: 'Brouillon',
  },
  reflecting: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    icon: 'decision',
    label: 'En réflexion',
  },
  acted: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    icon: 'check-circle',
    label: 'Actée',
  },
  tracking: {
    backgroundColor: colors.journeySky,
    color: colors.primaryDark,
    icon: 'clock',
    label: 'En suivi',
  },
  completed: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    icon: 'check-circle',
    label: 'Terminée',
  },
  cancelled: {
    backgroundColor: colors.dangerSoft,
    color: colors.dangerMuted,
    icon: 'close',
    label: 'Annulée',
  },
  archived: {
    backgroundColor: colors.surfaceMuted,
    color: colors.secondaryText,
    icon: 'archive',
    label: 'Archivée',
  },
};
