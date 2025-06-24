import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

interface LessonCardProps {
  lesson: {
    id: number;
    title: string;
    description: string;
    created_at: string;
  };
  index?: number;
  onPress?: () => void;
  showNumber?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, index, onPress, showNumber = true }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity style={styles.lessonCard} onPress={onPress}>
      {showNumber && typeof index === "number" && (
        <View style={styles.lessonNumber}>
          <Text style={styles.lessonNumberText}>{index + 1}</Text>
        </View>
      )}
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription} numberOfLines={2}>
          {lesson.description}
        </Text>
        <Text style={styles.lessonDate}>Created {formatDate(lesson.created_at)}</Text>
      </View>
      <View style={styles.lessonActions}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  lessonNumberText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
    lineHeight: 20,
  },
  lessonDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  lessonActions: {
    padding: 8,
  },
});

export default LessonCard;
