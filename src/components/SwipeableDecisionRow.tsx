import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { decisionStatusPresentation } from '../constants/decisionStatus';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Decision } from '../types/decision';
import { colors, motion, radii, shadows, spacing } from '../theme';
import {
  getDecisionSwipeTarget,
  shouldCaptureDecisionSwipe,
} from '../utils/swipeDecisionGesture';
import { AppIcon } from './AppIcon';
import { AnimatedPressable } from './AnimatedPressable';


const ACTION_WIDTH = 92;
const SWIPE_CAPTURE_DISTANCE = 14;

export type SwipeableDecisionRowHandle = {
  close: (animated?: boolean) => void;
  isOpen: () => boolean;
};


type Props = {
  decision: Decision;
  onArchive?: (decision: Decision) => void;
  onDelete: (decision: Decision) => void;
  onDidClose?: (decisionId: string) => void;
  onOpen: (decision: Decision) => void;
  onWillOpen?: (decisionId: string) => void;
};



function formatDecisionDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}


function getDecisionDateLabel(decision: Decision) {
  if (decision.status === 'tracking' && decision.trackingDate) {
    return `Retour prévu : ${formatDecisionDate(decision.trackingDate)}`;
  }

  return formatDecisionDate(decision.updatedAt);
}



function getSubtitle(decision: Decision) {

  if (
    decision.status === 'reflecting' &&
    decision.options
  ) {
    return `${decision.options.optionA} ou ${decision.options.optionB}`;
  }


  if (
    decision.chosenOption &&
    ['acted', 'tracking', 'completed'].includes(decision.status)
  ) {
    return `✓ Choisi : ${decision.chosenOption}`;
  }


  return null;
}



const SwipeableDecisionRowComponent = forwardRef<
  SwipeableDecisionRowHandle,
  Props
