import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// import { COLORS } from "../styles";
import { useScreenDimensions } from "../../hooks";
import { RootStackParamList } from "../../types";
import CategoryCard from "../../components/CategoryCard";
import { apiService, Category } from "../../services/api";
import temp from "../../../assets/playingCards.png";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const altCategories = [
  { label: "Tutors", image: temp },
  { label: "Lessons", image: temp },
  { label: "Stand-alone Videos", image: temp },
  { label: "Coaching", image: temp },
  { label: "Current", image: temp },
];

export default function Home() {
  const navigation = useNavigation<NavigationProp>();
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#414288" size="small" />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No topics available</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              label={category.title}
              image={temp}
              onPress={() => navigation.navigate("TopicDetail", { topic: category.title })}
            />
          ))}
        </ScrollView>
      )}

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
    card: {
      backgroundColor: "#6a1b9a",
      opacity: 0.85,
      borderRadius: 16,
      marginRight: 16,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 6,
      elevation: 5,
    },
    cardText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      paddingHorizontal: 6,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 16,
      color: "#666",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
    },
  });
}
