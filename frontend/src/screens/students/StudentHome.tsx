import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { StudentTabsParamList, StudentStackParamList } from "../../types/navigation";
import CategoryCard from "../../components/CategoryCard";
import { apiService, Category } from "../../services/api";
import temp from "../../../assets/playingCards.png";

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList, "StudentHome">,
  StackScreenProps<StudentStackParamList>
>;

export default function StudentHome({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleViewProfile = () => {
    navigation.navigate("StudentProfile");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerSpacer} />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Welcome to Skillin!</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Welcome to Skillin!</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
          <Ionicons name="person-circle-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="school" size={32} color={COLORS.purple} />
          </View>
          <Text style={styles.welcomeTitle}>Ready to Learn?</Text>
          <Text style={styles.welcomeDescription}>Explore our topics and start your learning journey today!</Text>
        </View>

        {/* Topics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Topics</Text>
            <Text style={styles.sectionSubtitle}>
              {categories.length} {categories.length === 1 ? "topic" : "topics"} available
            </Text>
          </View>

          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>No Topics Available</Text>
              <Text style={styles.emptyText}>Check back later for new topics!</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  label={category.title}
                  image={temp}
                  onPress={() => navigation.navigate("StudentTopicDetail", { id: category.title })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate("StudentProfile")}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>My Profile</Text>
              <Text style={styles.quickActionSubtitle}>View and edit your profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="bookmark-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>Saved Courses</Text>
              <Text style={styles.quickActionSubtitle}>Your bookmarked content</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="trending-up-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>Progress</Text>
              <Text style={styles.quickActionSubtitle}>Track your learning</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="help-circle-outline" size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionTitle}>Help & Support</Text>
              <Text style={styles.quickActionSubtitle}>Get assistance</Text>
            </TouchableOpacity>
          </View>
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
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
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
      paddingHorizontal: 16,
    },
    headerTitleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.black,
    },
    profileButton: {
      padding: 8,
      borderRadius: 8,
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
    welcomeSection: {
      alignItems: "center",
      padding: 24,
      backgroundColor: COLORS.lightGray,
    },
    welcomeIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.white,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 8,
    },
    welcomeDescription: {
      fontSize: 16,
      color: COLORS.gray,
      textAlign: "center",
      lineHeight: 24,
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
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
    horizontalScroll: {
      flexGrow: 0,
    },
    horizontalScrollContent: {
      paddingRight: 20,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: COLORS.gray,
      textAlign: "center",
      lineHeight: 24,
    },
    quickActions: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.lightGray,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    quickActionSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
      lineHeight: 20,
    },
  });
}
