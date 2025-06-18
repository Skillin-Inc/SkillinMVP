import React, { useState, useEffect, useContext } from "react";
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
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  const styles = getStyles();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    if (!user || !user.isTeacher) return;

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
    if (!user || !user.isTeacher) {
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

  if (!user || !user.isTeacher) {
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
          <Text style={styles.headerSubtitle}>Create lesson content (video upload coming soon)</Text>
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
  });
}
