import Board from "@/components/Board";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function created() {
    return (
        <View style={styles.container}>
            <Board type="created" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
});