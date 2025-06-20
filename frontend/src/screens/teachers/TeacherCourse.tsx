import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService, Course, Lesson } from "../../services/api";
import { TeacherStackParamList } from "../../types/navigation";

type Props = StackScreenProps<TeacherStackParamList, "TeacherCourse">;

export default function TeacherCourse({ navigation, route }: Props) {
  const { courseId } = route.params;
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles();

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseData, lessonsData] = await Promise.all([
        apiService.getCourseById(courseId),
        apiService.getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error loading course data:", error);
      Alert.alert("Error", "Failed to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourseData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateLesson = () => {
    // Navigate to create lesson screen - the course will be available in the dropdown
    navigation.navigate("TeacherTabs", {
      screen: "TeacherCreateLesson",
    });
  };

  const handleEditCourse = () => {
    // TODO: Navigate to edit course screen
    Alert.alert("Edit Course", "Course editing will be available soon!");
  };

  const handleDeleteCourse = () => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course? This action cannot be undone and will also delete all lessons in this course.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteCourse(courseId);
              Alert.alert("Success", "Course deleted successfully.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Error deleting course:", error);
              Alert.alert("Error", "Failed to delete course. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (!user || user.userType !== "teacher") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only teachers can view course details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Course Details</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Course Not Found</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Course Not Found</Text>
          <Text style={styles.errorText}>The requested course could not be found.</Text>
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
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {course.title}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleEditCourse}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Course Header */}
        <View style={styles.courseHeader}>
          <View style={styles.courseIcon}>
            <Ionicons name="book" size={32} color={COLORS.purple} />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDate}>Created {formatDate(course.created_at)}</Text>
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Ionicons name="play-circle-outline" size={16} color={COLORS.gray} />
                <Text style={styles.statText}>
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color={COLORS.gray} />
                <Text style={styles.statText}>0 students</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Course Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
        </View>

        {/* Course Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleCreateLesson}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.primaryActionText}>Add New Lesson</Text>
          </TouchableOpacity>
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction} onPress={handleEditCourse}>
              <Ionicons name="create-outline" size={20} color={COLORS.purple} />
              <Text style={styles.secondaryActionText}>Edit Course</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteCourse}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.dangerActionText}>Delete Course</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lessons Section */}
        <View style={styles.lessonsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
            <TouchableOpacity onPress={handleCreateLesson}>
              <Ionicons name="add" size={24} color={COLORS.purple} />
            </TouchableOpacity>
          </View>

          {lessons.length === 0 ? (
            <View style={styles.emptyLessonsContainer}>
              <Ionicons name="videocam-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyLessonsTitle}>No Lessons Yet</Text>
              <Text style={styles.emptyLessonsText}>Start adding lessons to build your course content.</Text>
              <TouchableOpacity style={styles.createLessonButton} onPress={handleCreateLesson}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.createLessonButtonText}>Create Your First Lesson</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lessonsContainer}>
              {lessons.map((lesson, index) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => {
                    navigation.navigate("TeacherLesson", { lessonId: lesson.id });
                  }}
                >
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>
                    <Text style={styles.lessonDate}>Created {formatDate(lesson.created_at)}</Text>
                  </View>
                  <View style={styles.lessonActions}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
      paddingHorizontal: 16,
    },
    headerTitleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
    },
    menuButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerSpacer: {
      width: 40,
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
    courseHeader: {
      flexDirection: "row",
      padding: 20,
      backgroundColor: COLORS.lightGray,
    },
    courseIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.white,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 8,
    },
    courseDate: {
      fontSize: 14,
      color: COLORS.gray,
      marginBottom: 12,
    },
    courseStats: {
      flexDirection: "row",
      gap: 16,
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
    descriptionSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 12,
    },
    courseDescription: {
      fontSize: 16,
      color: COLORS.gray,
      lineHeight: 24,
    },
    actionsSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    primaryAction: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    primaryActionText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    secondaryActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    secondaryAction: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    secondaryActionText: {
      color: COLORS.purple,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    dangerAction: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.error,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    dangerActionText: {
      color: COLORS.error,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    lessonsSection: {
      padding: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    emptyLessonsContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyLessonsTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyLessonsText: {
      fontSize: 16,
      color: COLORS.gray,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 24,
    },
    createLessonButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    createLessonButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    lessonsContainer: {
      gap: 12,
    },
    lessonCard: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    lessonNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.purple,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    lessonNumberText: {
      color: COLORS.white,
      fontSize: 14,
      fontWeight: "bold",
    },
    lessonInfo: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    lessonDescription: {
      fontSize: 14,
      color: COLORS.gray,
      lineHeight: 20,
      marginBottom: 4,
    },
    lessonDate: {
      fontSize: 12,
      color: COLORS.gray,
    },
    lessonActions: {
      padding: 8,
    },
  });
}
