import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import app from '../firebaseConfig';
import { useUser } from './UserContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const db = getFirestore(app);

export default function UserProfile() {
  const { email } = useUser();
  const [userData, setUserData] = useState<any>({
    name: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
  });

  // Validation States
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!email) {
        Alert.alert('Error', 'User email not found.');
        return;
      }

      try {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          setUserData({
            ...userDoc.data(),
            docId: userDoc.id,
          });
        } else {
          Alert.alert('Info', 'No user data found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [email]);

  const validateFields = () => {
    const newErrors: any = {};

    if (!userData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!/^\d{10}$/.test(userData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits.';
    }

    if (userData.newPassword && userData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters.';
    }

    if (userData.oldPassword && !userData.newPassword) {
      newErrors.newPassword = 'Please provide a new password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateFields()) {
      return;
    }

    if (!userData.docId) {
      Alert.alert('Error', 'Unable to update data. Please try again.');
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, 'Users', userData.docId);

      // Update name and phone in Firestore
      await updateDoc(userRef, {
        name: userData.name,
        phone: userData.phone,
      });

      // Validate old password and update new password
      if (userData.oldPassword && userData.newPassword) {
        await signInWithEmailAndPassword(auth, email, userData.oldPassword);
        if (currentUser) {
          await updatePassword(currentUser, userData.newPassword);
          Alert.alert('Success', 'Password updated successfully!');
        }
      }

      Alert.alert('Success', 'Your information has been updated successfully.');
      setErrors({});
    } catch (error: any) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', error.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading user information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => alert('Profile clicked!')}>
          <Ionicons name="person-circle-outline" size={32} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerText}>User Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/Login')}>
          <Ionicons name="log-out-outline" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={userData.phone}
          onChangeText={(text) => setUserData({ ...userData, phone: text })}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Old Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter old password"
            value={userData.oldPassword}
            onChangeText={(text) => setUserData({ ...userData, oldPassword: text })}
            secureTextEntry={!showOldPassword}
          />
          <TouchableOpacity onPress={() => setShowOldPassword((prev) => !prev)}>
            <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter new password"
            value={userData.newPassword}
            onChangeText={(text) => setUserData({ ...userData, newPassword: text })}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
            <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconButton: { padding: 5 },
  headerText: { color: '#4CAF50', fontSize: 22, fontWeight: 'bold' },
  form: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 3 },
  label: { fontSize: 14, color: '#777', marginBottom: 5 },
  input: { padding: 12, borderColor: '#DDD', borderWidth: 1, borderRadius: 8, marginBottom: 10, backgroundColor: '#FFF' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  errorText: { color: '#F44336', fontSize: 12, marginBottom: 10 },
  saveButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
