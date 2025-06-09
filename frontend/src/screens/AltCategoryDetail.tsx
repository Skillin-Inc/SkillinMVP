import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types";
import { Course, apiService } from "../services/api";

type AltCategoryDetailRouteProp = RouteProp<RootStackParamList, "AltCategoryDetail">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function AltCategoryDetail() {
  const route = useRoute<AltCategoryDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { category } = route.params;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAltCategoryContent();
  }, [category]);

  const fetchAltCategoryContent = async () => {
    try {
      setLoading(true);
      const allCourses = await apiService.getAllCourses(); // You can replace this with a category-specific fetch if available
      const filtered = allCourses.filter((c) => c.tags?.some((tag) => tag.toLowerCase() === category.toLowerCase()));
      setCourses(filtered);
    } catch (error) {
      console.error("Failed to load data:", error);
      Alert.alert("Error", "Unable to fetch content for this category.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoursePress = (course: Course) => {
    Alert.alert("Selected", `You selected: ${course.title}`);
  };

  const renderItem = ({ item }: { item: Course }) => (
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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#414288" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{category}</Text>
        {!loading && (
          <Text style={styles.subtitle}>
            {filteredCourses.length} item{filteredCourses.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Search */}
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
          data={filteredCourses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
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

// idk what this is someone wrote it but it broke stuff inside of home so i changed it.
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

// {/* Video Lessons Section */}
// <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Video, Lessons, and Tutors</Text>
// <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
// {altCategories.map((cat) => (
// <CategoryCard key={cat.label} label={cat.label} image={cat.image} />
// ))}
// </ScrollView>
// </View>
// );
// }
