import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import type { ReelPickerProps } from "./types";

const DEFAULT_ROW_HEIGHT = 64;
const DEFAULT_WIDTH = 96;

function isNumber(value: number | string): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultFormat(value: number | string) {
  return String(value);
}

export function ReelPicker<T extends number | string = number>({
  accessibilityHint,
  accessibilityLabel,
  animation,
  defaultValue,
  disabled = false,
  formatAdjacentValue = defaultFormat,
  formatValue = defaultFormat,
  label,
  max,
  min,
  onBoundaryReached,
  onChange,
  onSwipeEnd,
  onSwipeMove,
  onSwipeStart,
  reducedMotion = false,
  step = 1,
  style,
  value,
  visibleRows = 3,
}: ReelPickerProps<T>) {
  const rowHeight = animation?.stepDistance ?? DEFAULT_ROW_HEIGHT;
  const radius = Math.floor(visibleRows / 2);
  const initialValue = value ?? defaultValue ?? min;
  const [displayValue, setDisplayValue] = useState<T>(initialValue);
  const currentValue = displayValue;
  const numeric = isNumber(currentValue) && isNumber(min) && isNumber(max);
  const currentNumber = numeric ? currentValue : 0;
  const minNumber = isNumber(min) ? min : 0;
  const maxNumber = isNumber(max) ? max : 0;
  const numericStep = Math.max(0.000001, step);
  // Keep extra rows mounted outside the masked window. A fast native gesture
  // can commit several steps before React paints the next render; the buffer
  // keeps the strip populated while that controlled update catches up.
  const renderRadius = radius + 4;
  const baseOffset = -(renderRadius - 1) * rowHeight;
  const reelOffset = useRef(new Animated.Value(baseOffset)).current;
  const currentValueRef = useRef(currentValue);
  const gestureStartValueRef = useRef(currentValue);
  const gestureActiveRef = useRef(false);
  const boundaryEmittedRef = useRef(false);
  const pendingControlledValueRef = useRef<T | null>(null);
  const pendingReleaseValueRef = useRef<T | null>(null);
  const releaseGenerationRef = useRef(0);
  const latestPropsRef = useRef({
    animation,
    max,
    min,
    onBoundaryReached,
    onChange,
    onSwipeEnd,
    onSwipeMove,
    onSwipeStart,
    reducedMotion,
    step,
    value,
  });
  latestPropsRef.current = {
    animation,
    max,
    min,
    onBoundaryReached,
    onChange,
    onSwipeEnd,
    onSwipeMove,
    onSwipeStart,
    reducedMotion,
    step,
    value,
  };

  useEffect(() => {
    if (value === undefined) return;
    if (gestureActiveRef.current) {
      pendingControlledValueRef.current = value;
      return;
    }
    pendingControlledValueRef.current = null;
    currentValueRef.current = value;
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    reelOffset.setValue(baseOffset);
  }, [baseOffset, reelOffset]);

  const setValue = (next: T) => {
    currentValueRef.current = next;
    setDisplayValue(next);
    latestPropsRef.current.onChange?.(next);
  };

  const previewValue = (next: T) => {
    currentValueRef.current = next;
    setDisplayValue(next);
  };

  const finishWithControlledValue = (fallback: T) => {
    const controlledValue =
      pendingControlledValueRef.current ?? latestPropsRef.current.value;
    pendingControlledValueRef.current = null;
    previewValue(controlledValue ?? fallback);
  };

  const emitBoundary = (boundary: "max" | "min") => {
    if (boundaryEmittedRef.current) return;
    boundaryEmittedRef.current = true;
    latestPropsRef.current.onBoundaryReached?.(boundary);
  };

  const valueAfterSteps = (
    startValue: T,
    direction: "up" | "down",
    requestedSteps: number,
  ) => {
    const latestMin = latestPropsRef.current.min;
    const latestMax = latestPropsRef.current.max;
    const latestStep = latestPropsRef.current.step ?? 1;
    if (
      !isNumber(startValue) ||
      !isNumber(latestMin) ||
      !isNumber(latestMax) ||
      requestedSteps <= 0
    ) {
      return { boundedSteps: 0, nextValue: startValue, clamped: false };
    }
    const latestNumericStep = Math.max(0.000001, latestStep);
    const available =
      direction === "up"
        ? Math.floor((latestMax - startValue) / latestNumericStep)
        : Math.floor((startValue - latestMin) / latestNumericStep);
    const boundedSteps = Math.min(requestedSteps, Math.max(0, available));
    const nextNumber = clamp(
      startValue +
        (direction === "up" ? 1 : -1) * latestNumericStep * boundedSteps,
      latestMin,
      latestMax,
    );
    return {
      boundedSteps,
      clamped: boundedSteps < requestedSteps,
      nextValue: nextNumber as T,
    };
  };

  const resolveSteps = (
    startValue: T,
    direction: "up" | "down",
    requestedSteps: number,
  ) => {
    const result = valueAfterSteps(startValue, direction, requestedSteps);
    if (result.clamped || (requestedSteps > 0 && result.boundedSteps === 0)) {
      emitBoundary(direction === "up" ? "max" : "min");
    }
    return result;
  };

  const settle = (direction: "up" | "down", steps: number) => {
    const result = resolveSteps(currentValueRef.current, direction, steps);
    if (result.boundedSteps > 0) setValue(result.nextValue);
    const latestAnimation = latestPropsRef.current.animation;
    const duration = Math.min(
      latestAnimation?.maxDuration ?? 1100,
      latestAnimation?.duration ??
        260 + steps * (latestAnimation?.stepDuration ?? 70),
    );
    if (
      latestPropsRef.current.reducedMotion ||
      latestAnimation?.reducedMotion
    ) {
      reelOffset.setValue(baseOffset);
      return;
    }
    const transition = result.clamped
      ? Animated.spring(reelOffset, {
          damping: latestAnimation?.spring?.damping ?? 14,
          mass: latestAnimation?.spring?.mass ?? 1,
          stiffness: latestAnimation?.spring?.stiffness ?? 140,
          toValue: baseOffset,
          useNativeDriver: true,
        })
      : Animated.timing(reelOffset, {
          duration,
          toValue: baseOffset,
          useNativeDriver: true,
        });
    transition.start(({ finished }: { finished: boolean }) => {
      if (finished) reelOffset.setValue(baseOffset);
    });
  };

  const spin = (direction: "up" | "down", steps = 1) => {
    if (!disabled) {
      releaseGenerationRef.current += 1;
      reelOffset.stopAnimation();
      const interruptedValue =
        pendingControlledValueRef.current ??
        pendingReleaseValueRef.current ??
        latestPropsRef.current.value ??
        currentValueRef.current;
      pendingControlledValueRef.current = null;
      pendingReleaseValueRef.current = null;
      gestureActiveRef.current = false;
      reelOffset.setValue(baseOffset);
      previewValue(interruptedValue);
      boundaryEmittedRef.current = false;
      settle(direction, steps);
    }
  };

  const selectAdjacentValue = (locationY: number) => {
    const centerTop = radius * rowHeight;
    if (locationY < centerTop) spin("down");
    else if (locationY >= centerTop + rowHeight) spin("up");
  };

  const projectGesture = (gesture: PanResponderGestureState) => {
    const projected =
      gesture.dy +
      gesture.vy *
        (latestPropsRef.current.animation?.velocityProjection ?? 180);
    const direction =
      Math.abs(gesture.dy) > 0
        ? gesture.dy < 0
          ? "up"
          : "down"
        : projected < 0
          ? "up"
          : "down";
    const boundedProjection = Math.min(
      Math.abs(projected),
      Math.abs(gesture.dy) + rowHeight * 2,
    );
    return {
      direction,
      projected,
      steps: Math.max(1, Math.round(boundedProjection / rowHeight)),
    } as const;
  };

  const shouldClaimGesture = (gesture: PanResponderGestureState): boolean =>
    !disabled &&
    Math.abs(gesture.dy) >
      (latestPropsRef.current.animation?.activationDistance ?? 8) &&
    Math.abs(gesture.dy) > Math.abs(gesture.dx);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => shouldClaimGesture(gesture),
        onMoveShouldSetPanResponder: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => shouldClaimGesture(gesture),
        onPanResponderGrant: (event: GestureResponderEvent) => {
          releaseGenerationRef.current += 1;
          reelOffset.stopAnimation();
          const interruptedValue =
            pendingControlledValueRef.current ?? pendingReleaseValueRef.current;
          if (interruptedValue !== null) {
            previewValue(interruptedValue);
          }
          pendingControlledValueRef.current = null;
          pendingReleaseValueRef.current = null;
          reelOffset.setValue(baseOffset);
          gestureActiveRef.current = true;
          boundaryEmittedRef.current = false;
          gestureStartValueRef.current = currentValueRef.current;
          latestPropsRef.current.onSwipeStart?.({
            direction: "up",
            distance: 0,
            steps: 0,
            value: currentValueRef.current,
            velocity: 0,
          });
        },
        onPanResponderMove: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          const direction = gesture.dy < 0 ? "up" : "down";
          const requestedSteps = Math.floor(Math.abs(gesture.dy) / rowHeight);
          const result = resolveSteps(
            gestureStartValueRef.current,
            direction,
            requestedSteps,
          );
          if (result.boundedSteps > 0) previewValue(result.nextValue);
          else previewValue(gestureStartValueRef.current);
          const consumedDistance =
            (direction === "up" ? -1 : 1) * result.boundedSteps * rowHeight;
          const remainder = gesture.dy - consumedDistance;
          reelOffset.setValue(
            baseOffset + (result.clamped ? remainder * 0.25 : remainder),
          );
          const projection = projectGesture(gesture);
          latestPropsRef.current.onSwipeMove?.({
            direction: projection.direction,
            distance: Math.abs(gesture.dy),
            steps: projection.steps,
            value: currentValueRef.current,
            velocity: gesture.vy,
          });
        },
        onPanResponderRelease: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          const latestAnimation = latestPropsRef.current.animation;
          const activationDistance = latestAnimation?.activationDistance ?? 8;
          if (
            Math.abs(gesture.dy) <= activationDistance &&
            Math.abs(gesture.dx) <= activationDistance
          ) {
            gestureActiveRef.current = false;
            reelOffset.setValue(baseOffset);
            finishWithControlledValue(gestureStartValueRef.current);
            return;
          }
          const { direction, steps } = projectGesture(gesture);
          const result = resolveSteps(
            gestureStartValueRef.current,
            direction,
            steps,
          );
          const fingerResult = valueAfterSteps(
            gestureStartValueRef.current,
            direction,
            Math.floor(Math.abs(gesture.dy) / rowHeight),
          );
          const extraSteps = Math.max(
            0,
            result.boundedSteps - fingerResult.boundedSteps,
          );
          const animationTarget =
            baseOffset + (direction === "up" ? -1 : 1) * extraSteps * rowHeight;
          const releaseGeneration = ++releaseGenerationRef.current;
          pendingReleaseValueRef.current = result.nextValue;
          if (!Object.is(result.nextValue, gestureStartValueRef.current)) {
            latestPropsRef.current.onChange?.(result.nextValue);
          }
          const finishRelease = () => {
            if (releaseGeneration !== releaseGenerationRef.current) return;
            const pendingValue = pendingReleaseValueRef.current;
            pendingReleaseValueRef.current = null;
            gestureActiveRef.current = false;
            reelOffset.setValue(baseOffset);
            if (pendingValue === null) return;
            finishWithControlledValue(pendingValue);
          };
          if (
            latestPropsRef.current.reducedMotion ||
            latestAnimation?.reducedMotion
          ) {
            finishRelease();
          } else {
            const transition = result.clamped
              ? Animated.spring(reelOffset, {
                  damping: latestAnimation?.spring?.damping ?? 14,
                  mass: latestAnimation?.spring?.mass ?? 1,
                  stiffness: latestAnimation?.spring?.stiffness ?? 140,
                  toValue: baseOffset,
                  useNativeDriver: true,
                })
              : Animated.timing(reelOffset, {
                  duration: Math.min(
                    latestAnimation?.maxDuration ?? 1100,
                    latestAnimation?.duration ??
                      260 + steps * (latestAnimation?.stepDuration ?? 70),
                  ),
                  toValue: animationTarget,
                  useNativeDriver: true,
                });
            transition.start(() => finishRelease());
          }
          latestPropsRef.current.onSwipeEnd?.({
            direction,
            distance: Math.abs(gesture.dy),
            steps,
            value: result.nextValue,
            velocity: gesture.vy,
          });
        },
        onPanResponderTerminate: () => {
          releaseGenerationRef.current += 1;
          reelOffset.stopAnimation();
          pendingReleaseValueRef.current = null;
          gestureActiveRef.current = false;
          reelOffset.setValue(baseOffset);
          finishWithControlledValue(gestureStartValueRef.current);
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [baseOffset, disabled, reelOffset, rowHeight],
  );

  const reelValues = numeric
    ? Array.from({ length: renderRadius * 2 + 1 }, (_, index) => {
        const next = currentNumber + (index - renderRadius) * numericStep;
        return next < minNumber || next > maxNumber ? null : (next as T);
      })
    : Array.from({ length: renderRadius * 2 + 1 }, (_, index) =>
        index === renderRadius ? currentValue : null,
      );

  return (
    <View style={[styles.container, style?.container]}>
      {label ? <Text style={[styles.label, style?.label]}>{label}</Text> : null}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.window,
          { height: rowHeight * visibleRows, width: DEFAULT_WIDTH },
          style?.window,
        ]}
      >
        <Animated.View
          style={[
            styles.strip,
            style?.strip,
            { transform: [{ translateY: reelOffset }] },
          ]}
        >
          {reelValues.map((reelValue, index) => {
            const rowContent =
              reelValue === null ? null : (
                <Text
                  style={[
                    index === renderRadius
                      ? styles.currentValue
                      : styles.adjacentValue,
                    index === renderRadius
                      ? style?.currentValue
                      : style?.adjacentValue,
                  ]}
                >
                  {index === renderRadius
                    ? formatValue(reelValue)
                    : formatAdjacentValue(reelValue)}
                </Text>
              );
            const rowStyle = [styles.row, { height: rowHeight }, style?.row];
            return (
              <View key={index} style={rowStyle}>
                {rowContent}
              </View>
            );
          })}
        </Animated.View>
        <View
          pointerEvents="none"
          style={[
            styles.centerSlot,
            { height: rowHeight, top: radius * rowHeight },
            style?.centerSlot,
          ]}
        />
        <View
          pointerEvents="none"
          style={[styles.control, styles.topControl, style?.control]}
        />
        <View
          pointerEvents="none"
          style={[styles.control, styles.bottomControl, style?.control]}
        />
        <Pressable
          accessibilityActions={[
            { name: "decrement", label: accessibilityLabel },
            { name: "increment", label: accessibilityLabel },
          ]}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="adjustable"
          disabled={disabled}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "decrement") spin("down");
            else if (event.nativeEvent.actionName === "increment") spin("up");
          }}
          onPress={(event) => selectAdjacentValue(event.nativeEvent.locationY)}
          style={styles.tapSurface}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adjacentValue: { color: "#716762", fontSize: 24, lineHeight: 30 },
  bottomControl: { bottom: 0 },
  centerSlot: {
    backgroundColor: "rgba(198, 106, 74, 0.12)",
    borderRadius: 10,
    height: DEFAULT_ROW_HEIGHT,
    left: 8,
    position: "absolute",
    right: 8,
    top: DEFAULT_ROW_HEIGHT,
  },
  container: { alignItems: "center", gap: 8 },
  control: {
    height: DEFAULT_ROW_HEIGHT,
    left: 0,
    position: "absolute",
    right: 0,
  },
  currentValue: { color: "#332B27", fontSize: 32, lineHeight: 38 },
  label: { color: "#716762", fontSize: 14, lineHeight: 18 },
  row: { alignItems: "center", justifyContent: "center", width: "100%" },
  strip: { left: 0, position: "absolute", top: 0, width: "100%" },
  tapSurface: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  topControl: { top: 0 },
  window: { overflow: "hidden", position: "relative" },
});
