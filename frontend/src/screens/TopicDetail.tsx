import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";

type TopicDetailRouteProp = RouteProp<RootStackParamList, "TopicDetail">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function TopicDetail() {
  const route = useRoute<TopicDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { topic } = route.params;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#414288" />
      </TouchableOpacity>

      <Text style={styles.title}>{topic}</Text>
      <Text style={styles.subtitle}>Showing all relevant content for {topic}...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    margin: 20,
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
  },
});
