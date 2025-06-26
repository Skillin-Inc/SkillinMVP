import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { AuthContext } from "../../hooks/AuthContext";
import { COLORS, SPACINGS } from "../../styles";
import { StudentTabsParamList } from "../../types/navigation";
import { SectionHeader, EmptyState } from "../../components/common";
import { StatsCard } from "../../components/cards";

type Props = BottomTabScreenProps<StudentTabsParamList, "StudentProgress">;

interface ProgressLesson {
  id: number;
  title: string;
  courseTitle: string;
  progress: number; // 0-100
  lastWatched: string;
  duration: string;
  thumbnail?: string;
}

export default function StudentProgress({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [progressLessons, setProgressLessons] = useState<ProgressLesson[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch progress lessons from API
    // const lessons = await apiService.getStudentProgressLessons(user?.id);
    // setProgressLessons(lessons);
    console.log(user);
    setProgressLessons([]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleContinueLesson = (lesson: ProgressLesson) => {
    // TODO: Navigate to lesson with progress
    console.log("Continue lesson:", lesson.id);
    // navigation.navigate("StudentLesson", { lessonId: lesson.id });
  };

  const ProgressCard = ({ lesson }: { lesson: ProgressLesson }) => (
    <TouchableOpacity style={styles.progressCard} onPress={() => handleContinueLesson(lesson)}>
      <View style={styles.thumbnailContainer}>
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="play-circle" size={32} color={COLORS.white} />
        </View>
        <View style={styles.progressOverlay}>
          <View style={[styles.progressFill, { width: `${lesson.progress}%` }]} />
        </View>
      </View>

      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {lesson.courseTitle}
        </Text>

        <View style={styles.progressInfo}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${lesson.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{lesson.progress}% complete</Text>
        </View>

        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.gray} />
            <Text style={styles.metaText}>{lesson.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.metaText}>{lesson.lastWatched}</Text>
          </View>
        </View>
      </View>

      <View style={styles.continueButton}>
        <Ionicons name="play" size={16} color={COLORS.purple} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Progress</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Progress Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Ionicons name="trending-up" size={24} color={COLORS.purple} />
            </View>
            <Text style={styles.overviewTitle}>Learning Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatsCard icon="play-circle-outline" label="In Progress" value="0" color={COLORS.purple} />
            <StatsCard icon="checkmark-circle-outline" label="Completed" value="0" color={COLORS.green} />
            <StatsCard icon="time-outline" label="Watch Time" value="0h" color={COLORS.blue} />
          </View>
        </View>

        {/* Progress Lessons */}
        <View style={styles.section}>
          <SectionHeader
            title="Continue Watching"
            subtitle={`${progressLessons.length} ${progressLessons.length === 1 ? "lesson" : "lessons"}`}
          />

          {progressLessons.length === 0 ? (
            <EmptyState
              icon="play-circle-outline"
              title="No Lessons in Progress"
              subtitle="Start watching lessons to see your progress here. Your partially watched lessons will appear in this section."
              buttonText="Browse Courses"
              onButtonPress={() => navigation.navigate("StudentHome")}
            />
          ) : (
            <View style={styles.progressList}>
              {progressLessons.map((lesson) => (
                <ProgressCard key={lesson.id} lesson={lesson} />
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("StudentHome")}>
              <View style={styles.actionIcon}>
                <Ionicons name="home-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.actionTitle}>Browse Courses</Text>
              <Text style={styles.actionSubtitle}>Discover new content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("StudentProfile", { userId: user?.id || 0 })}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="person-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.actionTitle}>My Profile</Text>
              <Text style={styles.actionSubtitle}>View your achievements</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACINGS.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACINGS.base,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  filterButton: {
    padding: SPACINGS.small,
    borderRadius: 8,
  },
  overviewSection: {
    padding: SPACINGS.base,
    backgroundColor: COLORS.lightGray,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACINGS.base,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACINGS.small,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACINGS.base,
    marginHorizontal: SPACINGS.smallest,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACINGS.small,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SPACINGS.smallest,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },
  section: {
    padding: SPACINGS.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACINGS.base,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  progressList: {
    gap: SPACINGS.small,
  },
  progressCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACINGS.base,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  thumbnailContainer: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACINGS.base,
    position: "relative",
  },
  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderBottomLeftRadius: 8,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: SPACINGS.smallest,
  },
  courseTitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACINGS.small,
  },
  progressInfo: {
    marginBottom: SPACINGS.small,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginBottom: SPACINGS.smallest,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.purple,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  lessonMeta: {
    flexDirection: "row",
    gap: SPACINGS.base,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACINGS.smallest,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  continueButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACINGS.xlarge,
    paddingHorizontal: SPACINGS.base,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACINGS.base,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SPACINGS.small,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACINGS.large,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: SPACINGS.base,
    paddingHorizontal: SPACINGS.large,
    gap: SPACINGS.small,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    gap: SPACINGS.small,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACINGS.base,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACINGS.small,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: SPACINGS.smallest,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },
});
