import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types";
import { apiService, Course, Lesson } from "../services/api";

type AltCategoryDetailRouteProp = RouteProp<RootStackParamList, "AltCategoryDetail">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function AltCategoryDetail() {
  const route = useRoute<AltCategoryDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { topic: category } = route.params;

  const [content, setContent] = useState<Course[] | Lesson[]>([]);
  const [isLessonMode, setIsLessonMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAltCategoryContent();
  }, [category]);

  const fetchAltCategoryContent = async () => {
    try {
      setLoading(true);

      if (category.toLowerCase() === "lessons") {
        const lessons = await apiService.getAllLessons();
        setContent(lessons);
        setIsLessonMode(true);
        return;
      }

      const categories = await apiService.getAllCategories();
      const matchedCategory = categories.find((cat) => cat.title.toLowerCase() === category.toLowerCase());

      if (!matchedCategory) {
        Alert.alert("Error", `No matching category found for "${category}"`);
        setContent([]);
        return;
      }

      const allCourses = await apiService.getAllCourses();
      const filtered = allCourses.filter((course) => course.category_id === matchedCategory.id);

      setContent(filtered);
      setIsLessonMode(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      Alert.alert("Error", "Unable to fetch content for this category.");
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(
    (item) =>
      ("title" in item && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ("description" in item && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCoursePress = (item: Course | Lesson) => {
    Alert.alert("Selected", `You selected: ${item.title}`);
  };

  const renderItem = ({ item }: { item: Course | Lesson }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCoursePress(item)}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="help-circle-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No content for {category}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#414288" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{category}</Text>
        {!loading && (
          <Text style={styles.subtitle}>
            {filteredContent.length} item{filteredContent.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {!loading && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#414288" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContent}
          renderItem={renderItem}
          keyExtractor={(item) => ("id" in item ? item.id.toString() : Math.random().toString())}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  header: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#414288",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fefefe",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  cardDesc: {
    color: "#555",
    fontSize: 15,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 10,
  },
});
