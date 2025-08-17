import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../styles";
import { api, BackendUser } from "../../services/api/";
import { LoadingState, SectionHeader } from "../../components/common";

interface EditUserModalProps {
  visible: boolean;
  user: BackendUser | null;
  onClose: () => void;
  onUpdate: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ visible, user, onClose, onUpdate }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const styles = getStyles();

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setUserType(user.user_type);
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await api.updateUserType(user.id, userType);
      Alert.alert("Success", "User updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit User</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={firstName} editable={false} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={lastName} editable={false} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>User Type</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => setShowUserTypeModal(true)}>
              <Text style={styles.selectorText}>{userType}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color={COLORS.white} />
                <Text style={styles.updateButtonText}>Update User</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={showUserTypeModal} transparent animationType="fade">
          <View style={styles.typeModalOverlay}>
            <View style={styles.typeModalContent}>
              <Text style={styles.typeModalTitle}>Select User Type</Text>
              {["student", "teacher", "admin"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.typeOption}
                  onPress={() => {
                    setUserType(type as typeof userType);
                    setShowUserTypeModal(false);
                  }}
                >
                  <Text style={styles.typeOptionText}>{type}</Text>
                  {userType === type && <Ionicons name="checkmark" size={20} color={COLORS.purple} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.typeCancelButton} onPress={() => setShowUserTypeModal(false)}>
                <Text style={styles.typeCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = getStyles();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await api.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (user: BackendUser) => {
    Alert.alert("Delete User", `Are you sure you want to delete ${user.first_name} ${user.last_name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteUser(user.id);
            Alert.alert("Success", "User deleted successfully");
            fetchUsers();
          } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", "Failed to delete user");
          }
        },
      },
    ]);
  };

  const handleEditUser = (user: BackendUser) => {
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.user_type.toLowerCase().includes(searchLower)
    );
  });

  const renderUserItem = ({ item }: { item: BackendUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.userTypeBadge, getUserTypeColor(item.user_type)]}>
            <Text style={styles.userTypeText}>{item.user_type}</Text>
          </View>
          <Text style={styles.userDate}>Joined {new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditUser(item)}>
          <Ionicons name="pencil" size={18} color={COLORS.purple} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item)}>
          <Ionicons name="trash" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "admin":
        return { backgroundColor: COLORS.error };
      case "teacher":
        return { backgroundColor: COLORS.purple };
      case "student":
        return { backgroundColor: COLORS.green };
      default:
        return { backgroundColor: COLORS.gray };
    }
  };

  if (loading) {
    return <LoadingState text="Loading users..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SectionHeader title="User Management" subtitle={`${users.length} users total`} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <EditUserModal
        visible={editModalVisible}
        user={selectedUser}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
        onUpdate={fetchUsers}
      />
    </SafeAreaView>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.white,
    },
    loadingText: {
      marginTop: 10,
      color: COLORS.gray,
      fontSize: 16,
    },
    header: {
      padding: 20,
      backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.black,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.gray,
      marginTop: 4,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.white,
      margin: 20,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: COLORS.black,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    userCard: {
      backgroundColor: COLORS.white,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      flexDirection: "row",
      alignItems: "center",
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: COLORS.gray,
      marginBottom: 8,
    },
    userMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    userTypeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    userTypeText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    userDate: {
      fontSize: 12,
      color: COLORS.gray,
    },
    userActions: {
      flexDirection: "row",
      gap: 10,
    },
    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.black,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: COLORS.black,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: COLORS.black,
    },
    disabledInput: {
      backgroundColor: COLORS.lightGray,
      color: COLORS.gray,
    },
    selectorButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 12,
    },
    selectorText: {
      fontSize: 16,
      color: COLORS.black,
      textTransform: "capitalize",
    },
    updateButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.purple,
      padding: 15,
      borderRadius: 8,
      gap: 8,
      marginTop: 20,
    },
    updateButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
    },
    disabledButton: {
      opacity: 0.6,
    },
    typeModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    typeModalContent: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 20,
      width: 300,
    },
    typeModalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.black,
      textAlign: "center",
      marginBottom: 20,
    },
    typeOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: COLORS.lightGray,
    },
    typeOptionText: {
      fontSize: 16,
      color: COLORS.black,
      textTransform: "capitalize",
    },
    typeCancelButton: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: COLORS.error,
      marginTop: 10,
    },
    typeCancelText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
  });
}
