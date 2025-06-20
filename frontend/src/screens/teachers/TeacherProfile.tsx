import React, { useContext, useState } from "react";
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

import { AuthContext } from "../../hooks/AuthContext";
import ImagePickerAvatar from "../../components/ImagePickerAvatar";
import { COLORS, SPACINGS } from "../../styles";
import { TeacherTabsParamList } from "../../types/navigation";

type Props = BottomTabScreenProps<TeacherTabsParamList, "TeacherProfile">;

export default function TeacherProfile({ navigation }: Props) {
  const { logout, user } = useContext(AuthContext);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

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
    // TODO: Refresh teacher data and stats
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing will be available soon!");
  };

  const handleSettings = () => {
    Alert.alert("Settings", "Settings page will be available soon!");
  };

  const handleSupport = () => {
    Alert.alert("Support", "Support center will be available soon!");
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

  const StatsCard = ({
    icon,
    label,
    value,
    onPress,
    color = COLORS.purple,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress?: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.statsCard} onPress={onPress} disabled={!onPress}>
      <View style={[styles.statsIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={COLORS.white} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const ActionCard = ({
    icon,
    title,
    subtitle,
    onPress,
    color = COLORS.purple,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={COLORS.white} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const getTeacherBadgeColor = () => {
    // You can customize this based on teacher level/experience
    return COLORS.blue;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Teacher Profile</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <ImagePickerAvatar initialUri={avatarUri} onChange={setAvatarUri} size={100} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username ?? "Unknown Teacher"}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ""}</Text>

            <View style={[styles.teacherBadge, { backgroundColor: getTeacherBadgeColor() }]}>
              <Ionicons name="school" size={14} color={COLORS.white} />
              <Text style={styles.teacherText}>Certified Teacher</Text>
            </View>
          </View>
        </View>

        {/* Teaching Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Statistics</Text>

          <View style={styles.statsGrid}>
            <StatsCard icon="book-outline" label="Courses" value="0" onPress={handleViewStats} color={COLORS.purple} />

            <StatsCard
              icon="people-outline"
              label="Students"
              value="0"
              onPress={handleViewStats}
              color={COLORS.green}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard icon="star-outline" label="Rating" value="--" onPress={handleViewStats} color={COLORS.blue} />

            <StatsCard icon="cash-outline" label="Earnings" value="$0" onPress={handleViewStats} color="#FFD700" />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <InfoCard icon="calendar-outline" label="Date of Birth" value={user?.dOB ?? "Not provided"} />

          <InfoCard icon="location-outline" label="Location" value={user?.postalCode?.toString() ?? "Not provided"} />

          <InfoCard icon="call-outline" label="Phone Number" value={user?.phoneNumber ?? "Not provided"} />
        </View>

        {/* Teacher Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teacher Actions</Text>

          <ActionCard
            icon="create-outline"
            title="Edit Profile"
            subtitle="Update your profile information"
            onPress={handleEditProfile}
          />

          <ActionCard
            icon="add-circle-outline"
            title="Create Course"
            subtitle="Design a new course"
            onPress={() => navigation.navigate("TeacherCreateLesson")}
            color={COLORS.green}
          />

          <ActionCard
            icon="library-outline"
            title="My Courses"
            subtitle="Manage your courses"
            onPress={() => Alert.alert("My Courses", "Feature coming soon!")}
          />

          <ActionCard
            icon="stats-chart-outline"
            title="Analytics"
            subtitle="View detailed statistics"
            onPress={handleViewStats}
            color={COLORS.blue}
          />

          <ActionCard
            icon="card-outline"
            title="Payouts"
            subtitle="Manage earnings and payments"
            onPress={() => Alert.alert("Payouts", "Feature coming soon!")}
            color="#FFD700"
          />

          <ActionCard
            icon="help-circle-outline"
            title="Teacher Support"
            subtitle="Get help with teaching"
            onPress={handleSupport}
          />
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
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
  versionContainer: {
    alignItems: "center",
    padding: SPACINGS.large,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray,
  },
});
