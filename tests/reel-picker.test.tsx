import React from "react";
import { act, create } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", async () => import("./react-native"));

import { ReelPicker } from "../components/reel-picker/src";
import {
  flushNextAnimationCallback,
  lastPanResponderHandlers,
  setAnimationCallbacksDeferred,
} from "./react-native";

afterEach(() => setAnimationCallbacksDeferred(false));

describe("ReelPicker public behavior", () => {
  it("starts from the default value and reports an adjacent tap", () => {
    const onChange = vi.fn();

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={2}
          max={3}
          min={1}
          onChange={onChange}
        />,
      );
    });

    expect(
      renderer!.root
        .findAllByType("text")
        .some((node) => node.children.includes("2")),
    ).toBe(true);
    const interactionSurface = renderer!.root.find(
      (node) =>
        String(node.type) === "pressable" &&
        node.props.accessibilityLabel === "Weight",
    );
    expect(interactionSurface).toBeDefined();
    act(() => {
      interactionSurface.props.onPress?.({ nativeEvent: { locationY: 160 } });
    });

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("uses the controlled value and emits a bounded boundary callback", () => {
    const onBoundaryReached = vi.fn();

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Reps"
          max={3}
          min={1}
          onBoundaryReached={onBoundaryReached}
          value={3}
        />,
      );
    });

    expect(
      renderer!.root
        .findAllByType("text")
        .some((node) => node.children.includes("3")),
    ).toBe(true);
    const interactionSurface = renderer!.root.find(
      (node) =>
        String(node.type) === "pressable" &&
        node.props.accessibilityLabel === "Reps",
    );
    expect(interactionSurface).toBeDefined();
    act(() => {
      interactionSurface.props.onPress?.({ nativeEvent: { locationY: 160 } });
    });

    expect(onBoundaryReached).toHaveBeenCalledWith("max");
  });

  it("keeps intermediate swipe values local until release", () => {
    const onChange = vi.fn();

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={5}
          max={20}
          min={0}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -240, vy: -0.2 },
      );
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(
      renderer!.root
        .findAllByType("text")
        .some((node) => node.children.includes("8")),
    ).toBe(true);

    act(() => {
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -240, vy: -0.2 },
      );
    });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it("limits a fast fling to two steps beyond finger travel", () => {
    const onChange = vi.fn();

    act(() => {
      create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={57}
          max={100}
          min={0}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -192, vy: -12 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -192, vy: -12 },
      );
    });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(62);
  });

  it("retains the responder after an edge-start swipe is captured", () => {
    act(() => {
      create(
        <ReelPicker accessibilityLabel="Weight" max={100} min={0} value={57} />,
      );
    });

    expect(lastPanResponderHandlers.onPanResponderTerminationRequest?.()).toBe(
      false,
    );
  });

  it("uses one full-window tap surface while its parent captures swipes", () => {
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker accessibilityLabel="Weight" max={100} min={0} value={57} />,
      );
    });

    const surfaces = renderer!.root.findAll(
      (node) =>
        String(node.type) === "pressable" &&
        node.props.accessibilityLabel === "Weight",
    );

    expect(surfaces).toHaveLength(1);
    expect(surfaces[0]?.props.onPress).toBeTypeOf("function");
    expect(lastPanResponderHandlers.onStartShouldSetPanResponder?.()).toBe(
      false,
    );
    expect(
      lastPanResponderHandlers.onMoveShouldSetPanResponderCapture,
    ).toBeTypeOf("function");
    expect(lastPanResponderHandlers.onPanResponderGrant).toBeTypeOf("function");
    expect(lastPanResponderHandlers.onPanResponderMove).toBeTypeOf("function");
    expect(lastPanResponderHandlers.onPanResponderRelease).toBeTypeOf(
      "function",
    );
  });

  it("ignores a stale settle callback after a new gesture starts", () => {
    const onChange = vi.fn();
    setAnimationCallbacksDeferred(true);

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={10}
          max={100}
          min={0}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -64, vy: -12 },
      );
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -64, vy: -12 },
      );
    });

    const currentText = () =>
      renderer!.root.find(
        (node) =>
          String(node.type) === "text" &&
          Array.isArray(node.props.style) &&
          node.props.style.some(
            (entry: { fontSize?: number }) => entry?.fontSize === 32,
          ),
      ).children[0];

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 13);
    expect(onChange).toHaveBeenNthCalledWith(2, 16);
    expect(currentText()).toBe("14");

    act(() => flushNextAnimationCallback());
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(currentText()).toBe("14");

    act(() => flushNextAnimationCallback());
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(currentText()).toBe("16");
  });

  it("uses the latest change callback after a prop-only rerender", () => {
    const firstOnChange = vi.fn();
    const latestOnChange = vi.fn();

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={10}
          max={100}
          min={0}
          onChange={firstOnChange}
        />,
      );
    });
    act(() => {
      renderer!.update(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={10}
          max={100}
          min={0}
          onChange={latestOnChange}
        />,
      );
    });
    act(() => {
      renderer!.root
        .find(
          (node) =>
            String(node.type) === "pressable" &&
            node.props.accessibilityLabel === "Weight",
        )
        .props.onPress?.({ nativeEvent: { locationY: 160 } });
    });

    expect(firstOnChange).not.toHaveBeenCalled();
    expect(latestOnChange).toHaveBeenCalledOnce();
    expect(latestOnChange).toHaveBeenCalledWith(11);
  });

  it("preserves control styling without adding competing touch surfaces", () => {
    const controlStyle = { opacity: 0.5 };

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          max={100}
          min={0}
          style={{ control: controlStyle }}
          value={10}
        />,
      );
    });

    const styledControls = renderer!.root.findAll(
      (node) =>
        String(node.type) === "view" &&
        Array.isArray(node.props.style) &&
        node.props.style.includes(controlStyle),
    );

    expect(styledControls).toHaveLength(2);
    expect(
      styledControls.every((node) => node.props.pointerEvents === "none"),
    ).toBe(true);
  });

  it("reports the same capped step count while moving and on release", () => {
    const onSwipeMove = vi.fn();
    const onSwipeEnd = vi.fn();

    act(() => {
      create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={57}
          max={100}
          min={0}
          onSwipeEnd={onSwipeEnd}
          onSwipeMove={onSwipeMove}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -192, vy: -12 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -192, vy: -12 },
      );
    });

    expect(onSwipeMove).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: "up", steps: 5 }),
    );
    expect(onSwipeEnd).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: "up", steps: 5 }),
    );
  });

  it("announces a reached boundary once per gesture", () => {
    const onBoundaryReached = vi.fn();

    act(() => {
      create(
        <ReelPicker
          accessibilityLabel="Weight"
          max={10}
          min={0}
          onBoundaryReached={onBoundaryReached}
          value={10}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -80, vy: -1 },
      );
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -120, vy: -1 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -120, vy: -1 },
      );
    });

    expect(onBoundaryReached).toHaveBeenCalledOnce();
    expect(onBoundaryReached).toHaveBeenCalledWith("max");
  });

  it("restores the gesture start value when the responder is terminated", () => {
    const onChange = vi.fn();

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          max={100}
          min={0}
          onChange={onChange}
          value={5}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      lastPanResponderHandlers.onPanResponderTerminate?.();
    });

    const currentText = renderer!.root.find(
      (node) =>
        String(node.type) === "text" &&
        Array.isArray(node.props.style) &&
        node.props.style.some(
          (entry: { fontSize?: number }) => entry?.fontSize === 32,
        ),
    ).children[0];
    expect(currentText).toBe("5");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("replays a controlled update received during an active gesture", () => {
    const onChange = vi.fn();
    setAnimationCallbacksDeferred(true);

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          max={100}
          min={0}
          onChange={onChange}
          value={5}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
    });
    act(() => {
      renderer!.update(
        <ReelPicker
          accessibilityLabel="Weight"
          max={100}
          min={0}
          onChange={onChange}
          value={20}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      flushNextAnimationCallback();
    });

    const currentText = renderer!.root.find(
      (node) =>
        String(node.type) === "text" &&
        Array.isArray(node.props.style) &&
        node.props.style.some(
          (entry: { fontSize?: number }) => entry?.fontSize === 32,
        ),
    ).children[0];
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(6);
    expect(currentText).toBe("20");
  });

  it("returns to the controlled value when the parent rejects a change", () => {
    const onChange = vi.fn();
    setAnimationCallbacksDeferred(true);

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          max={100}
          min={0}
          onChange={onChange}
          value={5}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      flushNextAnimationCallback();
    });

    const currentText = renderer!.root.find(
      (node) =>
        String(node.type) === "text" &&
        Array.isArray(node.props.style) &&
        node.props.style.some(
          (entry: { fontSize?: number }) => entry?.fontSize === 32,
        ),
    ).children[0];
    expect(onChange).toHaveBeenCalledWith(6);
    expect(currentText).toBe("5");
  });

  it("keeps a tap made while an older fling is settling", () => {
    const onChange = vi.fn();
    setAnimationCallbacksDeferred(true);

    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <ReelPicker
          accessibilityLabel="Weight"
          defaultValue={10}
          max={100}
          min={0}
          onChange={onChange}
        />,
      );
    });
    act(() => {
      lastPanResponderHandlers.onPanResponderGrant?.();
      lastPanResponderHandlers.onPanResponderMove?.(
        {},
        { dx: 0, dy: -64, vy: 0 },
      );
      lastPanResponderHandlers.onPanResponderRelease?.(
        {},
        { dx: 0, dy: -64, vy: -12 },
      );
    });
    act(() => {
      renderer!.root
        .find(
          (node) =>
            String(node.type) === "pressable" &&
            node.props.accessibilityLabel === "Weight",
        )
        .props.onPress?.({ nativeEvent: { locationY: 160 } });
    });
    act(() => flushNextAnimationCallback());

    const currentText = renderer!.root.find(
      (node) =>
        String(node.type) === "text" &&
        Array.isArray(node.props.style) &&
        node.props.style.some(
          (entry: { fontSize?: number }) => entry?.fontSize === 32,
        ),
    ).children[0];
    expect(onChange).toHaveBeenNthCalledWith(1, 13);
    expect(onChange).toHaveBeenNthCalledWith(2, 14);
    expect(currentText).toBe("14");
  });
});
