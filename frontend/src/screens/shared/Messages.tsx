import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
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
  const [refreshing, setRefreshing] = useState(false);

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
            unreadCount: conversation ? conversation.unread_count : 0,
          };
        });

      setUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users and conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsersWithConversations();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsersWithConversations();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const handleNewMessage = (socketMessage: SocketMessage) => {
      if (socketMessage.sender_id === currentUser.id || socketMessage.receiver_id === currentUser.id) {
        // Refresh conversations to update unread counts and last message
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
        <View style={styles.headerContainer}>
          <View style={styles.headerSpacer} />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Messages</Text>
          </View>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: websocketService.isConnected() ? COLORS.green : COLORS.gray },
              ]}
            />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Messages</Text>
        </View>
        <View style={styles.connectionStatus}>
          <View
            style={[styles.statusDot, { backgroundColor: websocketService.isConnected() ? COLORS.green : COLORS.gray }]}
          />
        </View>
      </View>

      {/* Messages Header Info */}
      <View style={styles.messagesHeader}>
        <View style={styles.messagesIcon}>
          <Ionicons name="chatbubbles" size={32} color={COLORS.purple} />
        </View>
        <View style={styles.messagesInfo}>
          <Text style={styles.messagesTitle}>Your Conversations</Text>
          <Text style={styles.messagesSubtitle}>
            {filteredUsers.length} {filteredUsers.length === 1 ? "conversation" : "conversations"}
          </Text>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
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

      {/* Conversations List */}
      <View style={styles.conversationsSection}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "No conversations match your search." : "Start chatting with other users!"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={({ item }) => <UserItem user={item} onPress={handleUserPress} />}
            keyExtractor={(item) => item.id}
            style={styles.conversationsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
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
    connectionStatus: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
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
    messagesHeader: {
      flexDirection: "row",
      padding: 20,
      backgroundColor: COLORS.lightGray,
    },
    messagesIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.white,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    messagesInfo: {
      flex: 1,
      justifyContent: "center",
    },
    messagesTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginBottom: 4,
    },
    messagesSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
    },
    searchSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: COLORS.black,
    },
    conversationsSection: {
      flex: 1,
    },
    conversationsList: {
      flex: 1,
    },
    separator: {
      height: 1,
      backgroundColor: COLORS.lightGray,
      marginLeft: 20,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
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
  });
}
