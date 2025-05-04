import React from 'react';
import { Image, ImageStyle, Platform, StyleProp } from 'react-native';
import styles from './styles';

export type AvatarProps = {
  avatar?: any; // <- now accepts both require() and string URL
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  useUri?: boolean;
};


const Avatar: React.FC<AvatarProps> = ({
  avatar = null,
  width = 20,
  height = 20,
  style = null,
  useUri = true,
}) => {
  const defaultAvatar = require('../../../assets/icons/Avatar_Placeholder.jpg');

  let uri = avatar || '';
  if (Platform.OS === 'android' && uri) {
    uri += '?time=' + new Date().getTime();
  }

  const avatarSource = typeof avatar === 'string'
  ? { uri: avatar, cache: 'reload' as const }
  : avatar || defaultAvatar;

  return (
<Image
  style={[styles.avatar, { width, height }, style]}
  source={avatarSource}
  resizeMode="cover"
/>
  );
};

export default Avatar;
