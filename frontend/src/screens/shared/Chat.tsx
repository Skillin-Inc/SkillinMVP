import React, { useState, useRef, useEffect, useContext } from "react";
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
import { StudentStackParamList, TeacherStackParamList, AdminStackParamList } from "../../types/navigation";
import { MessageBubble, Message } from "../../components/MessageBubble";
import AvatarPlaceholder from "../../../assets/icons/Avatar_Placeholder.png";
import { AuthContext } from "../../hooks/AuthContext";
import { apiService, BackendMessage, BackendUser } from "../../services/api";
import { websocketService, SocketMessage } from "../../services/websocket";

// Dynamic type that works with both StudentStack and TeacherStack
type Props = StackScreenProps<StudentStackParamList | TeacherStackParamList | AdminStackParamList, "Chat">;

export default function Chat({ route, navigation }: Props) {
  const { id } = route.params;
  const { user: currentUser } = useContext(AuthContext);
  const { screenWidth } = useScreenDimensions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [otherUser, setOtherUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const styles = getStyles();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        const userInfo = await apiService.getUserById(Number(id));
        setOtherUser(userInfo);

        const backendMessages = await apiService.getMessagesBetweenUsers(currentUser.id, Number(id));

        const formattedMessages: Message[] = backendMessages.map((msg: BackendMessage) => ({
          id: msg.id.toString(),
          text: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          my: msg.sender_id === currentUser.id,
        }));

        setMessages(formattedMessages);

        // Mark messages as read when user opens chat
        await apiService.markMessagesAsRead(currentUser.id, Number(id));
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, id]);

  useEffect(() => {
    if (!currentUser) return;

    websocketService.connect();
    websocketService.registerUser(currentUser.id);

    const handleNewMessage = (socketMessage: SocketMessage) => {
      if (
        (socketMessage.sender_id === Number(id) && socketMessage.receiver_id === currentUser.id) ||
        (socketMessage.sender_id === currentUser.id && socketMessage.receiver_id === Number(id))
      ) {
        const newMessage: Message = {
          id: socketMessage.id.toString(),
          text: socketMessage.content,
          timestamp: new Date(socketMessage.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          my: socketMessage.sender_id === currentUser.id,
        };

        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg.id === newMessage.id);
          if (messageExists) return prevMessages;

          return [...prevMessages, newMessage];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    const handleMessageSent = (socketMessage: SocketMessage) => {
      const newMessage: Message = {
        id: socketMessage.id.toString(),
        text: socketMessage.content,
        timestamp: new Date(socketMessage.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        my: true,
      };

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg.id === newMessage.id);
        if (messageExists) return prevMessages;

        return [...prevMessages, newMessage];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleMessageError = (error: { error: string }) => {
      console.error("Message error:", error);
      // add alert here
    };

    websocketService.onNewMessage(handleNewMessage);
    websocketService.onMessageSent(handleMessageSent);
    websocketService.onMessageError(handleMessageError);

    return () => {
      websocketService.removeAllListeners();
    };
  }, [currentUser, id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    const messageContent = messageText.trim();
    setMessageText("");

    if (websocketService.isConnected()) {
      websocketService.sendMessage(currentUser.id, Number(id), messageContent);
    } else {
      // fallback to http if ws doesnt work
      try {
        const newBackendMessage = await apiService.createMessage({
          sender_id: currentUser.id,
          receiver_id: Number(id),
          content: messageContent,
        });

        const newMessage: Message = {
          id: newBackendMessage.id.toString(),
          text: newBackendMessage.content,
          timestamp: new Date(newBackendMessage.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          my: true,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessageText(messageContent);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerName}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Image source={AvatarPlaceholder} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>
              {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Unknown User"}
            </Text>
            <Text style={styles.headerStatus}>{websocketService.isConnected() ? "Online" : "Offline"}</Text>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: COLORS.gray,
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
