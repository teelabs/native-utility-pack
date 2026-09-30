import React from "react";

type NodeProps = { children?: React.ReactNode; [key: string]: unknown };

function host(name: string) {
  return React.forwardRef<unknown, NodeProps>(function Host(
    { children, ...props },
    _ref,
  ) {
    return React.createElement(
      name,
      props as Record<string, unknown>,
      children as React.ReactNode,
    );
  });
}

export const View = host("view");
export const Text = host("text");
export const Pressable = host("pressable");

class Value {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  setValue(value: number) {
    this.value = value;
  }

  stopAnimation() {}
}

export const springConfigs: Array<Record<string, unknown>> = [];

let deferAnimationCallbacks = false;
const pendingAnimationCallbacks: Array<
  (result: { finished: boolean }) => void
> = [];

export function setAnimationCallbacksDeferred(deferred: boolean) {
  deferAnimationCallbacks = deferred;
  if (!deferred) pendingAnimationCallbacks.length = 0;
}

export function flushNextAnimationCallback() {
  pendingAnimationCallbacks.shift()?.({ finished: true });
}

function finishAnimation(callback?: (result: { finished: boolean }) => void) {
  if (!callback) return;
  if (deferAnimationCallbacks) pendingAnimationCallbacks.push(callback);
  else callback({ finished: true });
}

export const Animated = {
  Value,
  View: host("animated-view"),
  spring: (value: unknown, config: Record<string, unknown>) => {
    springConfigs.push(config);
    const families = [
      ["bounciness", "speed"],
      ["tension", "friction"],
      ["stiffness", "damping", "mass"],
    ].filter((family) => family.some((key) => key in config));
    if (families.length > 1) {
      throw new Error(
        "Animated.spring received incompatible configuration families",
      );
    }
    return {
      start: finishAnimation,
    };
  },
  timing: () => ({
    start: finishAnimation,
  }),
};

export let lastPanResponderHandlers: Record<
  string,
  (...args: unknown[]) => void
> = {};

export const PanResponder = {
  create: (handlers: Record<string, (...args: unknown[]) => void>) => {
    lastPanResponderHandlers = handlers;
    return { panHandlers: handlers };
  },
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T) => styles,
};
