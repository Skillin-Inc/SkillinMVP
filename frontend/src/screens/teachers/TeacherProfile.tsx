import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

import { AuthContext } from "../../hooks/AuthContext";
import { SectionHeader } from "../../components/common";
import { ImagePickerAvatar } from "../../components/forms";
import { StatsCard, QuickActionCard } from "../../components/cards";
import { COLORS, SPACINGS } from "../../styles";
import { TeacherTabsParamList, TeacherStackParamList } from "../../types/navigation";
import { User, users as usersApi, transformBackendUserToUser } from "../../services/api";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TeacherTabsParamList, "TeacherProfile">,
  StackScreenProps<TeacherStackParamList>
>;

export default function TeacherProfile({ navigation, route }: Props) {
  const { logout, user: currentUser } = useContext(AuthContext);
  const userId = route.params?.userId ?? currentUser?.id ?? "";
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      if (isOwnProfile && currentUser) {
        setProfileUser(currentUser);
      } else {
        const backendUser = await usersApi.getUserById(userId);
        const transformedUser = transformBackendUserToUser(backendUser);
        setProfileUser(transformedUser);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
      if (currentUser) {
        setProfileUser(currentUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.error("Logout error:", e);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    if (!isOwnProfile) {
      Alert.alert("Not Allowed", "You can only edit your own profile.");
      return;
    }
    navigation.navigate("EditProfile");
  };

  const handleSettings = () => {
    if (!isOwnProfile) {
      Alert.alert("Not Allowed", "You can only access your own settings.");
      return;
    }
    Alert.alert("Settings", "Settings page will be available soon!");
  };

  const handleSupport = () => {
    Alert.alert("Support", "Support center will be available soon!");
  };

  const handleSendMessage = () => {
    if (profileUser) {
      navigation.navigate("Chat", { id: profileUser.id.toString() });
    }
  };

  const handleViewStats = () => {
    navigation.navigate("TeacherHome");
  };

  const InfoCard = ({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.infoCard} onPress={onPress} disabled={!onPress}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={20} color={COLORS.purple} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
        {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />}
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </TouchableOpacity>
  );

  const getTeacherBadgeColor = () => {
    return COLORS.blue;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {isOwnProfile ? "Teacher Profile" : `${profileUser?.firstName} ${profileUser?.lastName}'s Profile`}
          </Text>
        </View>
        {isOwnProfile && (
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <ImagePickerAvatar initialUri={avatarUri} onChange={isOwnProfile ? setAvatarUri : undefined} size={100} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profileUser?.username ?? "Unknown Teacher"}</Text>
            <Text style={styles.userEmail}>{profileUser?.email ?? ""}</Text>

            <View style={[styles.teacherBadge, { backgroundColor: getTeacherBadgeColor() }]}>
              <Ionicons name="school" size={14} color={COLORS.white} />
              <Text style={styles.teacherText}>Certified Teacher</Text>
            </View>
          </View>

          {!isOwnProfile && (
            <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
              <Text style={styles.messageButtonText}>Send Message</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Teaching Statistics" />

          <View style={styles.statsGrid}>
            <StatsCard icon="book-outline" label="Courses" value="0" color={COLORS.purple} />

            <StatsCard icon="people-outline" label="Students" value="0" color={COLORS.green} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <InfoCard
            icon="calendar-outline"
            label="Date of Birth"
            value={profileUser?.date_of_birth ?? "Not provided"}
          />

          <InfoCard icon="call-outline" label="Phone Number" value={profileUser?.phoneNumber ?? "Not provided"} />
        </View>

        {isOwnProfile && (
          <View style={styles.section}>
            <SectionHeader title="Teacher Actions" />

            <View style={styles.quickActions}>
              <QuickActionCard
                icon="create-outline"
                title="Edit Profile"
                subtitle="Update your profile information"
                onPress={handleEditProfile}
              />

              <QuickActionCard
                icon="add-circle-outline"
                title="Create Course"
                subtitle="Design a new course"
                onPress={() => navigation.navigate("TeacherCreateLesson")}
                iconColor={COLORS.green}
              />
            </View>

            <View style={styles.quickActions}>
              <QuickActionCard
                icon="library-outline"
                title="My Courses"
                subtitle="Manage your courses"
                onPress={() => Alert.alert("My Courses", "Feature coming soon!")}
              />

              <QuickActionCard
                icon="stats-chart-outline"
                title="Analytics"
                subtitle="View detailed statistics"
                onPress={handleViewStats}
                iconColor={COLORS.blue}
              />
            </View>

            <View style={styles.quickActions}>
              <QuickActionCard
                icon="card-outline"
                title="Payouts"
                subtitle="Manage earnings and payments"
                onPress={() => Alert.alert("Payouts", "Feature coming soon!")}
                iconColor="#FFD700"
              />

              <QuickActionCard
                icon="help-circle-outline"
                title="Teacher Support"
                subtitle="Get help with teaching"
                onPress={handleSupport}
              />
            </View>
            <View style={styles.section}>
              <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Skillin Teacher v1.0.0</Text>
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
  backButton: {
    padding: SPACINGS.small,
    borderRadius: 8,
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
  settingsButton: {
    padding: SPACINGS.small,
    borderRadius: 8,
  },
  profileSection: {
    alignItems: "center",
    padding: SPACINGS.large,
    backgroundColor: COLORS.lightGray,
  },
  avatarContainer: {
    marginBottom: SPACINGS.base,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SPACINGS.smallest,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: SPACINGS.base,
  },
  teacherBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACINGS.smallest + 2,
    paddingHorizontal: SPACINGS.small + 4,
    borderRadius: 20,
  },
  teacherText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: SPACINGS.smallest,
  },
  section: {
    padding: SPACINGS.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACINGS.small,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SPACINGS.base,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACINGS.small,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACINGS.base,
    margin: SPACINGS.smallest,
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
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACINGS.small,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SPACINGS.smallest,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACINGS.base,
    marginBottom: SPACINGS.small,
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
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACINGS.smallest,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACINGS.small,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.gray,
    marginLeft: 40,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACINGS.base,
    marginBottom: SPACINGS.small,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACINGS.base,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: SPACINGS.smallest,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: SPACINGS.base,
    paddingHorizontal: SPACINGS.large,
  },
  signOutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: SPACINGS.small,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: SPACINGS.base,
    paddingHorizontal: SPACINGS.large,
    marginTop: SPACINGS.base,
  },
  messageButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: SPACINGS.small,
  },
  versionContainer: {
    alignItems: "center",
    padding: SPACINGS.large,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray,
  },
});
