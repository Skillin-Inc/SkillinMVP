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
import { api, Course, Lesson } from "../../services/api/";
import { StudentStackParamList } from "../../types/navigation";
import { HeaderWithBack, LoadingState, EmptyState, SectionHeader } from "../../components/common";

type Props = StackScreenProps<StudentStackParamList, "StudentCourse">;

export default function StudentCourse({ navigation, route }: Props) {
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
        api.getCourseById(courseId),
        api.getLessonsByCourse(courseId),
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

  const handleLessonPress = (lesson: Lesson) => {
    navigation.navigate("StudentLesson", { lessonId: lesson.id });
  };

  const handleEnrollCourse = () => {
    // TODO: Implement course enrollment
    Alert.alert("Enroll in Course", "Course enrollment will be available soon!");
  };

  const handleInstructorPress = () => {
    if (course?.teacher_id) {
      navigation.navigate("TeacherProfile", { userId: course.teacher_id });
    } else {
      Alert.alert("Instructor", "Instructor profile not available.");
    }
  };

  if (!user || user.userType !== "student") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only students can view course details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Course Details" onBackPress={() => navigation.goBack()} />
        <LoadingState text="Loading course details..." />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Course Not Found" onBackPress={() => navigation.goBack()} />
        <EmptyState
          icon="alert-circle-outline"
          title="Course Not Found"
          subtitle="The requested course could not be found."
          iconColor={COLORS.error}
        />
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
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.courseHeader}>
          <View style={styles.courseIcon}>
            <Ionicons name="book" size={32} color={COLORS.purple} />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <TouchableOpacity style={styles.teacherInfo} onPress={handleInstructorPress}>
              <Ionicons name="person-outline" size={16} color={COLORS.gray} />
              <Text style={styles.teacherName}>
                By {course.teacher_first_name} {course.teacher_last_name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
            </TouchableOpacity>
            <Text style={styles.courseDate}>Created {formatDate(course.created_at)}</Text>
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Ionicons name="play-circle-outline" size={16} color={COLORS.gray} />
                <Text style={styles.statText}>
                  {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                <Text style={styles.statText}>Self-paced</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <SectionHeader title="About this course" />
          <Text style={styles.courseDescription}>{course.description}</Text>
        </View>

        <View style={styles.enrollSection}>
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollCourse}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.enrollButtonText}>Enroll in Course</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            <Text style={styles.sectionSubtitle}>
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
            </Text>
          </View>

          {lessons.length === 0 ? (
            <View style={styles.emptyLessonsContainer}>
              <Ionicons name="videocam-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyLessonsTitle}>No Lessons Available</Text>
              <Text style={styles.emptyLessonsText}>This course doesn't have any lessons yet. Check back later!</Text>
            </View>
          ) : (
            <View style={styles.lessonsContainer}>
              {lessons.map((lesson, index) => (
                <TouchableOpacity key={lesson.id} style={styles.lessonCard} onPress={() => handleLessonPress(lesson)}>
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <View style={styles.lessonDuration}>
                        <Ionicons name="play-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.lessonMetaText}>Video lesson</Text>
                      </View>
                      <View style={styles.lessonStatus}>
                        <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.lessonMetaText}>Not started</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.lessonActions}>
                    <Ionicons name="play-circle-outline" size={24} color={COLORS.purple} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Course Details</Text>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(course.created_at)}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Instructor</Text>
              <Text style={styles.detailValue}>
                {course.teacher_first_name} {course.teacher_last_name}
              </Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="school-outline" size={20} color={COLORS.gray} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Level</Text>
              <Text style={styles.detailValue}>All levels</Text>
            </View>
          </View>
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
    favoriteButton: {
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
    teacherInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    teacherName: {
      fontSize: 14,
      color: COLORS.purple,
      marginLeft: 6,
      textDecorationLine: "underline",
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
    enrollSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    enrollButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    enrollButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    contentSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
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
      marginBottom: 8,
    },
    lessonMeta: {
      flexDirection: "row",
      gap: 16,
    },
    lessonDuration: {
      flexDirection: "row",
      alignItems: "center",
    },
    lessonStatus: {
      flexDirection: "row",
      alignItems: "center",
    },
    lessonMetaText: {
      fontSize: 12,
      color: COLORS.gray,
      marginLeft: 4,
    },
    lessonActions: {
      padding: 8,
    },
    detailsSection: {
      padding: 20,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    detailContent: {
      marginLeft: 16,
      flex: 1,
    },
    detailLabel: {
      fontSize: 14,
      color: COLORS.gray,
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 16,
      color: COLORS.black,
      fontWeight: "500",
    },
  });
}
