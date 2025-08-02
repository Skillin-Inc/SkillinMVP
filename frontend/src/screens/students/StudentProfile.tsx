// File: src/screens/students/StudentProfile.tsx

import React, { useContext, useState, useEffect } from "react";
import {
  Linking,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

import { AuthContext } from "../../hooks/AuthContext";
import { SectionHeader } from "../../components/common";
import { ImagePickerAvatar } from "../../components/forms";
import { QuickActionCard } from "../../components/cards";
import { COLORS, SPACINGS } from "../../styles";
import { StudentTabsParamList, StudentStackParamList } from "../../types/navigation";
import { User, api, transformBackendUserToUser } from "../../services/api";

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList, "StudentProfile">,
  StackScreenProps<StudentStackParamList>
>;


export default function StudentProfile({ navigation, route }: Props) {
  const { user: currentUser, isPaid, checkPaidStatus, freeMode,setFreeMode, logout} = useContext(AuthContext);
  const userId = route.params?.userId ?? currentUser?.id ?? "";
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  

  const isOwnProfile = currentUser?.id === userId;
  const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;


  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      if (isOwnProfile && currentUser) {
        setProfileUser(currentUser);
      } else {
        const backendUser = await api.getUserById(userId);
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

  const getMembershipBadgeColor = (tier: string | undefined) => {
    switch (tier?.toLowerCase()) {
      case "gold":
        return "#FFD700";
      case "silver":
        return "#C0C0C0";
      case "bronze":
        return "#CD7F32";
      default:
        return COLORS.green;
    }
  };


 const handleSubscriptionPress = async () => {
  if (!currentUser?.id || !currentUser?.email) {
    Alert.alert("Error", "Missing user info");
    return;
  }

  try {
    //  re check up to date payment status from DB
    const paidRes = await fetch(`${BACKEND_URL}/api/check-paid-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    const paidData = await paidRes.json();
    const latestIsPaid = paidData.isPaid;
    const latestFreeMode = paidData.is_free;

    //   if there is setPaid / setFreeMode in context, update them
    if (typeof setFreeMode === "function") setFreeMode(latestFreeMode);
    if (typeof checkPaidStatus === "function") checkPaidStatus(currentUser.id); 

    console.log("💡 latestFreeMode:", latestFreeMode);
    console.log("💡 latestIsPaid:", latestIsPaid);

    //   redirect based on newest status
    if (latestFreeMode && !latestIsPaid) {
      // free user → redirect to checkout page
      const res = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
        }),
      });

      const data = await res.json();
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        Alert.alert("Error", "Failed to create checkout session.");
      }
    } else {
      // paid user → open billing portal
      const res = await fetch(`${BACKEND_URL}/api/create-billing-portal-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        Alert.alert("Error", "Failed to open billing portal.");
      }
    }
  } catch (error) {
    console.error("Subscription error:", error);
    Alert.alert("Error", "Something went wrong.");
  }
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
            {isOwnProfile ? "My Profile" : `${profileUser?.firstName} ${profileUser?.lastName}'s Profile`}
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
            <Text style={styles.userName}>{profileUser?.username ?? "Unknown User"}</Text>
            <Text style={styles.userEmail}>{profileUser?.email ?? ""}</Text>

            <View
              style={[
                styles.membershipBadge,

                { backgroundColor: getMembershipBadgeColor(profileUser?.membershipTier) },
              ]}
            >
              <Ionicons name="star" size={14} color={COLORS.white} />
              <Text style={styles.membershipText}>{profileUser?.membershipTier ?? "Bronze"} Member</Text>
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
          <SectionHeader title="Personal Information" />


          <InfoCard
            icon="calendar-outline"
            label="Date of Birth"
            value={profileUser?.date_of_birth ?? "Not provided"}
          />

<InfoCard icon="call-outline" label="Phone Number" value={profileUser?.phoneNumber ?? "Not provided"} />
</View>

{isOwnProfile && (
  <View style={styles.section}>
    <SectionHeader title="Account Actions" />


            <View style={styles.quickActions}>
              <QuickActionCard
                icon="create-outline"
                title="Edit Profile"
                subtitle="Update your personal information"
                onPress={handleEditProfile}
              />

              <QuickActionCard
                icon="bookmark-outline"
                title="Saved Courses"
                subtitle="View your bookmarked content"
                onPress={() => Alert.alert("Saved Courses", "Feature coming soon!")}
              />
            </View>

            <View style={styles.quickActions}>
              <QuickActionCard
                icon="stats-chart-outline"
                title="Learning Progress"
                subtitle="Track your achievements"
                onPress={() => Alert.alert("Progress", "Feature coming soon!")}
              />

      <QuickActionCard
        icon="help-circle-outline"
        title="Help & Support"
        subtitle="Get assistance and FAQ"
        onPress={handleSupport}
      />

      <QuickActionCard
        icon="wallet-outline"
        title="Subscription"
        subtitle="Handle your payments"
        onPress={handleSubscriptionPress}
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
          <Text style={styles.versionText}>Skillin v1.0.0</Text>
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
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACINGS.smallest + 2,
    paddingHorizontal: SPACINGS.small + 4,
    borderRadius: 20,
  },
  membershipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: SPACINGS.smallest,
    textTransform: "capitalize",
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
