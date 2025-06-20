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
import { StudentStackParamList } from "../../types/navigation";

type Props = StackScreenProps<StudentStackParamList, "StudentLesson">;

export default function StudentLesson({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const { user } = useContext(AuthContext);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

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

  const handlePlayVideo = () => {
    if (lesson?.video_url) {
      // TODO: Implement video player or open video URL
      Alert.alert("Video Player", "Video player will be integrated soon!");
    } else {
      Alert.alert("No Video", "No video is available for this lesson yet.");
    }
  };

  const handleMarkComplete = () => {
    setIsCompleted(!isCompleted);
    Alert.alert("Lesson Progress", isCompleted ? "Lesson marked as incomplete" : "Lesson marked as complete!");
  };

  const handleBackToCourse = () => {
    if (course) {
      navigation.navigate("StudentCourse", { courseId: course.id });
    } else {
      navigation.goBack();
    }
  };

  const handleTakeNotes = () => {
    Alert.alert("Take Notes", "Note-taking feature will be available soon!");
  };

  const handleDownload = () => {
    Alert.alert("Download", "Offline download will be available soon!");
  };

  if (!user || user.userType !== "student") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only students can view lesson content.</Text>
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
            <Text style={styles.headerTitleText}>Lesson</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={handleBackToCourse}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleTakeNotes}>
          <Ionicons name="create-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Course Context */}
        {course && (
          <TouchableOpacity style={styles.courseContext} onPress={handleBackToCourse}>
            <View style={styles.courseContextHeader}>
              <Ionicons name="arrow-back" size={16} color={COLORS.purple} />
              <Text style={styles.courseContextText}>Back to {course.title}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={80} color={COLORS.white} />
            <Text style={styles.videoPlaceholderText}>Lesson Video</Text>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayVideo}>
              <Ionicons name="play" size={20} color={COLORS.white} />
              <Text style={styles.playButtonText}>Play Lesson</Text>
            </TouchableOpacity>
          </View>

          {/* Video Controls */}
          <View style={styles.videoControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handleDownload}>
              <Ionicons name="download-outline" size={20} color={COLORS.gray} />
              <Text style={styles.controlButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="settings-outline" size={20} color={COLORS.gray} />
              <Text style={styles.controlButtonText}>Quality</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="expand-outline" size={20} color={COLORS.gray} />
              <Text style={styles.controlButtonText}>Fullscreen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lesson Information */}
        <View style={styles.lessonInfo}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonTitleSection}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDate}>Published {formatDate(lesson.created_at)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.completeButton, isCompleted && styles.completedButton]}
              onPress={handleMarkComplete}
            >
              <Ionicons
                name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
                size={24}
                color={isCompleted ? COLORS.white : COLORS.purple}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: isCompleted ? "100%" : "0%" }]} />
            </View>
            <Text style={styles.progressText}>{isCompleted ? "Completed" : "Not started"}</Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this lesson</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.primaryAction} onPress={handleTakeNotes}>
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
              <Text style={styles.primaryActionText}>Take Notes</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryAction} onPress={handleDownload}>
                <Ionicons name="download-outline" size={18} color={COLORS.purple} />
                <Text style={styles.secondaryActionText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction}>
                <Ionicons name="share-outline" size={18} color={COLORS.purple} />
                <Text style={styles.secondaryActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Lesson Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Lesson Details</Text>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color={COLORS.gray} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>Video lesson</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Instructor</Text>
              <Text style={styles.detailValue}>
                {lesson.teacher_first_name} {lesson.teacher_last_name}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Published</Text>
              <Text style={styles.detailValue}>{formatDate(lesson.created_at)}</Text>
            </View>
          </View>

          {lesson.video_url && (
            <View style={styles.detailItem}>
              <Ionicons name="link-outline" size={20} color={COLORS.gray} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Video Source</Text>
                <Text style={styles.detailValue}>Available</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.markCompleteButton, isCompleted && styles.markCompletedButton]}
          onPress={handleMarkComplete}
        >
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
            size={20}
            color={COLORS.white}
          />
          <Text style={styles.markCompleteButtonText}>{isCompleted ? "Mark Incomplete" : "Mark Complete"}</Text>
        </TouchableOpacity>
      </View>
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
      color: COLORS.purple,
      marginLeft: 8,
      fontWeight: "500",
    },
    videoSection: {
      backgroundColor: COLORS.black,
    },
    videoPlaceholder: {
      aspectRatio: 16 / 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.black,
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
    videoControls: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 16,
      backgroundColor: "#1a1a1a",
    },
    controlButton: {
      alignItems: "center",
    },
    controlButtonText: {
      color: COLORS.gray,
      fontSize: 12,
      marginTop: 4,
    },
    lessonInfo: {
      padding: 20,
    },
    lessonHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 20,
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
    completeButton: {
      padding: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: COLORS.purple,
    },
    completedButton: {
      backgroundColor: COLORS.purple,
    },
    progressSection: {
      marginBottom: 24,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: COLORS.lightGray,
      borderRadius: 4,
      marginBottom: 8,
    },
    progressFill: {
      height: "100%",
      backgroundColor: COLORS.purple,
      borderRadius: 4,
    },
    progressText: {
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
    actionsSection: {
      marginBottom: 24,
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
    detailsSection: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
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
    bottomBar: {
      padding: 16,
      backgroundColor: COLORS.white,
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
    },
    markCompleteButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    markCompletedButton: {
      backgroundColor: "#4CAF50",
    },
    markCompleteButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
  });
}
