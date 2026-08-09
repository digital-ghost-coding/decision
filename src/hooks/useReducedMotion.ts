import { AccessibilityInfo } from 'react-native';
import {
  createContext,
  createElement,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

const ReducedMotionContext = createContext(false);

export function ReducedMotionProvider({ children }: PropsWithChildren) {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted) {
        setIsReducedMotionEnabled(isEnabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return createElement(
    ReducedMotionContext.Provider,
    { value: isReducedMotionEnabled },
    children,
  );
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}
