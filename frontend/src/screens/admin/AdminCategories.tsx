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
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../styles";
import { api, Category, Course } from "../../services/api/";
import { LoadingState, SectionHeader } from "../../components/common";

interface CategoryWithStats extends Category {
  courseCount: number;
  teacherCount: number;
}

interface EditCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onUpdate: () => void;
}

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ visible, category, onClose, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const styles = getStyles();

  useEffect(() => {
    if (category) {
      setTitle(category.title);
    }
  }, [category]);

  const handleUpdate = async () => {
    if (!category) return;

    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setLoading(true);
    try {
      await api.updateCategory(category.id, {
        title: title.trim(),
      });
      Alert.alert("Success", "Category updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      Alert.alert("Error", "Failed to update category");
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
          <Text style={styles.modalTitle}>Edit Category</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter category title" />
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
                <Text style={styles.updateButtonText}>Update Category</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ visible, onClose, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const styles = getStyles();

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setLoading(true);
    try {
      await api.createCategory({
        title: title.trim(),
      });
      Alert.alert("Success", "Category created successfully");
      setTitle("");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
      Alert.alert("Error", "Failed to create category");
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
          <Text style={styles.modalTitle}>Create Category</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter category title" />
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="add-outline" size={20} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create Category</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const styles = getStyles();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, coursesData] = await Promise.all([api.getAllCategories(), api.getAllCourses()]);

      const categoriesWithStats: CategoryWithStats[] = categoriesData.map((category) => {
        const coursesInCategory = coursesData.filter((course: Course) => course.category_id === category.id);
        const uniqueTeachers = new Set(coursesInCategory.map((course: Course) => course.teacher_id));

        return {
          ...category,
          courseCount: coursesInCategory.length,
          teacherCount: uniqueTeachers.size,
        };
      });

      setCategories(categoriesWithStats);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteCategory = (category: CategoryWithStats) => {
    if (category.courseCount > 0) {
      Alert.alert(
        "Cannot Delete",
        `This category has ${category.courseCount} course(s). Please move or delete all courses before deleting the category.`
      );
      return;
    }

    Alert.alert("Delete Category", `Are you sure you want to delete "${category.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteCategory(category.id);
            Alert.alert("Success", "Category deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting category:", error);
            Alert.alert("Error", "Failed to delete category");
          }
        },
      },
    ]);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditModalVisible(true);
  };

  const totalCategories = categories.length;
  const totalCourses = categories.reduce((sum, cat) => sum + cat.courseCount, 0);
  const totalTeachers = new Set(
    categories.flatMap((cat) => Array.from({ length: cat.teacherCount }, (_, i) => `${cat.id}-${i}`))
  ).size;

  const renderCategoryItem = ({ item }: { item: CategoryWithStats }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <View style={styles.categoryStats}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color={COLORS.gray} />
              <Text style={styles.statText}>{item.courseCount} courses</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="person-outline" size={16} color={COLORS.gray} />
              <Text style={styles.statText}>{item.teacherCount} teachers</Text>
            </View>
          </View>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditCategory(item)}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCategory(item)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title="Category Management" />
        <TouchableOpacity style={styles.addButton} onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsTitle}>Category Overview</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsIconContainer}>
              <Ionicons name="grid-outline" size={24} color={COLORS.purple} />
            </View>
            <Text style={styles.analyticsNumber}>{totalCategories}</Text>
            <Text style={styles.analyticsLabel}>Total Categories</Text>
          </View>
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsIconContainer}>
              <Ionicons name="book-outline" size={24} color={COLORS.blue} />
            </View>
            <Text style={styles.analyticsNumber}>{totalCourses}</Text>
            <Text style={styles.analyticsLabel}>Total Courses</Text>
          </View>
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsIconContainer}>
              <Ionicons name="people-outline" size={24} color={COLORS.green} />
            </View>
            <Text style={styles.analyticsNumber}>{totalTeachers}</Text>
            <Text style={styles.analyticsLabel}>Active Teachers</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>No categories found</Text>
            <Text style={styles.emptyStateSubtext}>Create your first category to get started</Text>
          </View>
        }
      />

      <EditCategoryModal
        visible={editModalVisible}
        category={selectedCategory}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedCategory(null);
        }}
        onUpdate={fetchData}
      />

      <CreateCategoryModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onUpdate={fetchData}
      />
    </View>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    addButton: {
      backgroundColor: COLORS.purple,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: COLORS.white,
      fontWeight: "600",
      marginLeft: 4,
    },
    analyticsSection: {
      padding: 16,
      backgroundColor: COLORS.lightGray,
    },
    analyticsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 12,
    },
    analyticsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    analyticsCard: {
      flex: 1,
      backgroundColor: COLORS.white,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 4,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    analyticsIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.lightGray,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    analyticsNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 4,
    },
    analyticsLabel: {
      fontSize: 12,
      color: COLORS.gray,
      textAlign: "center",
    },
    listContainer: {
      padding: 16,
    },
    categoryItem: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryInfo: {
      flex: 1,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 8,
    },
    categoryStats: {
      flexDirection: "row",
      gap: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 14,
      color: COLORS.gray,
    },
    categoryActions: {
      flexDirection: "row",
      gap: 8,
    },
    editButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: COLORS.lightGray,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: COLORS.lightGray,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.gray,
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: COLORS.lightGray,
      marginTop: 4,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
    },
    modalContent: {
      padding: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: COLORS.white,
    },
    updateButton: {
      backgroundColor: COLORS.purple,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    createButton: {
      backgroundColor: COLORS.green,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    updateButtonText: {
      color: COLORS.white,
      fontWeight: "600",
      marginLeft: 8,
    },
    createButtonText: {
      color: COLORS.white,
      fontWeight: "600",
      marginLeft: 8,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
}
