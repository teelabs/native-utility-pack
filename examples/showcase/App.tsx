import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { ReelPicker } from "@teelabs/native-utility-pack";
import { CapabilityCard } from "./src/CapabilityCard";
import { palette } from "./src/theme";

export default function App() {
  const [repetitions, setRepetitions] = useState(8);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lastEvent, setLastEvent] = useState(
    "Tap or swipe the reel to explore it.",
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>@teelabs / native utility pack</Text>
          <Text accessibilityRole="header" style={styles.heading}>
            A slot-reel control that feels at home on native.
          </Text>
          <Text style={styles.lede}>
            An Expo React Native Web preview of ReelPicker: accessible, bounded,
            animated, and ready to compose into fitness and utility flows.
          </Text>
        </View>

        <View style={styles.demoPanel}>
          <View style={styles.demoHeader}>
            <View>
              <Text style={styles.panelKicker}>Interactive capability</Text>
              <Text style={styles.panelTitle}>Repetitions</Text>
            </View>
            <Text accessibilityLiveRegion="polite" style={styles.valueBadge}>
              {repetitions} reps
            </Text>
          </View>

          <ReelPicker
            accessibilityHint="Swipe vertically or use the controls to change repetitions."
            accessibilityLabel="Repetitions"
            animation={{ duration: 360, stepDistance: 64 }}
            formatAdjacentValue={(value) => `${value}`}
            formatValue={(value) => `${value}`}
            label="Swipe, tap, or use a screen reader adjustment"
            max={20}
            min={1}
            onBoundaryReached={(boundary) =>
              setLastEvent(`Boundary reached: ${boundary}`)
            }
            onChange={(value) => {
              setRepetitions(value);
              setLastEvent(`Changed to ${value} repetitions`);
            }}
            onSwipeEnd={(event) =>
              setLastEvent(`Swipe ${event.direction}: ${event.steps} step(s)`)
            }
            reducedMotion={reducedMotion}
            style={{
              adjacentValue: styles.adjacentValue,
              centerSlot: styles.centerSlot,
              currentValue: styles.currentValue,
              label: styles.reelLabel,
              window: styles.reelWindow,
            }}
            value={repetitions}
          />

          <View style={styles.motionRow}>
            <View style={styles.motionCopy}>
              <Text style={styles.motionTitle}>Reduced motion</Text>
              <Text style={styles.motionDescription}>
                Settle immediately for motion-sensitive users.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Reduced motion"
              onValueChange={setReducedMotion}
              thumbColor={reducedMotion ? palette.accent : "#f5eee8"}
              trackColor={{ false: "#d8cbc0", true: "#e6b7a5" }}
              value={reducedMotion}
            />
          </View>

          <Text accessibilityLiveRegion="polite" style={styles.eventText}>
            {lastEvent}
          </Text>
        </View>

        <View style={styles.cards}>
          <CapabilityCard
            description="Use value for controlled state or defaultValue for an internal value. Numeric min, max, and step keep movement bounded."
            title="Controlled or uncontrolled"
          />
          <CapabilityCard
            description="onChange, onBoundaryReached, and swipe lifecycle callbacks expose the moments your product needs."
            title="Observable interactions"
          />
          <CapabilityCard
            description="Animation duration, spring tuning, velocity projection, formatting functions, and style slots are all configurable."
            title="Motion and customization"
          />
          <CapabilityCard
            description="Adjustable semantics, accessible labels, hints, live status, and a reduced-motion path are part of the contract."
            title="Accessible by default"
          />
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() =>
            setLastEvent("Read the API contract in the repository README.")
          }
          style={styles.footerLink}
        >
          <Text style={styles.footerLinkText}>
            Explore the source and API contract →
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  adjacentValue: { color: palette.muted, fontSize: 24, lineHeight: 30 },
  cards: { gap: 12 },
  centerSlot: {
    backgroundColor: "rgba(198, 106, 74, 0.13)",
    borderColor: "#e1a38e",
    borderWidth: 1,
  },
  content: { gap: 24, maxWidth: 900, padding: 24, width: "100%" },
  currentValue: {
    color: palette.ink,
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 42,
  },
  demoHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  demoPanel: {
    backgroundColor: palette.white,
    borderRadius: 26,
    gap: 20,
    padding: 24,
    shadowColor: "#332b27",
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  eventText: {
    color: palette.muted,
    fontSize: 14,
    minHeight: 20,
    textAlign: "center",
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  footerLink: { alignItems: "center", padding: 12 },
  footerLinkText: { color: palette.accent, fontSize: 15, fontWeight: "700" },
  heading: {
    color: palette.ink,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1.5,
    lineHeight: 50,
    maxWidth: 680,
  },
  hero: { gap: 14, paddingBottom: 4, paddingTop: 32 },
  lede: { color: palette.muted, fontSize: 18, lineHeight: 28, maxWidth: 680 },
  motionCopy: { flex: 1, gap: 4 },
  motionDescription: { color: palette.muted, fontSize: 13, lineHeight: 18 },
  motionRow: {
    alignItems: "center",
    borderColor: "#eadfd5",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 16,
    paddingTop: 18,
  },
  motionTitle: { color: palette.ink, fontSize: 15, fontWeight: "700" },
  panelKicker: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  panelTitle: { color: palette.ink, fontSize: 28, fontWeight: "800" },
  reelLabel: { color: palette.muted, fontSize: 13 },
  reelWindow: { width: 128 },
  safeArea: { backgroundColor: palette.background, flex: 1 },
  valueBadge: {
    backgroundColor: "#f6e3d9",
    borderRadius: 99,
    color: palette.accent,
    fontSize: 16,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
