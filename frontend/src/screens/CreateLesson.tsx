import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../styles";
import { AuthContext } from "../hooks/AuthContext";
import { apiService, NewLesson } from "../services/api";

export default function CreateLesson() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  const styles = getStyles();

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      description: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!user || !user.isTeacher) {
      Alert.alert("Error", "Only teachers can create lessons");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const lessonData: NewLesson = {
        teacher_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: "", // Empty for now, will be added via file upload later
      };

      await apiService.createLesson(lessonData);

      Alert.alert("Success", "Lesson created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setFormData({
              title: "",
              description: "",
            });
            setErrors({
              title: "",
              description: "",
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating lesson:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  if (!user || !user.isTeacher) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only teachers can create lessons.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="book-outline" size={32} color={COLORS.purple} />
          <Text style={styles.headerTitle}>Create New Lesson</Text>
          <Text style={styles.headerSubtitle}>Create lesson content (video upload coming soon)</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lesson Title *</Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="Enter lesson title..."
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              maxLength={100}
              placeholderTextColor={COLORS.gray}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description ? styles.inputError : null]}
              placeholder="Describe what students will learn in this lesson..."
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholderTextColor={COLORS.gray}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            <Text style={styles.characterCount}>{formData.description.length}/500 characters</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Create Lesson</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
      backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 12,
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 16,
      color: COLORS.gray,
      marginTop: 8,
      textAlign: "center",
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: "#E5E5EA",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: COLORS.black,
      backgroundColor: COLORS.white,
    },
    textArea: {
      borderWidth: 1,
      borderColor: "#E5E5EA",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: COLORS.black,
      backgroundColor: COLORS.white,
      minHeight: 100,
      textAlignVertical: "top",
    },
    inputError: {
      borderColor: COLORS.error,
    },
    errorText: {
      color: COLORS.error,
      fontSize: 14,
      marginTop: 4,
    },
    characterCount: {
      fontSize: 12,
      color: COLORS.gray,
      textAlign: "right",
      marginTop: 4,
    },
    helperText: {
      fontSize: 12,
      color: COLORS.gray,
      marginTop: 4,
    },
    submitButton: {
      backgroundColor: COLORS.purple,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    submitButtonDisabled: {
      backgroundColor: COLORS.gray,
    },
    submitButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
      marginTop: 16,
      marginBottom: 8,
    },
  });
}
