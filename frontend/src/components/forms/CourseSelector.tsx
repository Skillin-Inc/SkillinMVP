import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

interface Course {
  id: string;
  title: string;
}

interface CourseSelectorProps {
  visible: boolean;
  courses: Course[];
  selectedCourse: Course | null;
  onSelect: (course: Course) => void;
  onClose: () => void;
  onCreateNew?: () => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  visible,
  courses,
  selectedCourse,
  onSelect,
  onClose,
  onCreateNew,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Course</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          {courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No courses found. Please create a course first.</Text>
            </View>
          ) : (
            <FlatList
              data={courses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.courseItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.courseItemText}>{item.title}</Text>
                  {selectedCourse?.id === item.id && <Ionicons name="checkmark" size={20} color={COLORS.purple} />}
                </TouchableOpacity>
              )}
            />
          )}

          {onCreateNew && (
            <TouchableOpacity
              style={styles.createCourseItem}
              onPress={() => {
                onClose();
                onCreateNew();
              }}
            >
              <View style={styles.createCourseContent}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.purple} />
                <Text style={styles.createCourseText}>Create New Course</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.purple} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
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
    fontWeight: "bold",
    color: COLORS.black,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 24,
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
    flex: 1,
  },
  createCourseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
  },
  createCourseContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  createCourseText: {
    fontSize: 16,
    color: COLORS.purple,
    fontWeight: "600",
    marginLeft: 12,
  },
});

export default CourseSelector;
