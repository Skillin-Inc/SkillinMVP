import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { api, Course, Category } from "../../services/api";
import { StudentStackParamList } from "../../types/navigation";
import { LoadingState, EmptyState } from "../../components/common";
import { CourseCard } from "../../components/cards";

type Props = StackScreenProps<StudentStackParamList, "StudentTopicDetail">;

const COURSES_PER_PAGE = 10;

export default function StudentTopicDetail({ navigation, route }: Props) {
  const { id } = route.params;

  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreCourses, setHasMoreCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialCourses();
  }, [id]);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, allCourses]);

  const loadInitialCourses = async () => {
    try {
      setLoading(true);
      setCourses([]);
      setAllCourses([]);
      setHasMoreCourses(true);

      const categories = await api.getAllCategories();
      const matchingCategory = categories.find(
        (category: Category) => category.title.toLowerCase() === id.toLowerCase()
      );

      if (!matchingCategory) {
        Alert.alert("Error", `Topic "${id}" not found.`);
        setCourses([]);
        setAllCourses([]);
        setCategoryId(null);
        return;
      }

      setCategoryId(matchingCategory.id);

      const coursesData = await api.getCoursesByCategory(matchingCategory.id, COURSES_PER_PAGE, 0);
      setAllCourses(coursesData);

      // Check if there are more courses to load
      if (coursesData.length < COURSES_PER_PAGE) {
        setHasMoreCourses(false);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      Alert.alert("Error", "Failed to load courses. Please try again.");
      setCourses([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCourses = async () => {
    if (!categoryId || loadingMore || !hasMoreCourses) return;

    try {
      setLoadingMore(true);
      const nextOffset = allCourses.length;
      const moreCourses = await api.getCoursesByCategory(categoryId, COURSES_PER_PAGE, nextOffset);

      if (moreCourses.length === 0 || moreCourses.length < COURSES_PER_PAGE) {
        setHasMoreCourses(false);
      }

      setAllCourses((prev) => [...prev, ...moreCourses]);
    } catch (error) {
      console.error("Error loading more courses:", error);
      Alert.alert("Error", "Failed to load more courses. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const filterCourses = () => {
    if (!searchQuery.trim()) {
      setCourses(allCourses);
      return;
    }

    const filtered = allCourses.filter((course) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        (course.teacher_first_name && course.teacher_first_name.toLowerCase().includes(searchLower)) ||
        (course.teacher_last_name && course.teacher_last_name.toLowerCase().includes(searchLower)) ||
        (course.teacher_username && course.teacher_username.toLowerCase().includes(searchLower))
      );
    });
    setCourses(filtered);
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate("StudentCourse", { courseId: course.id });
  };

  const renderLoadMoreButton = () => {
    if (searchQuery.trim() || !hasMoreCourses) return null;

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreCourses} disabled={loadingMore}>
        {loadingMore ? (
          <View style={styles.loadMoreContent}>
            <ActivityIndicator size="small" color="#414288" />
            <Text style={styles.loadMoreText}>Loading more courses...</Text>
          </View>
        ) : (
          <Text style={[styles.loadMoreText, { marginLeft: 0 }]}>Load More Courses</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={() => handleCoursePress(item)} />
  );

  const displayedCourses = searchQuery.trim() ? courses : allCourses;

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
            : `${displayedCourses.length} course${displayedCourses.length !== 1 ? "s" : ""} ${
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
              placeholder="Search courses and teachers..."
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
        <LoadingState text="Loading courses..." color="#414288" />
      ) : displayedCourses.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title={searchQuery ? "No Matching Courses" : "No Courses Available"}
          subtitle={
            searchQuery
              ? `No courses match "${searchQuery}" in ${id}.`
              : `There are no courses available for ${id} yet.`
          }
        />
      ) : (
        <FlatList
          data={displayedCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.coursesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderLoadMoreButton}
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
  loadMoreButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#414288",
  },
  loadMoreContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#414288",
    marginLeft: 4,
  },
});