>(function SwipeableDecisionRowComponent({
  decision,
  onArchive,
  onDelete,
  onDidClose,
  onOpen,
  onWillOpen,
}, ref) {

  const translateX =
    useRef(new Animated.Value(0)).current;


  const gestureStart =
    useRef(0);


  const didSwipe =
    useRef(false);


  const isOpen =
    useRef(false);


  const activeAnimation =
    useRef<Animated.CompositeAnimation | null>(null);


  const reduceMotion = useReducedMotion();



  const status =
    decisionStatusPresentation[decision.status];



  const subtitle =
    useMemo(
      () => getSubtitle(decision),
      [
        decision.status,
        decision.options,
        decision.chosenOption,
      ],
    );



  const actionsWidth =
    ACTION_WIDTH * (onArchive ? 2 : 1);



  const settle = useCallback(
    (value: number, animated = true) => {

      activeAnimation.current?.stop();
      activeAnimation.current = null;
      translateX.stopAnimation();
      isOpen.current = value !== 0;

      const finish = () => {
        translateX.setValue(value);
        isOpen.current = value !== 0;

        if (value === 0) {
          onDidClose?.(decision.id);
        }
      };

      if (!animated || reduceMotion) {
        finish();
        return;
      }

      const animation = Animated.spring(
        translateX,
        {
          ...motion.spring,
          toValue: value,
          useNativeDriver: true,
        },
      );

      activeAnimation.current = animation;
      animation.start(({ finished }) => {
        if (activeAnimation.current !== animation) {
          return;
        }

        activeAnimation.current = null;

        if (finished) {
          finish();
        }
      });

    },
    [decision.id, onDidClose, reduceMotion, translateX],
  );



  const close = useCallback(
    (animated = true) => settle(0, animated),
    [settle],
  );



  const open = useCallback(
    () => settle(-actionsWidth),
    [
      actionsWidth,
      settle,
    ],
  );


  useImperativeHandle(
    ref,
    () => ({
      close,
      isOpen: () => isOpen.current,
    }),
    [close],
  );


  useEffect(() => {
    close(false);

    return () => {
      activeAnimation.current?.stop();
      activeAnimation.current = null;
      translateX.stopAnimation();
      translateX.setValue(0);
      isOpen.current = false;
    };
  }, [actionsWidth, close, translateX]);



  const panResponder = useMemo(
    () =>
      PanResponder.create({

        onMoveShouldSetPanResponder(
          _,
          gesture,
        ) {
          return shouldCaptureDecisionSwipe(
            gesture.dx,
            gesture.dy,
            isOpen.current,
          );
        },


        onPanResponderGrant() {

          didSwipe.current = false;
          onWillOpen?.(decision.id);


          activeAnimation.current?.stop();
          activeAnimation.current = null;

          translateX.stopAnimation(
            value => {
              gestureStart.current = value;
            },
          );

        },


        onPanResponderMove(
          _,
          gesture,
        ) {

          const nextValue =
            Math.max(
              -actionsWidth,
              Math.min(
                0,
                gestureStart.current +
                  gesture.dx,
              ),
            );


          didSwipe.current =
            Math.abs(gesture.dx) >
            SWIPE_CAPTURE_DISTANCE;


          translateX.setValue(nextValue);

        },


        onPanResponderRelease(
          _,
          gesture,
        ) {

          const current =
            gestureStart.current +
            gesture.dx;


          const target = getDecisionSwipeTarget(
            current,
            gesture.vx,
            actionsWidth,
          );


          target === -actionsWidth
            ? open()
            : close();

          requestAnimationFrame(() => {
            didSwipe.current = false;
          });

        },


        onPanResponderTerminate() {
          close();
          didSwipe.current = false;
        },


        onPanResponderTerminationRequest() {
          return true;
        },

      }),
    [
      actionsWidth,
      close,
      decision.id,
      onWillOpen,
      open,
      translateX,
    ],
  );



  const runAction = useCallback(
    (
      action: (decision: Decision) => void,
    ) => {

      close(false);
      action(decision);

    },
    [
      close,
      decision,
    ],
  );



  return (
    <View style={styles.container}>


      <View style={styles.actions}>

        {onArchive ? (

          <AnimatedPressable
            accessibilityRole="button"
            containerStyle={styles.actionContainer}
            onPress={() => runAction(onArchive)}
            style={[
              styles.action,
              styles.archiveAction,
              Platform.OS === 'web' &&
                styles.webButton,
            ]}
          >

            <AppIcon
              color={colors.white}
              name="archive"
              size="lg"
              weight="medium"
            />

            <Text style={styles.actionLabel}>
              Archiver
            </Text>

          </AnimatedPressable>

        ) : null}



        <AnimatedPressable
          accessibilityRole="button"
          containerStyle={styles.actionContainer}
          onPress={() => runAction(onDelete)}
          style={[
            styles.action,
            styles.deleteAction,
            Platform.OS === 'web' &&
              styles.webButton,
          ]}
        >

          <AppIcon
            color={colors.white}
            name="delete"
            size="lg"
            weight="medium"
          />

          <Text style={styles.actionLabel}>
            Supprimer
          </Text>

        </AnimatedPressable>

      </View>




      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.animatedCard,
          {
            transform: [
              {
                translateX,
              },
            ],
          },
        ]}
      >


        <AnimatedPressable
          onPress={() => {

            if (isOpen.current) {
              close();
              return;
            }


            if (!didSwipe.current) {
              onOpen(decision);
            }


            didSwipe.current = false;

          }}

          pressedStyle={styles.cardPressed}
          focusStyle={styles.cardFocused}
          scaleTo={motion.subtlePressScale}

          style={[
            styles.card,
            Platform.OS === 'web' &&
              styles.webButton,
          ]}
        >


          <View style={styles.cardHeader}>


            <View style={styles.titleContainer}>

              <Text
                numberOfLines={2}
                style={styles.title}
              >
                {decision.title}
              </Text>


              {subtitle ? (

                <Text
                  numberOfLines={2}
                  style={styles.subtitle}
                >
                  {subtitle}
                </Text>

              ) : null}

            </View>



            <AppIcon
              color={colors.primary}
              name="chevron-right"
              size="lg"
              weight="regular"
            />

          </View>




          <View style={styles.metadata}>


            <View style={styles.statusAndDate}>


              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      status.backgroundColor,
                  },
                ]}
              >

                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: status.color,
                    },
                  ]}
                >
                  {status.label}
                </Text>

              </View>



              <Text style={styles.date}>
                {getDecisionDateLabel(decision)}
              </Text>


            </View>



            {decision.status === 'reflecting' ? (

              <View style={styles.counts}>

                <Text
                  style={[
                    styles.count,
                    styles.proCount,
                  ]}
                >
                  {decision.pros.length} Pour
                </Text>


                <Text
                  style={[
                    styles.count,
                    styles.conCount,
                  ]}
                >
                  {decision.cons.length} Contre
                </Text>


              </View>

            ) : null}


          </View>


        </AnimatedPressable>


      </Animated.View>


    </View>
  );
});



export const SwipeableDecisionRow =
  memo(SwipeableDecisionRowComponent);




const styles = StyleSheet.create({

  container: {
    overflow: 'hidden',
    borderRadius: radii.card,
    backgroundColor: colors.white,
  },


  animatedCard: {},


  actions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },


  action: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },


  actionContainer: {
    width: ACTION_WIDTH,
    height: '100%',
  },


  archiveAction: {
    backgroundColor: colors.primary,
  },


  deleteAction: {
    backgroundColor: colors.dangerStrong,
  },


  actionLabel: {
    marginTop: 5,
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },


  card: {
    minHeight: 132,
    padding: spacing.ml,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    ...shadows.card,
  },


  titleContainer: {
    flex: 1,
  },


  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },


  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
  },


  subtitle: {
    marginTop: 6,
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },


  metadata: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },


  statusAndDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },


  date: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },


  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },


  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },


  counts: {
    flexDirection: 'row',
    gap: 8,
  },


  count: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    fontSize: 12,
    fontWeight: '700',
  },


  proCount: {
    color: colors.success,
    backgroundColor: colors.successSoft,
  },


  conCount: {
    color: colors.dangerMuted,
    backgroundColor: colors.dangerSoft,
  },


  cardPressed: {
    borderColor: colors.primary,
  },


  cardFocused: {
    borderColor: colors.focus,
  },


  webButton: {
    cursor: 'pointer',
  },

});
