import { Image, ImageStyle, Platform, StyleProp, ImageSourcePropType } from "react-native";
import styles from "./styles";
import defaultAvatar from "../../../assets/icons/Avatar_Placeholder.jpg";

export type AvatarProps = {
  avatar?: string | ImageSourcePropType | null; // <- now accepts both require() and string URL and null
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export default function Avatar({ avatar = null, width = 20, height = 20, style = null }: AvatarProps) {
  let uri = avatar || "";
  if (Platform.OS === "android" && typeof avatar === "string") {
    uri += "?time=" + new Date().getTime();
  }

  const avatarSource = typeof avatar === "string" ? { uri, cache: "reload" as const } : avatar || defaultAvatar;

  return <Image style={[styles.avatar, { width, height }, style]} source={avatarSource} resizeMode="cover" />;
}
