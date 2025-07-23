import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";
import { Course } from "../../services/api/";

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  showTeacher?: boolean;
  lessonCount?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, showTeacher = true, lessonCount }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress}>
      <View style={styles.courseHeader}>
        <View style={styles.courseIcon}>
          <Ionicons name="book" size={24} color={COLORS.purple} />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {showTeacher && (
            <View style={styles.teacherInfo}>
              <Ionicons name="person-outline" size={16} color={COLORS.gray} />
              <Text style={styles.teacherName}>
                By {course.teacher_first_name} {course.teacher_last_name}
              </Text>
            </View>
          )}
          <Text style={styles.courseDate}>Created {formatDate(course.created_at)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </View>
      <Text style={styles.courseDescription} numberOfLines={2}>
        {course.description}
      </Text>
      <View style={styles.courseFooter}>
        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Ionicons name="play-circle-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>
              {lessonCount !== undefined ? `${lessonCount} lesson${lessonCount !== 1 ? "s" : ""}` : "Lessons"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>0 students</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
  },
  courseDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
});

export default CourseCard;
