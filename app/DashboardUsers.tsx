import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  image: string;
  createdAt: string;
}

const db = getFirestore(app);
const auth = getAuth(app);

export default function DashboardUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newUser, setNewUser] = useState<Partial<User & { password: string }>>({
    name: '',
    email: '',
    phone: '',
    userType: 'Client',
    image: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'Users');
      const snapshot = await getDocs(usersRef);
      const usersData: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as User),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    const { name, email, phone, userType, image, password } = newUser;

    if (!name || !email || !phone || !userType || !image || !password) {
      Alert.alert('Error', 'All fields are required to add a user.');
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Add user data to Firestore
      const userToAdd: User = {
        id: uid,
        name,
        email,
        phone,
        userType,
        image,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'Users', uid), userToAdd);
      setUsers((prev) => [...prev, userToAdd]);

      // Reset the form
      setNewUser({ name: '', email: '', phone: '', userType: 'Client', image: '', password: '' });

      Alert.alert('Success', 'User added successfully.');
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Error', 'Failed to add user. Email might already exist.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'Users', userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      Alert.alert('Success', 'User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading Users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
    {/* Back Button */}
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.replace('/Dashboard')} // Go back to the previous page
    >
      <Ionicons name="arrow-back-outline" size={32} color="#FF0000" />
    </TouchableOpacity>
  
    {/* Header Text */}
    <Text style={styles.headerText}>Admin Dashboard</Text>
  
    {/* Settings Icon */}
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.replace('/SettingsAdmin')} // Replace with Settings logic if needed
    >
      <Ionicons name="settings-outline" size={32} color="#FF0000" />
    </TouchableOpacity>
  </View>

      {/* Add New User Section */}
      <View style={styles.addUserContainer}>
        <Text style={styles.subHeader}>Add New User</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newUser.name}
          onChangeText={(text) => setNewUser({ ...newUser, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newUser.email}
          onChangeText={(text) => setNewUser({ ...newUser, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={newUser.phone}
          onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={newUser.image}
          onChangeText={(text) => setNewUser({ ...newUser, image: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={newUser.password}
          onChangeText={(text) => setNewUser({ ...newUser, password: text })}
        />
        <Picker
          selectedValue={newUser.userType}
          onValueChange={(value) => setNewUser({ ...newUser, userType: value })}
          style={styles.picker}
        >
          <Picker.Item label="Client" value="Client" />
          <Picker.Item label="Admin" value="Admin" />
          <Picker.Item label="DeliveryMan" value="DeliveryMan" />
        </Picker>

        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subHeader2}>List of users</Text>
      {/* Display Users */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Image source={{ uri: item.image }} style={styles.userImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userText}>Name: {item.name}</Text>
              <Text style={styles.userText}>Email: {item.email}</Text>
              <Text style={styles.userText}>Phone: {item.phone}</Text>
              <Text style={styles.userText}>User Type: {item.userType}</Text>
              <Text style={styles.userText}>
                Created At: {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteUser(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F8F8', // Subtle gray for header background
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Light border for separation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  iconButton: {
    padding: 5,
  },
  headerText: {
    color: '#FF5722', // Orange header text for Admin
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  addUserContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subHeader2: {
    fontSize: 18,
    fontWeight: 'bold',
    left:15,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FF0000',
    marginTop: 10,
  },
});
