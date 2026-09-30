import { StyleSheet, Text, View } from "react-native";

type CapabilityCardProps = {
  description: string;
  title: string;
};

export function CapabilityCard({ description, title }: CapabilityCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffaf5",
    borderColor: "#eadfd5",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  description: {
    color: "#716762",
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: "#332b27",
    fontSize: 17,
    fontWeight: "700",
  },
});
