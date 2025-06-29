import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

import { COLORS } from "../../styles";
import UserItem, { ChatUser } from "../../components/cards/UserItem";
import {
  StudentTabsParamList,
  TeacherTabsParamList,
  StudentStackParamList,
  TeacherStackParamList,
} from "../../types/navigation";
import { AuthContext } from "../../hooks/AuthContext";
import { api } from "../../services/api";
import { websocketService, SocketMessage } from "../../services/websocket";
import { LoadingState, EmptyState, SectionHeader } from "../../components/common";

type Props = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList | TeacherTabsParamList, "Messages">,
  StackScreenProps<StudentStackParamList | TeacherStackParamList>
>;

export default function Messages({ navigation }: Props) {
  const { user: currentUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles();

  const fetchUsersWithConversations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [allUsersData, conversations] = await Promise.all([
        api.getAllUsers(),
        api.getConversationsForUser(currentUser.id),
      ]);

      const conversationMap = new Map(conversations.map((conv) => [conv.other_user_id, conv]));

      const conversationUsers = allUsersData
        .filter((user) => user.id !== currentUser?.id)
        .filter((user) => conversationMap.has(user.id))
        .map((user) => {
          const conversation = conversationMap.get(user.id)!;

          return {
            id: user.id.toString(),
            name: `${user.first_name} ${user.last_name}`,
            lastMessage: conversation.last_message,
            timestamp: formatTimestamp(conversation.last_message_time),
            unreadCount: conversation.unread_count,
          };
        });

      const allOtherUsers = allUsersData
        .filter((user) => user.id !== currentUser?.id)
        .map((user) => ({
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          lastMessage: "Start a conversation!",
          timestamp: "Now",
          unreadCount: 0,
        }));

      setUsers(conversationUsers);
      setAllUsers(allOtherUsers);
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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        conversations: users,
        newUsers: [],
      };
    }

    const query = searchQuery.toLowerCase();

    const filteredConversations = users.filter(
      (user) => user.name.toLowerCase().includes(query) || user.lastMessage.toLowerCase().includes(query)
    );

    const conversationUserIds = new Set(users.map((user) => user.id));
    const filteredNewUsers = allUsers
      .filter((user) => !conversationUserIds.has(user.id))
      .filter((user) => user.name.toLowerCase().includes(query));

    return {
      conversations: filteredConversations,
      newUsers: filteredNewUsers,
    };
  }, [searchQuery, users, allUsers]);

  const handleUserPress = (user: ChatUser) => {
    navigation.navigate("Chat", { id: user.id });
  };

  const renderSearchResults = () => {
    const { conversations, newUsers } = searchResults;
    const sections = [];

    if (conversations.length > 0) {
      sections.push({
        title: "Your Conversations",
        data: conversations,
      });
    }

    if (newUsers.length > 0) {
      sections.push({
        title: "Find New Users",
        data: newUsers,
      });
    }

    if (sections.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="No Results"
          subtitle={searchQuery ? `No users found matching "${searchQuery}"` : "Start chatting with other users!"}
        />
      );
    }

    return (
      <SectionList
        sections={sections}
        renderItem={({ item }) => <UserItem user={item} onPress={handleUserPress} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    );
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
        <LoadingState text="Loading conversations..." />
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

      <View style={styles.messagesHeader}>
        <View style={styles.messagesIcon}>
          <Ionicons name="chatbubbles" size={32} color={COLORS.purple} />
        </View>
        <View style={styles.messagesInfo}>
          <SectionHeader
            title="Your Messages"
            subtitle={
              searchQuery
                ? `${searchResults.conversations.length + searchResults.newUsers.length} results`
                : `${users.length} ${users.length === 1 ? "conversation" : "conversations"}`
            }
          />
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations or find new users..."
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

      <View style={styles.conversationsSection}>{renderSearchResults()}</View>
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
    sectionSeparator: {
      height: 16,
      backgroundColor: COLORS.white,
    },
    sectionHeaderContainer: {
      backgroundColor: COLORS.white,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    sectionHeaderText: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
    },
  });
}
