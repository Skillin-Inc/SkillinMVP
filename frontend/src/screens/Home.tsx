import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useScreenDimensions } from "../hooks";
import { RootStackParamList } from "../types";
import CategoryCard from "../components/CategoryCard";
import temp from "../../assets/playingCards.png";

type NavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

const topics = [
  { label: "Poker", image: temp },
  { label: "Snowboarding", image: temp },
  { label: "Finance", image: temp },
  { label: "Other", image: temp },
];

const altCategories = [
  { label: "Tutors", image: temp },
  { label: "Lessons", image: temp },
  { label: "Stand-alone Videos", image: temp },
  { label: "Current", image: temp },
];

export default function Home() {
  const navigation = useNavigation<NavigationProp>();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handleViewProfile = () => {
    navigation.navigate("Profile", { from: "Home" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewProfile}>
          <Ionicons name="person-circle-outline" size={40} color="#414288" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Welcome to Skillin!</Text>

      {/* Topics Section */}
      <Text style={styles.sectionTitle}>Topics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
        {topics.map((cat) => (
          <CategoryCard
            key={cat.label}
            label={cat.label}
            image={cat.image}
            onPress={() => navigation.navigate("TopicDetail", { topic: cat.label })}
          />
        ))}
      </ScrollView>

      {/* Video Lessons Section */}
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Video, Lessons, and Tutors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
        {altCategories.map((cat) => (
          <CategoryCard
            key={cat.label}
            label={cat.label}
            image={cat.image}
            onPress={() => navigation.navigate("AltCategoryDetail", { topic: cat.label })}
          />
        ))}
      </ScrollView>

      {/*// idk what this is broke stuff inside of home so i changed it.
// Topics Section
// <Text style={styles.sectionTitle}>Topics</Text>
// {loading ? (
// <View style={styles.loadingContainer}>
// <ActivityIndicator color="#414288" size="small" />
// <Text style={styles.loadingText}>Loading topics...</Text>
// </View>
// ) : categories.length === 0 ? (
// <View style={styles.emptyContainer}>
// <Text style={styles.emptyText}>No topics available</Text>
// </View>
// ) : (
// <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
// {categories.map((category) => (
// <CategoryCard
// key={category.id}
// label={category.title}
// image={temp}
// onPress={() => navigation.navigate("TopicDetail", { topic: category.title })}
// />
// ))}
// </ScrollView>
// )}

// <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Video, Lessons, and Tutors</Text>
// <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
// {altCategories.map((cat) => (
// <CategoryCard key={cat.label} label={cat.label} image={cat.image} />
// ))}
// </ScrollView>
// </View>
// );
// }
*/}
    </View>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9f9f9",
      padding: 20,
      paddingTop: height * 0.12,
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
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    cardScroll: {
      flexGrow: 0,
      marginBottom: 10,
    },
  });
}
