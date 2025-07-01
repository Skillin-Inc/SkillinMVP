import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  RefreshControl,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";

import { COLORS } from "../../styles";
import { StudentTabsParamList, StudentStackParamList } from "../../types/navigation";

import { checkIfPaid } from "../../services/payments";
import { AuthContext } from "../../hooks/AuthContext";
import { SectionHeader, LoadingState, EmptyState } from "../../components/common";
import { CategoryCard, QuickActionCard } from "../../components/cards";
import { api, Category } from "../../services/api";
import temp from "../../../assets/playingCards.png";

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList, "StudentHome">,
  StackScreenProps<StudentStackParamList>
>;

export default function StudentHome({ navigation }: Props) {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const styles = getStyles();

  useEffect(() => {
    loadCategories();
    verifyPayment();
  }, []);

const verifyPayment = async () => {
  if (!user?.id) return;

  try {
    const isPaid = await checkIfPaid(Number(user.id));
    if (!isPaid) {
      setShowPaymentModal(true);
    } else {
      await loadCategories();
    }
  } catch (err) {
    console.error("Failed to verify payment:", err);
  } finally {
    setLoading(false);  
  }
};

useEffect(() => {
  let interval: NodeJS.Timeout;

  if (showPaymentModal && user?.id) {
    interval = setInterval(async () => {
      try {
        const isPaid = await checkIfPaid(Number(user.id));
        if (isPaid) {
          clearInterval(interval);
          setShowPaymentModal(false);
          loadCategories();
        }
      } catch (err) {
        console.error("Polling failed:", err);
      }
    }, 5000); // check every 5 seconds
  }

  return () => clearInterval(interval); 
}, [showPaymentModal, user?.id]);


  const loadCategories = async () => {
    try {
      const categoriesData = await api.getAllCategories();
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
  const handlePremiumFeature = () => {
    Alert.alert("Premium Feature", "This feature is premium-only and coming soon!");
  };

  const handleViewProfile = () => {
    navigation.navigate("StudentProfile", { userId: user?.id });
  };

  if (showPaymentModal) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Subscription Required
          </Text>
          <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}>
            You have not subscribed yet. Please complete your payment.
          </Text>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL("https://buy.stripe.com/test_28E7sKdikeIPcgPbHFgMw00");  // testing url
            }}
            style={{
              backgroundColor: COLORS.purple,
              padding: 12,
              borderRadius: 8,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Go to Payment
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <LoadingState text="Loading topics..." />
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
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="school" size={32} color={COLORS.purple} />
          </View>
          <Text style={styles.welcomeTitle}>Ready to Learn?</Text>
          <Text style={styles.welcomeDescription}>Explore our topics and start your learning journey today!</Text>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Topics"
            subtitle={`${categories.length} ${categories.length === 1 ? "topic" : "topics"} available`}
          />

          {categories.length === 0 ? (
            <EmptyState
              icon="library-outline"
              title="No Topics Available"
              subtitle="Check back later for new topics!"
            />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickActionCard
              icon="person-outline"
              title="My Profile"
              subtitle="View and edit your profile"
              onPress={() => navigation.navigate("StudentProfile", { userId: user?.id })}
            />

            <QuickActionCard
              icon="bookmark-outline"
              title="Saved Courses"
              subtitle="Your bookmarked content"
              onPress={() => {}}
            />
          </View>

          <View style={styles.quickActions}>
            <QuickActionCard
              icon="trending-up-outline"
              title="Progress"
              subtitle="Track your learning"
              onPress={handlePremiumFeature}
            />
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
