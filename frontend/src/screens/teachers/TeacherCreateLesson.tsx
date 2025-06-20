import React, { useState, useEffect, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService, NewLesson, Course } from "../../services/api";
import { TeacherTabsParamList, TeacherStackParamList } from "../../types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TeacherTabsParamList, "TeacherCreateLesson">,
  StackScreenProps<TeacherStackParamList>
>;

export default function TeacherCreateLesson({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  const styles = getStyles();

  useEffect(() => {
    if (!user || user.userType !== "teacher") return;
    loadCourses();
  }, [user]);

  // Refresh courses when screen comes into focus (e.g., returning from course creation)
  useFocusEffect(
    React.useCallback(() => {
      if (user && user.userType === "teacher") {
        loadCourses();
      }
    }, [user])
  );

  const loadCourses = async () => {
    if (!user) return;

    try {
      const coursesData = await apiService.getCoursesByTeacher(user.id);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
      Alert.alert("Error", "Failed to load courses. Please try again.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      description: "",
      courseId: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.courseId) {
      newErrors.courseId = "Course is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!user || user.userType !== "teacher") {
      Alert.alert("Error", "Only teachers can create lessons");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const lessonData: NewLesson = {
        teacher_id: user.id,
        course_id: parseInt(formData.courseId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: "", // Empty for now, will be added via file upload later
      };

      await apiService.createLesson(lessonData);

      Alert.alert("Success", "Lesson created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              title: "",
              description: "",
              courseId: "",
            });
            setSelectedCourse(null);
            setSelectedVideo(null);
            setErrors({
              title: "",
              description: "",
              courseId: "",
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating lesson:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // move this somewhere else so it's only called when the user downloads the app
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your media library to select videos.");
      return false;
    }
    return true;
  };

  const selectVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploadingVideo(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 600, // 10 mins max for now
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoAsset = result.assets[0];
        setSelectedVideo(videoAsset);
        Alert.alert("Video Selected", `Selected: ${videoAsset.fileName || "video"}`);
      }
    } catch (error) {
      console.error("Error selecting video:", error);
      Alert.alert("Error", "Failed to select video. Please try again.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeVideo = () => {
    Alert.alert("Remove Video", "Are you sure you want to remove the selected video?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setSelectedVideo(null),
      },
    ]);
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (duration: number | undefined): string => {
    if (!duration) return "Unknown duration";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!user || user.userType !== "teacher") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only teachers can create lessons.</Text>
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
          <Text style={styles.headerTitleText}>Create Lesson</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="book-outline" size={32} color={COLORS.purple} />
          <Text style={styles.headerTitle}>Create New Lesson</Text>
          <Text style={styles.headerSubtitle}>Create lesson content with optional video upload</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lesson Title *</Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="Enter lesson title..."
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              maxLength={100}
              placeholderTextColor={COLORS.gray}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course *</Text>
            {loadingCourses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.purple} />
                <Text style={styles.loadingText}>Loading courses...</Text>
              </View>
            ) : courses.length === 0 ? (
              <View style={styles.noCourseContainer}>
                <Text style={styles.noCourseText}>No courses found. Please create a course first.</Text>
                <TouchableOpacity
                  style={styles.createCourseButton}
                  onPress={() => navigation.navigate("TeacherCreateCourse")}
                >
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.createCourseButtonText}>Create Your First Course</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.pickerContainer, errors.courseId ? styles.inputError : null]}
                onPress={() => setShowCourseModal(true)}
              >
                <Text style={[styles.pickerText, !selectedCourse && styles.placeholderText]}>
                  {selectedCourse ? selectedCourse.title : "Select a course..."}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
            {errors.courseId ? <Text style={styles.errorText}>{errors.courseId}</Text> : null}
          </View>

          <Modal visible={showCourseModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Course</Text>
                  <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.black} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={courses}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.courseItem}
                      onPress={() => {
                        setSelectedCourse(item);
                        updateFormData("courseId", item.id.toString());
                        setShowCourseModal(false);
                      }}
                    >
                      <Text style={styles.courseItemText}>{item.title}</Text>
                      {selectedCourse?.id === item.id && <Ionicons name="checkmark" size={20} color={COLORS.purple} />}
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.createCourseItem}
                  onPress={() => {
                    setShowCourseModal(false);
                    navigation.navigate("TeacherCreateCourse");
                  }}
                >
                  <View style={styles.createCourseContent}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.purple} />
                    <Text style={styles.createCourseText}>Create New Course</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.purple} />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description ? styles.inputError : null]}
              placeholder="Describe what students will learn in this lesson..."
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholderTextColor={COLORS.gray}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            <Text style={styles.characterCount}>{formData.description.length}/500 characters</Text>
          </View>

          {/* Video Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lesson Video</Text>
            <Text style={styles.helperText}>Upload a video for your lesson (optional)</Text>

            {selectedVideo ? (
              <View style={styles.videoPreview}>
                <View style={styles.videoInfo}>
                  <Ionicons name="videocam" size={24} color={COLORS.purple} />
                  <View style={styles.videoDetails}>
                    <Text style={styles.videoFileName}>{selectedVideo.fileName || "Selected Video"}</Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.videoMetaText}>{formatFileSize(selectedVideo.fileSize)}</Text>
                      {selectedVideo.duration && (
                        <>
                          <Text style={styles.videoMetaSeparator}>•</Text>
                          <Text style={styles.videoMetaText}>{formatDuration(selectedVideo.duration)}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.videoActions}>
                  <TouchableOpacity style={styles.videoActionButton} onPress={selectVideo}>
                    <Ionicons name="swap-horizontal" size={16} color={COLORS.purple} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.videoActionButton} onPress={removeVideo}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.videoUploadButton} onPress={selectVideo} disabled={uploadingVideo}>
                {uploadingVideo ? (
                  <ActivityIndicator color={COLORS.purple} size="small" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={32} color={COLORS.purple} />
                )}
                <Text style={styles.videoUploadText}>{uploadingVideo ? "Selecting Video..." : "Select Video"}</Text>
                <Text style={styles.videoUploadSubtext}>Choose a video file from your device</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Create Lesson</Text>
              </>
            )}
          </TouchableOpacity>
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
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 16,
      color: COLORS.gray,
      marginTop: 8,
      textAlign: "center",
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: "#E5E5EA",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: COLORS.black,
      backgroundColor: COLORS.white,
    },
    textArea: {
      borderWidth: 1,
      borderColor: "#E5E5EA",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: COLORS.black,
      backgroundColor: COLORS.white,
      minHeight: 100,
      textAlignVertical: "top",
    },
    inputError: {
      borderColor: COLORS.error,
    },
    errorText: {
      color: COLORS.error,
      fontSize: 14,
      marginTop: 4,
    },
    characterCount: {
      fontSize: 12,
      color: COLORS.gray,
      textAlign: "right",
      marginTop: 4,
    },
    helperText: {
      fontSize: 12,
      color: COLORS.gray,
      marginTop: 4,
    },
    submitButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    submitButtonDisabled: {
      backgroundColor: COLORS.gray,
    },
    submitButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 16,
      marginBottom: 8,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 16,
      color: COLORS.gray,
    },
    noCourseContainer: {
      padding: 16,
      backgroundColor: "#FFF3CD",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#FFEAA7",
    },
    noCourseText: {
      fontSize: 16,
      color: "#856404",
      textAlign: "center",
      marginBottom: 16,
    },
    createCourseButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 8,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    createCourseButtonText: {
      color: COLORS.white,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: "#E5E5EA",
      borderRadius: 12,
      backgroundColor: COLORS.white,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 16,
    },
    pickerText: {
      fontSize: 16,
      color: COLORS.black,
      flex: 1,
      padding: 16,
    },
    placeholderText: {
      color: COLORS.gray,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      width: "80%",
      maxHeight: "70%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.black,
    },
    courseItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    courseItemText: {
      fontSize: 16,
      color: COLORS.black,
    },
    createCourseItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
      backgroundColor: COLORS.lightGray,
    },
    createCourseContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    createCourseText: {
      fontSize: 16,
      color: COLORS.purple,
      fontWeight: "600",
      marginLeft: 8,
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
    headerSpacer: {
      width: 40,
    },
    videoUploadButton: {
      borderWidth: 2,
      borderColor: COLORS.purple,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F8F8FF",
    },
    videoUploadText: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.purple,
      marginTop: 8,
    },
    videoUploadSubtext: {
      fontSize: 14,
      color: COLORS.gray,
      marginTop: 4,
    },
    videoPreview: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 16,
      backgroundColor: COLORS.white,
    },
    videoInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    videoDetails: {
      flex: 1,
      marginLeft: 12,
    },
    videoFileName: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    videoMeta: {
      flexDirection: "row",
      alignItems: "center",
    },
    videoMetaText: {
      fontSize: 14,
      color: COLORS.gray,
    },
    videoMetaSeparator: {
      fontSize: 14,
      color: COLORS.gray,
      marginHorizontal: 8,
    },
    videoActions: {
      flexDirection: "row",
      gap: 8,
    },
    videoActionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.lightGray,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
