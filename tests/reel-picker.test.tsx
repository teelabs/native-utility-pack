import React from "react";
import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", async () => import("./react-native"));

import { ReelPicker } from "../components/reel-picker/src";

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
    const bottomControl = renderer!.root.findAll(
      (node) => String(node.type) === "pressable",
    )[1];
    expect(bottomControl).toBeDefined();
    act(() => bottomControl?.props.onPress());

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
    const bottomControl = renderer!.root.findAll(
      (node) => String(node.type) === "pressable",
    )[1];
    expect(bottomControl).toBeDefined();
    act(() => bottomControl?.props.onPress());

    expect(onBoundaryReached).toHaveBeenCalledWith("max");
  });
});
