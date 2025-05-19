import { Image, ImageStyle, Platform, StyleProp } from "react-native";
import styles from "./styles";
import defaultAvatar from "../../../assets/icons/Avatar_Placeholder.jpg";

export type AvatarProps = {
  avatar?: any; // <- now accepts both require() and string URL
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  useUri?: boolean;
};

export default function Avatar({
  avatar = null,
  width = 20,
  height = 20,
  style = null,
  useUri = true,
}: AvatarProps) {
  let uri = avatar || "";
  if (Platform.OS === "android" && uri) {
    uri += "?time=" + new Date().getTime();
  }

  const avatarSource =
    typeof avatar === "string"
      ? { uri: avatar, cache: "reload" as const }
      : avatar || defaultAvatar;

  return (
    <Image
      style={[styles.avatar, { width, height }, style]}
      source={avatarSource}
      resizeMode="cover"
    />
  );
}
