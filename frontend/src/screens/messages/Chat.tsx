import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import { MessagesStackParamList } from "../../types";
import { MessageBubble, Message } from "../../components/MessageBubble";
import AvatarPlaceholder from "../../../assets/icons/Avatar_Placeholder.png";

type Props = StackScreenProps<MessagesStackParamList, "Chat">;

const dummyMessages: Message[] = [
  {
    id: "1",
    text: "Hey! How are you doing today?",
    timestamp: "2:45 PM",
    my: false,
  },
  {
    id: "2",
    text: "I'm doing great, thanks for asking! How about you?",
    timestamp: "2:46 PM",
    my: true,
  },
  {
    id: "3",
    text: "I'm good too! Are we still on for our lesson tomorrow?",
    timestamp: "2:47 PM",
    my: false,
  },
  {
    id: "4",
    text: "Absolutely! Same time as usual?",
    timestamp: "2:48 PM",
    my: true,
  },
  {
    id: "5",
    text: "Perfect! See you at 3 PM then 😊",
    timestamp: "2:49 PM",
    my: false,
  },
  {
    id: "6",
    text: "Thanks for the lesson!",
    timestamp: "1:30 PM",
    my: false,
  },
  {
    id: "7",
    text: "You're welcome! You did really well today.",
    timestamp: "1:31 PM",
    my: true,
  },
  {
    id: "8",
    text: "I finally understand calculus now 🎉",
    timestamp: "1:32 PM",
    my: false,
  },
  {
    id: "9",
    text: "That's awesome! Keep practicing and you'll master it.",
    timestamp: "1:33 PM",
    my: true,
  },
  {
    id: "10",
    text: "Can we schedule for tomorrow?",
    timestamp: "12:15 PM",
    my: false,
  },
  {
    id: "11",
    text: "Sure! What time works for you?",
    timestamp: "12:16 PM",
    my: true,
  },
  {
    id: "12",
    text: "How about 4 PM?",
    timestamp: "12:17 PM",
    my: false,
  },
  {
    id: "13",
    text: "4 PM works perfectly! I'll send you the meeting link.",
    timestamp: "12:18 PM",
    my: true,
  },
];

export default function Chat({ route, navigation }: Props) {
  const { userId } = route.params;
  const { screenWidth } = useScreenDimensions();
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const styles = getStyles();

  const currentUser = { id: userId, name: "Emma Thompson" };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessages([
        ...messages,
        { id: Date.now().toString(), text: messageText, timestamp: new Date().toLocaleTimeString(), my: true },
      ]);
      setMessageText("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Image source={AvatarPlaceholder} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{currentUser?.name || "Unknown User"}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} screenWidth={screenWidth} />}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            placeholderTextColor={COLORS.gray}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Ionicons name="send" size={20} color={messageText.trim() ? COLORS.white : COLORS.gray} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5EA",
    },
    backButton: {
      marginRight: 12,
    },
    headerInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    headerName: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: COLORS.black,
    },
    headerStatus: {
      fontSize: 12,
      color: COLORS.green,
    },
    moreButton: {
      padding: 4,
    },
    messagesList: {
      flex: 1,
      backgroundColor: COLORS.lightGray,
    },
    messagesContent: {
      padding: 16,
    },
    inputContainer: {
      backgroundColor: COLORS.white,
      borderTopWidth: 1,
      borderTopColor: "#E5E5EA",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#E5E5EA",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      maxHeight: 100,
      fontSize: 16,
      color: COLORS.black,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    sendButtonActive: {
      backgroundColor: COLORS.purple,
    },
    sendButtonInactive: {
      backgroundColor: "#E5E5EA",
    },
  });
}
