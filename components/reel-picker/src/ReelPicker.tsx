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
  const [internalValue, setInternalValue] = useState<T>(initialValue);
  const currentValue = value ?? internalValue;
  const numeric = isNumber(currentValue) && isNumber(min) && isNumber(max);
  const currentNumber = numeric ? currentValue : 0;
  const minNumber = isNumber(min) ? min : 0;
  const maxNumber = isNumber(max) ? max : 0;
  const numericStep = Math.max(0.000001, step);
  const baseOffset = -(radius - 1) * rowHeight;
  const reelOffset = useRef(new Animated.Value(baseOffset)).current;

  useEffect(() => {
    reelOffset.setValue(baseOffset);
  }, [baseOffset, currentValue, reelOffset]);

  const setValue = (next: T) => {
    setInternalValue(next);
    onChange?.(next);
  };

  const emitBoundary = (boundary: "max" | "min") => {
    onBoundaryReached?.(boundary);
  };

  const moveBy = (direction: "up" | "down", requestedSteps: number) => {
    if (!numeric || requestedSteps <= 0) return 0;
    const available =
      direction === "up"
        ? Math.floor((maxNumber - currentNumber) / numericStep)
        : Math.floor((currentNumber - minNumber) / numericStep);
    const steps = Math.min(requestedSteps, Math.max(0, available));
    if (steps === 0) {
      emitBoundary(direction === "up" ? "max" : "min");
      return 0;
    }
    const nextNumber = clamp(
      currentNumber + (direction === "up" ? 1 : -1) * numericStep * steps,
      minNumber,
      maxNumber,
    );
    // Runtime numeric narrowing cannot narrow the generic T parameter for TypeScript.
    setValue(nextNumber as T);
    if (nextNumber === minNumber) emitBoundary("min");
    if (nextNumber === maxNumber) emitBoundary("max");
    return steps;
  };

  const settle = (direction: "up" | "down", steps: number) => {
    const availableSteps = numeric
      ? direction === "up"
        ? Math.floor((maxNumber - currentNumber) / numericStep)
        : Math.floor((currentNumber - minNumber) / numericStep)
      : 0;
    const boundedSteps = Math.min(steps, Math.max(0, availableSteps));
    const clamped = boundedSteps < steps;
    const targetOffset =
      baseOffset + (direction === "up" ? -1 : 1) * rowHeight * boundedSteps;
    const duration = Math.min(
      animation?.maxDuration ?? 1100,
      animation?.duration ?? 260 + steps * (animation?.stepDuration ?? 70),
    );
    const finish = () => {
      moveBy(direction, boundedSteps);
      reelOffset.setValue(baseOffset);
    };
    if (boundedSteps === 0) {
      emitBoundary(direction === "up" ? "max" : "min");
    }
    if (reducedMotion || animation?.reducedMotion) {
      finish();
      return;
    }
    const transition = clamped
      ? Animated.spring(reelOffset, {
          bounciness: animation?.spring?.overshoot ?? 12,
          damping: animation?.spring?.damping ?? 14,
          mass: animation?.spring?.mass ?? 1,
          stiffness: animation?.spring?.stiffness ?? 140,
          toValue: baseOffset,
          useNativeDriver: true,
        })
      : Animated.timing(reelOffset, {
          duration,
          toValue: targetOffset,
          useNativeDriver: true,
        });
    transition.start(({ finished }: { finished: boolean }) => {
      if (finished) finish();
    });
  };

  const spin = (direction: "up" | "down", steps = 1) => {
    if (!disabled) settle(direction, steps);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) =>
          !disabled &&
          Math.abs(gesture.dy) > (animation?.activationDistance ?? 8) &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          reelOffset.stopAnimation();
          reelOffset.setValue(baseOffset);
          onSwipeStart?.({
            direction: "up",
            distance: 0,
            steps: 0,
            value: currentValue,
            velocity: 0,
          });
        },
        onPanResponderMove: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          const projected =
            gesture.dy + gesture.vy * (animation?.velocityProjection ?? 180);
          reelOffset.setValue(baseOffset + gesture.dy);
          onSwipeMove?.({
            direction: projected < 0 ? "up" : "down",
            distance: Math.abs(gesture.dy),
            steps: Math.max(0, Math.round(Math.abs(projected) / rowHeight)),
            value: currentValue,
            velocity: gesture.vy,
          });
        },
        onPanResponderRelease: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          const projected =
            gesture.dy + gesture.vy * (animation?.velocityProjection ?? 180);
          const direction = projected < 0 ? "up" : "down";
          const steps = Math.max(
            1,
            Math.round(Math.abs(projected) / rowHeight),
          );
          settle(direction, steps);
          onSwipeEnd?.({
            direction,
            distance: Math.abs(gesture.dy),
            steps,
            value: currentValue,
            velocity: gesture.vy,
          });
        },
      }),
    [
      animation,
      baseOffset,
      currentValue,
      disabled,
      onSwipeEnd,
      onSwipeMove,
      onSwipeStart,
      reelOffset,
      rowHeight,
    ],
  );

  const reelValues = numeric
    ? Array.from({ length: radius * 2 + 1 }, (_, index) => {
        const next = currentNumber + (index - radius) * numericStep;
        return next < minNumber || next > maxNumber ? null : (next as T);
      })
    : Array.from({ length: radius * 2 + 1 }, (_, index) =>
        index === radius ? currentValue : null,
      );

  return (
    <View
      {...panResponder.panHandlers}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      style={[styles.container, style?.container]}
    >
      {label ? <Text style={[styles.label, style?.label]}>{label}</Text> : null}
      <View
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
          {reelValues.map((reelValue, index) => (
            <View
              key={`${index}-${String(reelValue)}`}
              style={[styles.row, { height: rowHeight }, style?.row]}
            >
              {reelValue === null ? null : (
                <Text
                  style={[
                    index === radius
                      ? styles.currentValue
                      : styles.adjacentValue,
                    index === radius
                      ? style?.currentValue
                      : style?.adjacentValue,
                  ]}
                >
                  {index === radius
                    ? formatValue(reelValue)
                    : formatAdjacentValue(reelValue)}
                </Text>
              )}
            </View>
          ))}
        </Animated.View>
        <View
          pointerEvents="none"
          style={[
            styles.centerSlot,
            { height: rowHeight, top: rowHeight },
            style?.centerSlot,
          ]}
        />
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => spin("down")}
          style={[styles.control, styles.topControl, style?.control]}
        />
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => spin("up")}
          style={[styles.control, styles.bottomControl, style?.control]}
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
  topControl: { top: 0 },
  window: { overflow: "hidden", position: "relative" },
});
