import React, { useState, useMemo, useEffect, useContext } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../../styles";
import UserItem, { ChatUser } from "../../components/UserItem";
import {
  StudentTabsParamList,
  TeacherTabsParamList,
  StudentStackParamList,
  TeacherStackParamList,
} from "../../types/navigation";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService } from "../../services/api";
import { websocketService, SocketMessage } from "../../services/websocket";

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList | TeacherTabsParamList, "Messages">,
  StackScreenProps<StudentStackParamList | TeacherStackParamList>
>;

export default function Messages({ navigation }: Props) {
  const { user: currentUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = getStyles();

  const fetchUsersWithConversations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [allUsers, conversations] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getConversationsForUser(currentUser.id),
      ]);

      const conversationMap = new Map(conversations.map((conv) => [conv.other_user_id, conv]));

      const otherUsers = allUsers
        .filter((user) => user.id !== currentUser?.id)
        .map((user) => {
          const conversation = conversationMap.get(user.id);

          return {
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name}`,
            lastMessage: conversation ? conversation.last_message : "Start a conversation!",
            timestamp: conversation ? formatTimestamp(conversation.last_message_time) : "Now",
            unreadCount: 2, // implement this soon
          };
        });

      setUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users and conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithConversations();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const handleNewMessage = (socketMessage: SocketMessage) => {
      if (socketMessage.sender_id === currentUser.id || socketMessage.receiver_id === currentUser.id) {
        fetchUsersWithConversations();
      }
    };

    websocketService.onNewMessage(handleNewMessage);
    websocketService.onMessageSent(handleNewMessage);

    return () => {
      websocketService.removeAllListeners();
    };
  }, [currentUser]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        fetchUsersWithConversations();
      }
    }, [currentUser])
  );

  const formatTimestamp = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // now, minutes, hours, yesterday, days, month and day
    if (diffInMinutes < 1) {
      return "Now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "long" });
    } else {
      return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const handleUserPress = (user: ChatUser) => {
    navigation.navigate("Chat", { id: user.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.connectionStatus}>
          <View
            style={[styles.statusDot, { backgroundColor: websocketService.isConnected() ? COLORS.green : COLORS.gray }]}
          />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => <UserItem user={item} onPress={handleUserPress} />}
        keyExtractor={(item) => item.id}
        style={styles.userList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold" as const,
      color: COLORS.black,
    },
    connectionStatus: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.lightGray,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: COLORS.black,
    },
    userList: {
      flex: 1,
    },
    separator: {
      height: 1,
      backgroundColor: "#E5E5EA",
      marginLeft: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: COLORS.gray,
    },
  });
}
