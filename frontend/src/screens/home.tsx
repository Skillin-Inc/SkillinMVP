// src/screens/Home.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../hooks";
import { TabNavigatorParamList } from "../types";

type Props = StackScreenProps<TabNavigatorParamList, "Home">;

export default function Home({ navigation }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleViewProfile = () => {
    navigation.navigate("Profile");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewProfile}>
          <Ionicons name="person-circle-outline" size={40} color="#6a1b9a" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Welcome to the Home Page!</Text>
    </View>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9f9f9",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      paddingBottom: height * 0.1, // prevents overlap with bottom tabs
    },
    header: {
      width: "100%",
      position: "absolute",
      top: height * 0.06,
      right: 20,
      alignItems: "flex-end",
      zIndex: 1,
    },
    title: {
      fontSize: width > 400 ? 28 : 24,
      fontWeight: "600",
      textAlign: "center",
    },
  });
}
