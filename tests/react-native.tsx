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

export const Animated = {
  Value,
  View: host("animated-view"),
  spring: () => ({
    start: (callback?: (result: { finished: boolean }) => void) =>
      callback?.({ finished: true }),
  }),
  timing: () => ({
    start: (callback?: (result: { finished: boolean }) => void) =>
      callback?.({ finished: true }),
  }),
};

export const PanResponder = {
  create: () => ({ panHandlers: {} }),
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T) => styles,
};
