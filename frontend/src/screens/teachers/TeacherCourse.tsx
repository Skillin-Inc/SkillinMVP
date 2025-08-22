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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { api, Course, Lesson } from "../../services/api/";
import { TeacherStackParamList } from "../../types/navigation";
import { HeaderWithBack, LoadingState, EmptyState, SectionHeader } from "../../components/common";
import { LessonCard } from "../../components/cards";
import { ActionButtons } from "../../components/actions";

type Props = StackScreenProps<TeacherStackParamList, "TeacherCourse">;

export default function TeacherCourse({ navigation, route }: Props) {
  const { courseId } = route.params;
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleCreateLesson = () => {
    navigation.navigate("TeacherTabs", {
      screen: "TeacherCreateLesson",
    });
  };

  const handleEditCourse = () => {
    if (!course) return;
    setEditingTitle(course.title);
    setEditingDescription(course.description);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!course || !editingTitle.trim() || !editingDescription.trim()) {
      Alert.alert("Error", "Title and description cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        title: editingTitle.trim(),
        description: editingDescription.trim(),
      };

      await api.updateCourse(courseId, updateData);

      setCourse({ ...course, ...updateData });
      setIsEditing(false);
      Alert.alert("Success", "Course updated successfully!");
    } catch (error) {
      console.error("Error updating course:", error);
      Alert.alert("Error", "Failed to update course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTitle("");
    setEditingDescription("");
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
              await api.deleteCourse(courseId);
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
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBack
        title={course.title}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.menuButton} onPress={handleEditCourse}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
          </TouchableOpacity>
        }
      />

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
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editingTitle}
                onChangeText={setEditingTitle}
                placeholder="Course title"
                maxLength={100}
              />
            ) : (
              <Text style={styles.courseTitle}>{course.title}</Text>
            )}
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

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About this course</Text>
          {isEditing ? (
            <TextInput
              style={styles.editTextArea}
              value={editingDescription}
              onChangeText={setEditingDescription}
              placeholder="Course description"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          ) : (
            <Text style={styles.courseDescription}>{course.description}</Text>
          )}
        </View>

        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} disabled={saving}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <ActionButtons
            primaryAction={{
              icon: "add-circle-outline",
              title: "Add New Lesson",
              onPress: handleCreateLesson,
            }}
            secondaryActions={[
              {
                icon: "create-outline",
                title: "Edit Course",
                onPress: handleEditCourse,
              },
            ]}
            dangerAction={{
              icon: "trash-outline",
              title: "Delete Course",
              onPress: handleDeleteCourse,
            }}
          />
        )}

        <View style={styles.lessonsSection}>
          <View style={styles.sectionHeaderContainer}>
            <SectionHeader title={`Lessons (${lessons.length})`} />
            <TouchableOpacity onPress={handleCreateLesson}>
              <Ionicons name="add" size={24} color={COLORS.purple} />
            </TouchableOpacity>
          </View>

          {lessons.length === 0 ? (
            <EmptyState
              icon="videocam-outline"
              title="No Lessons Yet"
              subtitle="Start adding lessons to build your course content."
              buttonText="Create Your First Lesson"
              onButtonPress={handleCreateLesson}
            />
          ) : (
            <View style={styles.lessonsContainer}>
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  onPress={() => {
                    navigation.navigate("TeacherLesson", { lessonId: lesson.id });
                  }}
                />
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
    sectionHeaderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
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
    editInput: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      backgroundColor: COLORS.white,
    },
    editTextArea: {
      fontSize: 16,
      color: COLORS.black,
      lineHeight: 24,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      backgroundColor: COLORS.white,
      minHeight: 100,
      textAlignVertical: "top",
    },
    editActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 20,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      color: COLORS.gray,
      fontSize: 16,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 4,
    },
  });
}
