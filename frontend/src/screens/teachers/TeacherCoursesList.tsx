import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService, Course } from "../../services/api";
import { TeacherStackParamList } from "../../types/navigation";
import { LoadingState, EmptyState } from "../../components/common";
import { CourseCard } from "../../components/cards";

type Props = StackScreenProps<TeacherStackParamList, "TeacherCoursesList">;

export default function TeacherCoursesList({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<{ [courseId: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    if (!user || user.userType !== "teacher") return;

    try {
      const coursesData = await apiService.getCoursesByTeacher(user.id);
      setCourses(coursesData);

      // Fetch lesson counts for each course
      const counts: { [courseId: number]: number } = {};
      await Promise.all(
        coursesData.map(async (course) => {
          try {
            const lessons = await apiService.getLessonsByCourse(course.id);
            counts[course.id] = lessons.length;
          } catch (error) {
            console.error(`Error loading lessons for course ${course.id}:`, error);
            counts[course.id] = 0;
          }
        })
      );
      setLessonCounts(counts);
    } catch (error) {
      console.error("Error loading courses:", error);
      Alert.alert("Error", "Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCreateCourse = () => {
    navigation.navigate("TeacherCreateCourse");
  };

  if (!user || user.userType !== "teacher") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only teachers can view courses.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>My Courses</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateCourse}>
          <Ionicons name="add" size={24} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Ionicons name="school-outline" size={32} color={COLORS.purple} />
          <Text style={styles.headerTitle}>Your Courses</Text>
          <Text style={styles.headerSubtitle}>
            {courses.length} {courses.length === 1 ? "course" : "courses"} created
          </Text>
        </View>

        {loading ? (
          <LoadingState text="Loading your courses..." />
        ) : courses.length === 0 ? (
          <EmptyState
            icon="library-outline"
            title="No Courses Yet"
            subtitle="Start by creating your first course to organize your lessons."
            buttonText="Create Your First Course"
            onButtonPress={handleCreateCourse}
            iconSize={80}
          />
        ) : (
          <View style={styles.coursesContainer}>
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => navigation.navigate("TeacherCourse", { courseId: course.id })}
                showTeacher={false}
                lessonCount={lessonCounts[course.id] || 0}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {!loading && courses.length > 0 && (
        <View style={styles.fab}>
          <TouchableOpacity style={styles.fabButton} onPress={handleCreateCourse}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    scrollView: {
      flex: 1,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
    },
    headerTitleText: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
    },
    addButton: {
      padding: 8,
      borderRadius: 8,
    },
    header: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
      backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 12,
    },
    headerSubtitle: {
      fontSize: 16,
      color: COLORS.gray,
      marginTop: 8,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: COLORS.gray,
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 20,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: COLORS.gray,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
    },
    createButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
    },
    createButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    coursesContainer: {
      padding: 20,
    },
    courseCard: {
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
    },
    courseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    courseIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.lightGray,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 4,
    },
    courseDate: {
      fontSize: 14,
      color: COLORS.gray,
    },
    courseDescription: {
      fontSize: 15,
      color: COLORS.gray,
      lineHeight: 22,
      marginBottom: 16,
    },
    courseFooter: {
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
      paddingTop: 16,
    },
    courseStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      fontSize: 14,
      color: COLORS.gray,
      marginLeft: 6,
    },
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.purple,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.error,
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 16,
      color: COLORS.gray,
      textAlign: "center",
    },
  });
}
