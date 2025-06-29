import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import { COLORS } from "../../styles";
import AvatarPlaceholder from "../../../assets/icons/Avatar_Placeholder.png";

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  my: boolean;
}

interface MessageBubbleProps {
  message: Message;
  screenWidth: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, screenWidth }) => {
  const styles = getMessageStyles(screenWidth);

  return (
    <View style={[styles.messageContainer, message.my ? styles.sentContainer : styles.receivedContainer]}>
      {!message.my && <Image source={AvatarPlaceholder} style={styles.avatar} />}

      <View style={[styles.messageBubble, message.my ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.messageText, message.my ? styles.sentText : styles.receivedText]}>{message.text}</Text>
        <Text style={[styles.timestamp, message.my ? styles.sentTimestamp : styles.receivedTimestamp]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
};

function getMessageStyles(screenWidth: number) {
  return StyleSheet.create({
    messageContainer: {
      flexDirection: "row",
      marginVertical: 4,
      alignItems: "flex-end",
    },
    sentContainer: {
      justifyContent: "flex-end",
    },
    receivedContainer: {
      justifyContent: "flex-start",
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    messageBubble: {
      maxWidth: screenWidth * 0.7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    sentBubble: {
      backgroundColor: COLORS.purple,
      borderBottomRightRadius: 4,
    },
    receivedBubble: {
      backgroundColor: COLORS.white,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: "#E5E5EA",
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
    },
    sentText: {
      color: COLORS.white,
    },
    receivedText: {
      color: COLORS.black,
    },
    timestamp: {
      fontSize: 12,
      marginTop: 4,
    },
    sentTimestamp: {
      color: "rgba(255, 255, 255, 0.7)",
      textAlign: "right",
    },
    receivedTimestamp: {
      color: COLORS.gray,
    },
  });
}

export default MessageBubble;
