import React, { useState, useMemo } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import UserItem, { ChatUser } from "../../components/UserItem";
import { MessagesStackParamList } from "../../types";

type Props = StackScreenProps<MessagesStackParamList, "Messages">;

const dummyUsers = [
  {
    id: "1",
    name: "Emma Thompson",
    lastMessage: "Hey! How are you doing today?",
    timestamp: "2:45 PM",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "James Wilson",
    lastMessage: "Thanks for the lesson!",
    timestamp: "1:30 PM",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Sarah Davis",
    lastMessage: "Can we schedule for tomorrow?",
    timestamp: "12:15 PM",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Michael Brown",
    lastMessage: "Great explanation on the math problem",
    timestamp: "11:30 AM",
    unreadCount: 0,
  },
  {
    id: "5",
    name: "Lisa Rodriguez",
    lastMessage: "See you in the next session!",
    timestamp: "Yesterday",
    unreadCount: 3,
  },
  {
    id: "6",
    name: "David Chen",
    lastMessage: "Could you share those resources?",
    timestamp: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "7",
    name: "Anna Martinez",
    lastMessage: "Perfect! I understand now",
    timestamp: "Monday",
    unreadCount: 0,
  },
  {
    id: "8",
    name: "Robert Johnson",
    lastMessage: "Thanks for your patience",
    timestamp: "Monday",
    unreadCount: 1,
  },
];

export default function Messages({ navigation }: Props) {
  const { screenWidth } = useScreenDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const styles = getStyles(screenWidth);

  const filteredUsers = useMemo(() => {
    return dummyUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleUserPress = (user: ChatUser) => {
    navigation.navigate("Chat", { userId: user.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
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

function getStyles(screenWidth: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.lightGray,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5EA",
    },
    headerTitle: {
      fontSize: screenWidth > 400 ? 32 : 28,
      fontWeight: "bold" as const,
      color: COLORS.black,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: COLORS.white,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.lightGray,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: screenWidth > 400 ? 10 : 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: screenWidth > 400 ? 16 : 14,
      color: COLORS.black,
    },
    userList: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    separator: {
      height: 1,
      backgroundColor: "#E5E5EA",
      marginLeft: screenWidth > 400 ? 82 : 77,
    },
  });
}
