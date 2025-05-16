// src/components/ImagePickerAvatar.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  initialUri?: string;
  onChange?: (uri: string) => void;
  size?: number;
}

const ImagePickerAvatar: React.FC<Props> = ({ initialUri, onChange, size = 140 }) => {
  const [imageUri, setImageUri] = useState(initialUri || '');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onChange?.(uri);
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={imageUri ? { uri: imageUri } : require('../../assets/icons/Avatar_Placeholder.jpg')}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        />
        <View style={styles.editIcon}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.label}>Tap to change avatar</Text>
    </View>
  );
};

export default ImagePickerAvatar;

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#6a1b9a',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6a1b9a',
    borderRadius: 12,
    padding: 4,
  },
  label: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
});
