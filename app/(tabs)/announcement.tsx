import Board from "@/components/Board";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function announcement() {
  return (
    <View style={styles.container}>
      <Board type="announcement" />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9fafb",
    },
  });
  