import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface UserCircleProps {
  user?: { name?: string };
  color: string; // background color in hex or tailwind-like
  size?: "sm" | "md";
}

const UserCircle = ({ user, color, size = "md" }: UserCircleProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const circleSize = size === "sm" ? 28 : 36;
  const fontSize = size === "sm" ? 12 : 14;

  return (
    <Pressable
      onPressIn={() => setShowTooltip(true)}
      onPressOut={() => setShowTooltip(false)}
      style={{ marginHorizontal: 4, alignItems: "center" }}
    >
      {/* Circle */}
      <View
        style={[
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: color,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize }}>
          {user?.name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>

      {/* Tooltip */}
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{user?.name}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    bottom: 36, // above the circle
    backgroundColor: "black",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
  },
});

export default UserCircle;
