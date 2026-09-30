import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export interface ReelPickerAnimationConfig {
  readonly activationDistance?: number;
  readonly duration?: number;
  readonly maxDuration?: number;
  readonly reducedMotion?: boolean;
  readonly spring?: {
    readonly damping?: number;
    readonly mass?: number;
    readonly stiffness?: number;
    readonly overshoot?: number;
  };
  readonly stepDistance?: number;
  readonly stepDuration?: number;
  readonly velocityProjection?: number;
}

export interface ReelPickerSwipeEvent<T extends number | string = number> {
  readonly boundary?: "max" | "min";
  readonly direction: "down" | "up";
  readonly distance: number;
  readonly steps: number;
  readonly value: T;
  readonly velocity: number;
}

export interface ReelPickerStyle {
  readonly adjacentValue?: StyleProp<TextStyle>;
  readonly centerSlot?: StyleProp<ViewStyle>;
  readonly container?: StyleProp<ViewStyle>;
  readonly control?: StyleProp<ViewStyle>;
  readonly currentValue?: StyleProp<TextStyle>;
  readonly label?: StyleProp<TextStyle>;
  readonly row?: StyleProp<ViewStyle>;
  readonly separator?: StyleProp<TextStyle>;
  readonly strip?: StyleProp<ViewStyle>;
  readonly window?: StyleProp<ViewStyle>;
}

export interface ReelPickerTheme {
  readonly colors?: {
    readonly adjacentValue?: string;
    readonly centerSlotBackground?: string;
    readonly centerSlotBorder?: string;
    readonly currentValue?: string;
    readonly label?: string;
  };
  readonly dimensions?: {
    readonly borderRadius?: number;
    readonly labelSpacing?: number;
    readonly rowHeight?: number;
    readonly width?: number;
  };
  readonly typography?: {
    readonly adjacentValue?: TextStyle;
    readonly currentValue?: TextStyle;
    readonly label?: TextStyle;
  };
}

export interface ReelPickerProps<T extends number | string = number> {
  readonly accessibilityHint?: string;
  readonly accessibilityLabel: string;
  readonly animation?: ReelPickerAnimationConfig;
  readonly defaultValue?: T;
  readonly disabled?: boolean;
  readonly formatAdjacentValue?: (value: T) => string;
  readonly formatValue?: (value: T) => string;
  readonly label?: string;
  readonly max: T;
  readonly min: T;
  readonly onBoundaryReached?: (boundary: "max" | "min") => void;
  readonly onChange?: (value: T) => void;
  readonly onSwipeEnd?: (event: ReelPickerSwipeEvent<T>) => void;
  readonly onSwipeMove?: (event: ReelPickerSwipeEvent<T>) => void;
  readonly onSwipeStart?: (event: ReelPickerSwipeEvent<T>) => void;
  readonly reducedMotion?: boolean;
  readonly step?: number;
  readonly style?: ReelPickerStyle;
  readonly value?: T;
  readonly visibleRows?: 3 | 5 | 7;
}
