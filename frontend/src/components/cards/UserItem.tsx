import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import AvatarPlaceholder from "../../../assets/icons/Avatar_Placeholder.png";

export interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface UserItemProps {
  user: ChatUser;
  onPress: (user: ChatUser) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onPress }) => {
  const { screenWidth } = useScreenDimensions();
  const styles = getItemStyles(screenWidth);

  return (
    <TouchableOpacity style={styles.userItem} onPress={() => onPress(user)}>
      <View style={styles.avatarContainer}>
        <Image source={AvatarPlaceholder} style={styles.avatar} />
        {user.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{user.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.timestamp}>{user.timestamp}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {user.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );
};

export default UserItem;

function getItemStyles(screenWidth: number) {
  return StyleSheet.create({
    userItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: screenWidth > 400 ? 12 : 10,
      backgroundColor: COLORS.white,
    },
    avatarContainer: {
      position: "relative",
      marginRight: 12,
    },
    avatar: {
      width: screenWidth > 400 ? 50 : 45,
      height: screenWidth > 400 ? 50 : 45,
      borderRadius: screenWidth > 400 ? 25 : 22.5,
    },
    unreadBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      backgroundColor: COLORS.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: COLORS.white,
    },
    unreadText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "bold" as const,
    },
    userInfo: {
      flex: 1,
    },
    userHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    userName: {
      fontSize: screenWidth > 400 ? 16 : 15,
      fontWeight: "600" as const,
      color: COLORS.black,
    },
    timestamp: {
      fontSize: screenWidth > 400 ? 14 : 13,
      color: COLORS.gray,
    },
    lastMessage: {
      fontSize: screenWidth > 400 ? 14 : 13,
      color: COLORS.gray,
      lineHeight: 18,
    },
  });
}
