import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { apiService, Course, Category } from "../../services/api";
import { StudentStackParamList } from "../../types/navigation";

type Props = StackScreenProps<StudentStackParamList, "StudentTopicDetail">;

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
}

const CourseCard = ({ course, onPress }: CourseCardProps) => (
  <TouchableOpacity style={styles.courseCard} onPress={onPress}>
    <View style={styles.courseHeader}>
      <Text style={styles.courseTitle}>{course.title}</Text>
      <View style={styles.teacherBadge}>
        <Ionicons name="person" size={14} color="#666" />
        <Text style={styles.teacherName}>
          {course.teacher_first_name} {course.teacher_last_name}
        </Text>
      </View>
    </View>
    <Text style={styles.courseDescription} numberOfLines={3}>
      {course.description}
    </Text>
    <View style={styles.courseFooter}>
      <Text style={styles.courseDate}>Created {new Date(course.created_at).toLocaleDateString()}</Text>
      <Ionicons name="chevron-forward" size={20} color="#414288" />
    </View>
  </TouchableOpacity>
);

export default function StudentTopicDetail({ navigation, route }: Props) {
  const { id } = route.params;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCoursesForTopic();
  }, [id]);

  const loadCoursesForTopic = async () => {
    try {
      setLoading(true);

      const categories = await apiService.getAllCategories();
      const matchingCategory = categories.find(
        (category: Category) => category.title.toLowerCase() === id.toLowerCase()
      );

      if (!matchingCategory) {
        Alert.alert("Error", `Topic "${id}" not found.`);
        setCourses([]);
        return;
      }

      const coursesData = await apiService.getCoursesByCategory(matchingCategory.id);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
      Alert.alert("Error", "Failed to load courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (course: Course) => {
    Alert.alert("Course Selected", `You selected: ${course.title}`);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>{searchQuery ? "No Matching Courses" : "No Courses Available"}</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? `No courses match "${searchQuery}" in ${id}.` : `There are no courses available for ${id} yet.`}
      </Text>
    </View>
  );

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={() => handleCoursePress(item)} />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#414288" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{id}</Text>
        <Text style={styles.subtitle}>
          {loading
            ? "Loading courses..."
            : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} ${
                searchQuery ? "found" : "available"
              }`}
        </Text>
      </View>

      {!loading && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#414288" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : filteredCourses.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.coursesList}
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
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#414288",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  coursesList: {
    padding: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  teacherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  teacherName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  courseDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  courseDate: {
    fontSize: 14,
    color: "#888",
  },
});
