import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../styles";
import { apiService, Course, Category, Lesson } from "../../services/api";
import { LoadingState, SectionHeader } from "../../components/common";

interface EditCourseModalProps {
  visible: boolean;
  course: Course | null;
  categories: Category[];
  onClose: () => void;
  onUpdate: () => void;
}

interface EditLessonModalProps {
  visible: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onUpdate: () => void;
}

interface CourseWithLessons extends Course {
  lessons?: Lesson[];
  expanded?: boolean;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ visible, course, categories, onClose, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const styles = getStyles();

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setCategoryId(course.category_id);
    }
  }, [course]);

  const handleUpdate = async () => {
    if (!course) return;

    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }

    setLoading(true);
    try {
      await apiService.updateCourse(course.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        teacher_id: course.teacher_id,
      });
      Alert.alert("Success", "Course updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating course:", error);
      Alert.alert("Error", "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Course</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter course title" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter course description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => setShowCategoryModal(true)}>
              <Text style={styles.selectorText}>{selectedCategory ? selectedCategory.title : "Select category"}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color={COLORS.white} />
                <Text style={styles.updateButtonText}>Update Course</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Selection Modal */}
        <Modal visible={showCategoryModal} transparent animationType="fade">
          <View style={styles.categoryModalOverlay}>
            <View style={styles.categoryModalContent}>
              <Text style={styles.categoryModalTitle}>Select Category</Text>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    setCategoryId(category.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryOptionText}>{category.title}</Text>
                  {categoryId === category.id && <Ionicons name="checkmark" size={20} color={COLORS.purple} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.categoryCancelButton} onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.categoryCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const EditLessonModal: React.FC<EditLessonModalProps> = ({ visible, lesson, onClose, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const styles = getStyles();

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description);
      setVideoUrl(lesson.video_url || "");
    }
  }, [lesson]);

  const handleUpdate = async () => {
    if (!lesson) return;

    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }

    setLoading(true);
    try {
      await apiService.updateLesson(lesson.id, {
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(),
        teacher_id: lesson.teacher_id,
        course_id: lesson.course_id,
      });
      Alert.alert("Success", "Lesson updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating lesson:", error);
      Alert.alert("Error", "Failed to update lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Lesson</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter lesson title" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter lesson description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Video URL (Optional)</Text>
            <TextInput style={styles.input} value={videoUrl} onChangeText={setVideoUrl} placeholder="Enter video URL" />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color={COLORS.white} />
                <Text style={styles.updateButtonText}>Update Lesson</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCourseModalVisible, setEditCourseModalVisible] = useState(false);
  const [editLessonModalVisible, setEditLessonModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const styles = getStyles();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allCourses, allCategories] = await Promise.all([
        apiService.getAllCourses(),
        apiService.getAllCategories(),
      ]);

      // Fetch lessons for each course
      const coursesWithLessons = await Promise.all(
        allCourses.map(async (course) => {
          try {
            const lessons = await apiService.getLessonsByCourse(course.id);
            return { ...course, lessons, expanded: false };
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
            return { ...course, lessons: [], expanded: false };
          }
        })
      );

      setCourses(coursesWithLessons);
      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch courses and categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteCourse = (course: Course) => {
    Alert.alert("Delete Course", `Are you sure you want to delete "${course.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.deleteCourse(course.id);
            Alert.alert("Success", "Course deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting course:", error);
            Alert.alert("Error", "Failed to delete course");
          }
        },
      },
    ]);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setEditCourseModalVisible(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setEditLessonModalVisible(true);
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    Alert.alert("Delete Lesson", `Are you sure you want to delete "${lesson.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.deleteLesson(lesson.id);
            Alert.alert("Success", "Lesson deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting lesson:", error);
            Alert.alert("Error", "Failed to delete lesson");
          }
        },
      },
    ]);
  };

  const toggleCourseExpansion = (courseId: number) => {
    setCourses(courses.map((course) => (course.id === courseId ? { ...course, expanded: !course.expanded } : course)));
  };

  const filteredCourses = courses.filter((course) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower) ||
      (course.teacher_first_name && course.teacher_first_name.toLowerCase().includes(searchLower)) ||
      (course.teacher_last_name && course.teacher_last_name.toLowerCase().includes(searchLower))
    );
  });

  const renderCourseItem = ({ item }: { item: CourseWithLessons }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseInfo}>
        <View style={styles.courseHeader}>
          <TouchableOpacity style={styles.courseHeaderContent} onPress={() => toggleCourseExpansion(item.id)}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <View style={styles.lessonCount}>
              <Text style={styles.lessonCountText}>{item.lessons?.length || 0} lessons</Text>
              <Ionicons name={item.expanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.gray} />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.courseDescription} numberOfLines={item.expanded ? undefined : 2}>
          {item.description}
        </Text>
        <View style={styles.courseMeta}>
          <Text style={styles.teacherName}>
            By {item.teacher_first_name} {item.teacher_last_name}
          </Text>
          <Text style={styles.courseDate}>Created {new Date(item.created_at).toLocaleDateString()}</Text>
        </View>

        {item.expanded && item.lessons && item.lessons.length > 0 && (
          <View style={styles.lessonsContainer}>
            <Text style={styles.lessonsHeader}>Lessons:</Text>
            {item.lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonItem}>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                </View>
                <View style={styles.lessonActions}>
                  <TouchableOpacity style={styles.lessonEditButton} onPress={() => handleEditLesson(lesson)}>
                    <Ionicons name="pencil" size={16} color={COLORS.purple} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.lessonDeleteButton} onPress={() => handleDeleteLesson(lesson)}>
                    <Ionicons name="trash" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.courseActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditCourse(item)}>
          <Ionicons name="pencil" size={18} color={COLORS.purple} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCourse(item)}>
          <Ionicons name="trash" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingState text="Loading courses..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title="Course Management" subtitle={`${courses.length} courses total`} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <EditCourseModal
        visible={editCourseModalVisible}
        course={selectedCourse}
        categories={categories}
        onClose={() => {
          setEditCourseModalVisible(false);
          setSelectedCourse(null);
        }}
        onUpdate={fetchData}
      />

      <EditLessonModal
        visible={editLessonModalVisible}
        lesson={selectedLesson}
        onClose={() => {
          setEditLessonModalVisible(false);
          setSelectedLesson(null);
        }}
        onUpdate={fetchData}
      />
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.white,
    },
    loadingText: {
      marginTop: 10,
      color: COLORS.gray,
      fontSize: 16,
    },
    header: {
      padding: 20,
      backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
      marginTop: 4,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.white,
      margin: 20,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: COLORS.black,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    courseCard: {
      backgroundColor: COLORS.white,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 6,
    },
    courseDescription: {
      fontSize: 14,
      color: COLORS.gray,
      marginBottom: 8,
      lineHeight: 20,
    },
    courseMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    teacherName: {
      fontSize: 12,
      color: COLORS.purple,
      fontWeight: "500",
    },
    courseDate: {
      fontSize: 12,
      color: COLORS.gray,
    },
    courseActions: {
      flexDirection: "row",
      gap: 10,
      marginLeft: 12,
    },
    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.black,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: COLORS.black,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: COLORS.black,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    selectorButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
    },
    selectorText: {
      fontSize: 16,
      color: COLORS.black,
    },
    updateButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.purple,
      padding: 15,
      borderRadius: 8,
      gap: 8,
      marginTop: 20,
    },
    updateButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
    },
    disabledButton: {
      opacity: 0.6,
    },
    // Category selection modal
    categoryModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    categoryModalContent: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 20,
      width: 300,
      maxHeight: 400,
    },
    categoryModalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.black,
      textAlign: "center",
      marginBottom: 20,
    },
    categoryOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: COLORS.lightGray,
    },
    categoryOptionText: {
      fontSize: 16,
      color: COLORS.black,
    },
    categoryCancelButton: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: COLORS.error,
      marginTop: 10,
    },
    categoryCancelText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    // Lesson-related styles
    courseHeader: {
      marginBottom: 8,
    },
    courseHeaderContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    lessonCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    lessonCountText: {
      fontSize: 12,
      color: COLORS.gray,
      fontWeight: "500",
    },
    lessonsContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: COLORS.lightGray,
    },
    lessonsHeader: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 8,
    },
    lessonItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      marginBottom: 6,
      backgroundColor: COLORS.lightGray,
      borderRadius: 6,
    },
    lessonInfo: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: COLORS.black,
      marginBottom: 2,
    },
    lessonDescription: {
      fontSize: 12,
      color: COLORS.gray,
      lineHeight: 16,
    },
    lessonActions: {
      flexDirection: "row",
      gap: 8,
    },
    lessonEditButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.white,
      justifyContent: "center",
      alignItems: "center",
    },
    lessonDeleteButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.white,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
