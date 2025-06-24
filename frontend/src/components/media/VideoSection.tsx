import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

interface VideoSectionProps {
  title?: string;
  onPlayPress?: () => void;
  hasVideo?: boolean;
  videoUrl?: string;
  aspectRatio?: number;
  backgroundColor?: string;
  showControls?: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  title = "Video Preview",
  onPlayPress,
  hasVideo = false,
  aspectRatio = 16 / 9,
  backgroundColor = COLORS.black,
  showControls = false,
}) => {
  return (
    <View style={[styles.videoSection, { aspectRatio, backgroundColor }]}>
      <View style={styles.videoPlaceholder}>
        <Ionicons name="play-circle" size={hasVideo ? 80 : 64} color={hasVideo ? COLORS.white : COLORS.purple} />
        <Text style={[styles.videoPlaceholderText, { color: hasVideo ? COLORS.white : COLORS.purple }]}>{title}</Text>
        {onPlayPress && (
          <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
            <Ionicons name="play" size={20} color={COLORS.white} />
            <Text style={styles.playButtonText}>{hasVideo ? "Play Video" : "Play Lesson"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {showControls && (
        <View style={styles.videoControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="download-outline" size={20} color={COLORS.gray} />
            <Text style={styles.controlButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="settings-outline" size={20} color={COLORS.gray} />
            <Text style={styles.controlButtonText}>Quality</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="expand-outline" size={20} color={COLORS.gray} />
            <Text style={styles.controlButtonText}>Fullscreen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoSection: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  videoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholderText: {
    fontSize: 18,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  playButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  playButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  videoControls: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    paddingVertical: 8,
  },
  controlButton: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  controlButtonText: {
    color: COLORS.white,
    fontSize: 10,
    marginTop: 2,
  },
});

export default VideoSection;
