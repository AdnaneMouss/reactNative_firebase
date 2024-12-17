import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext'; // Import UserContext

export default function Settings() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useUser(); // Use global context

  const [modalVisible, setModalVisible] = useState(false);
  const languages = ['English', 'French', 'Spanish', 'German', 'Arabic'];

  // Logout handler
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => router.replace('/Login') },
    ]);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.replace('/WelcomeAdmin')}
        >
          <Ionicons
            name="arrow-back-outline"
            size={32}
            color={isDarkMode ? '#FFF' : '#FF0000'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerText, isDarkMode && styles.darkText]}>
          Settings
        </Text>
        <View style={styles.iconButton} />
      </View>

      {/* Dark Mode Option */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Appearance
        </Text>
        <View style={styles.option}>
          <Text style={[styles.optionText, isDarkMode && styles.darkText]}>
            Dark Mode
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            thumbColor={isDarkMode ? '#FF0000' : '#E0E0E0'}
          />
        </View>
      </View>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Preferences
        </Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.optionText, isDarkMode && styles.darkText]}>
            Language
          </Text>
          <Text style={[styles.optionValue, isDarkMode && styles.darkText]}>
            {language}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Account
        </Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push('/UserProfile')}
        >
          <Text style={[styles.optionText, isDarkMode && styles.darkText]}>
            Manage Account
          </Text>
          <Ionicons name="person-outline" size={24} color="#FF0000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: '#FF0000' }]}>Log Out</Text>
          <Ionicons name="log-out-outline" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>

      {/* Language Picker Modal */}
      <Modal transparent={true} animationType="slide" visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Choose Language
            </Text>
            <Picker
              selectedValue={language}
              onValueChange={(value) => setLanguage(value)}
              style={styles.picker}
            >
              {languages.map((lang) => (
                <Picker.Item key={lang} label={lang} value={lang} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  iconButton: {
    padding: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionValue: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  modalButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
