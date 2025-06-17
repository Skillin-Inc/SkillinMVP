import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService, NewCourse, Category } from "../../services/api";

type Props = StackScreenProps<Record<string, object | undefined>, "CreateCourse">;

export default function CreateCourse({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    categoryId: "",
  });

  const styles = getStyles();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories. Please try again.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      description: "",
      categoryId: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!user || !user.isTeacher) {
      Alert.alert("Error", "Only teachers can create courses");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const courseData: NewCourse = {
        teacher_id: user.id,
        category_id: parseInt(formData.categoryId),
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      await apiService.createCourse(courseData);

      Alert.alert("Success", "Course created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              title: "",
              description: "",
              categoryId: "",
            });
            setErrors({
              title: "",
              description: "",
              categoryId: "",
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating course:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create course. Please try again.");
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
          <Text style={styles.errorText}>Only teachers can create courses.</Text>
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
          <Text style={styles.headerTitleText}>Create Course</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="school-outline" size={32} color={COLORS.purple} />
          <Text style={styles.headerTitle}>Create New Course</Text>
          <Text style={styles.headerSubtitle}>Create a course to organize your lessons</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Title *</Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="Enter course title..."
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              maxLength={100}
              placeholderTextColor={COLORS.gray}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            {loadingCategories ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.purple} />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.pickerContainer, errors.categoryId ? styles.inputError : null]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.pickerText, !selectedCategory && styles.placeholderText]}>
                  {selectedCategory ? selectedCategory.title : "Select a category..."}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
            {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}
          </View>

          <Modal visible={showCategoryModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.black} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => {
                        setSelectedCategory(item);
                        updateFormData("categoryId", item.id.toString());
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>{item.title}</Text>
                      {selectedCategory?.id === item.id && (
                        <Ionicons name="checkmark" size={20} color={COLORS.purple} />
                      )}
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
              placeholder="Describe what this course will cover..."
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
                <Text style={styles.submitButtonText}>Create Course</Text>
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
      borderColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: COLORS.black,
      backgroundColor: COLORS.white,
    },
    textArea: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: COLORS.black,
      backgroundColor: COLORS.white,
      minHeight: 120,
      textAlignVertical: "top",
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 12,
      backgroundColor: COLORS.white,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 16,
    },
    picker: {
      height: 50,
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
    inputError: {
      borderColor: COLORS.error,
    },
    errorText: {
      fontSize: 14,
      color: COLORS.error,
      marginTop: 4,
    },
    characterCount: {
      fontSize: 12,
      color: COLORS.gray,
      textAlign: "right",
      marginTop: 4,
    },
    submitButton: {
      backgroundColor: COLORS.purple,
      padding: 16,
      borderRadius: 12,
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
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 8,
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
    categoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    categoryItemText: {
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
