import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { lessons as lessonsApi, courses as coursesApi, Lesson, Course } from "../../services/api";
import { TeacherStackParamList } from "../../types/navigation";
import { HeaderWithBack, LoadingState, EmptyState, SectionHeader } from "../../components/common";
import { VideoSection } from "../../components/media";
import { ActionButtons } from "../../components/actions";

type Props = StackScreenProps<TeacherStackParamList, "TeacherLesson">;

export default function TeacherLesson({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const { user } = useContext(AuthContext);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const styles = getStyles();

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      const lessonData = await lessonsApi.getLessonById(lessonId);
      setLesson(lessonData);

      // Also fetch the course data for context
      const courseData = await coursesApi.getCourseById(lessonData.course_id);
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
    if (!lesson) return;
    setEditingTitle(lesson.title);
    setEditingDescription(lesson.description);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!lesson || !editingTitle.trim() || !editingDescription.trim()) {
      Alert.alert("Error", "Title and description cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        title: editingTitle.trim(),
        description: editingDescription.trim(),
      };

      await lessonsApi.updateLesson(lessonId, updateData);

      setLesson({ ...lesson, ...updateData });
      setIsEditing(false);
      Alert.alert("Success", "Lesson updated successfully!");
    } catch (error) {
      console.error("Error updating lesson:", error);
      Alert.alert("Error", "Failed to update lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTitle("");
    setEditingDescription("");
  };

  const handleDeleteLesson = () => {
    Alert.alert("Delete Lesson", "Are you sure you want to delete this lesson? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await lessonsApi.deleteLesson(lessonId);
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
        <HeaderWithBack title="Lesson Details" onBackPress={() => navigation.goBack()} />
        <LoadingState text="Loading lesson details..." />
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Lesson Not Found" onBackPress={() => navigation.goBack()} />
        <EmptyState
          icon="alert-circle-outline"
          title="Lesson Not Found"
          subtitle="The requested lesson could not be found."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBack
        title={lesson.title}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.menuButton} onPress={handleEditLesson}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {course && (
          <View style={styles.courseContext}>
            <View style={styles.courseContextHeader}>
              <Ionicons name="book-outline" size={16} color={COLORS.gray} />
              <Text style={styles.courseContextText}>From course: {course.title}</Text>
            </View>
          </View>
        )}

        <VideoSection title="Video Preview" onPlayPress={handlePlayVideo} hasVideo={!!lesson.video_url} />

        <View style={styles.lessonInfo}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonIcon}>
              <Ionicons name="videocam" size={24} color={COLORS.purple} />
            </View>
            <View style={styles.lessonTitleSection}>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editingTitle}
                  onChangeText={setEditingTitle}
                  placeholder="Lesson title"
                  maxLength={100}
                />
              ) : (
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              )}
              <Text style={styles.lessonDate}>Created {formatDate(lesson.created_at)}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <SectionHeader title="Description" />
            {isEditing ? (
              <TextInput
                style={styles.editTextArea}
                value={editingDescription}
                onChangeText={setEditingDescription}
                placeholder="Lesson description"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            ) : (
              <Text style={styles.lessonDescription}>{lesson.description}</Text>
            )}
          </View>

          <View style={styles.videoInfoSection}>
            <SectionHeader title="Video Information" />
            <View style={styles.videoInfoItem}>
              <Ionicons name="link-outline" size={16} color={COLORS.gray} />
              <Text style={styles.videoInfoText}>{lesson.video_url || "No video uploaded yet"}</Text>
            </View>
          </View>
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
              icon: "create-outline",
              title: "Edit Lesson",
              onPress: handleEditLesson,
            }}
            secondaryActions={[
              {
                icon: "play-outline",
                title: "Preview",
                onPress: handlePlayVideo,
              },
            ]}
            dangerAction={{
              icon: "trash-outline",
              title: "Delete",
              onPress: handleDeleteLesson,
            }}
          />
        )}
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
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
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
