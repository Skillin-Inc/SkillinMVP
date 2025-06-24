import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../styles";

interface LoadingStateProps {
  text?: string;
  color?: string;
  size?: "small" | "large";
}

const LoadingState: React.FC<LoadingStateProps> = ({ text = "Loading...", color = COLORS.purple, size = "large" }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
      <Text style={[styles.loadingText, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoadingState;
