import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

interface UserCircleProps {
  user?: { name?: string };
  color: string; // background color in hex or tailwind-like
  size?: "sm" | "md";
}

const UserCircle = ({ user, color, size = "md" }: UserCircleProps) => {
  const circleSize = size === "sm" ? 28 : 36;
  const fontSize = size === "sm" ? 12 : 14;

  const [expanded, setExpanded] = useState(false);

  // Animated width for expanding circle
  const animatedWidth = React.useRef(new Animated.Value(circleSize)).current;

  const handlePressIn = () => {
    setExpanded(true);
    Animated.timing(animatedWidth, {
      toValue: 140, // expand width to fit name
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    setExpanded(false);
    Animated.timing(animatedWidth, {
      toValue: circleSize,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const displayText = expanded ? user?.name || "?" : user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginHorizontal: 4 }}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: animatedWidth,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: color,
            justifyContent: "center",
            paddingHorizontal: expanded ? 10 : 0, // padding when expanded
          },
        ]}
      >
        <Text
          style={[
            { color: "#fff", fontWeight: "600", fontSize },
            expanded && { textAlign: "center" },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
  },
});

export default UserCircle;
