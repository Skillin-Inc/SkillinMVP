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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService, Lesson, Course } from "../../services/api";
import { TeacherStackParamList } from "../../types/navigation";

type Props = StackScreenProps<TeacherStackParamList, "TeacherLesson">;

export default function TeacherLesson({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const { user } = useContext(AuthContext);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = getStyles();

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      const lessonData = await apiService.getLessonById(lessonId);
      setLesson(lessonData);

      // Also fetch the course data for context
      const courseData = await apiService.getCourseById(lessonData.course_id);
      setCourse(courseData);
    } catch (error) {
      console.error("Error loading lesson data:", error);
      Alert.alert("Error", "Failed to load lesson data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditLesson = () => {
    // TODO: Navigate to edit lesson screen
    Alert.alert("Edit Lesson", "Lesson editing will be available soon!");
  };

  const handleDeleteLesson = () => {
    Alert.alert("Delete Lesson", "Are you sure you want to delete this lesson? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.deleteLesson(lessonId);
            Alert.alert("Success", "Lesson deleted successfully.", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error("Error deleting lesson:", error);
            Alert.alert("Error", "Failed to delete lesson. Please try again.");
          }
        },
      },
    ]);
  };

  const handlePlayVideo = () => {
    if (lesson?.video_url) {
      // TODO: Implement video player or open video URL
      Alert.alert("Video Player", "Video player will be integrated soon!");
    } else {
      Alert.alert("No Video", "No video has been uploaded for this lesson yet.");
    }
  };

  if (!user || user.userType !== "teacher") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only teachers can view lesson details.</Text>
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
            <Text style={styles.headerTitleText}>Lesson Details</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading lesson details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Lesson Not Found</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Lesson Not Found</Text>
          <Text style={styles.errorText}>The requested lesson could not be found.</Text>
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
            {lesson.title}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleEditLesson}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Course Context */}
        {course && (
          <View style={styles.courseContext}>
            <View style={styles.courseContextHeader}>
              <Ionicons name="book-outline" size={16} color={COLORS.gray} />
              <Text style={styles.courseContextText}>From course: {course.title}</Text>
            </View>
          </View>
        )}

        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={64} color={COLORS.purple} />
            <Text style={styles.videoPlaceholderText}>Video Preview</Text>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayVideo}>
              <Ionicons name="play" size={20} color={COLORS.white} />
              <Text style={styles.playButtonText}>Play Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lesson Information */}
        <View style={styles.lessonInfo}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonIcon}>
              <Ionicons name="videocam" size={24} color={COLORS.purple} />
            </View>
            <View style={styles.lessonTitleSection}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDate}>Created {formatDate(lesson.created_at)}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
          </View>

          <View style={styles.videoInfoSection}>
            <Text style={styles.sectionTitle}>Video Information</Text>
            <View style={styles.videoInfoItem}>
              <Ionicons name="link-outline" size={16} color={COLORS.gray} />
              <Text style={styles.videoInfoText}>{lesson.video_url || "No video uploaded yet"}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleEditLesson}>
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
            <Text style={styles.primaryActionText}>Edit Lesson</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction} onPress={handlePlayVideo}>
              <Ionicons name="play-outline" size={20} color={COLORS.purple} />
              <Text style={styles.secondaryActionText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteLesson}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.dangerActionText}>Delete</Text>
            </TouchableOpacity>
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
    courseContext: {
      backgroundColor: COLORS.lightGray,
      padding: 16,
    },
    courseContextHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    courseContextText: {
      fontSize: 14,
      color: COLORS.gray,
      marginLeft: 8,
    },
    videoSection: {
      backgroundColor: COLORS.black,
      aspectRatio: 16 / 9,
      alignItems: "center",
      justifyContent: "center",
    },
    videoPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    videoPlaceholderText: {
      color: COLORS.white,
      fontSize: 18,
      marginTop: 12,
      marginBottom: 20,
    },
    playButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 25,
      paddingVertical: 12,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
    },
    playButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    lessonInfo: {
      padding: 20,
    },
    lessonHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    lessonIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.lightGray,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    lessonTitleSection: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 8,
    },
    lessonDate: {
      fontSize: 14,
      color: COLORS.gray,
    },
    descriptionSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 12,
    },
    lessonDescription: {
      fontSize: 16,
      color: COLORS.gray,
      lineHeight: 24,
    },
    videoInfoSection: {
      marginBottom: 24,
    },
    videoInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: COLORS.lightGray,
      borderRadius: 8,
    },
    videoInfoText: {
      fontSize: 14,
      color: COLORS.gray,
      marginLeft: 8,
      flex: 1,
    },
    actionsSection: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
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
      gap: 12,
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
    },
    dangerActionText: {
      color: COLORS.error,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
  });
}
