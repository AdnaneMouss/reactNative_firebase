import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from './UserContext'; // Import context

export default function WelcomeAdmin() {
  const router = useRouter();
  const { email, isDarkMode, language, userImage } = useUser(); // Access context for email, dark mode, language, and user image

  // Translations for different languages
  const translations = {
    English: {
      title: 'Admin Dashboard',
      hello: 'Hello, Admin',
      description: 'Manage your platform, oversee operations, and ensure everything runs smoothly.',
      navigate: 'Navigate to your dashboard',
    },
    French: {
      title: 'Tableau de bord Admin',
      hello: 'Bonjour, Admin',
      description: 'Gérez votre plateforme, surveillez les opérations et assurez-vous que tout fonctionne bien.',
      navigate: 'Accédez à votre tableau de bord',
    },
    Spanish: {
      title: 'Panel de administración',
      hello: 'Hola, Admin',
      description: 'Administre su plataforma, supervise las operaciones y asegúrese de que todo funcione sin problemas.',
      navigate: 'Ir a su panel',
    },
  };

  const t = translations[language] || translations.English; // Default to English if no match

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
       <View style={styles.header}>
   {/* Back Button */}
   <TouchableOpacity
     style={styles.iconButton}
     onPress={() => router.replace('/WelcomeAdmin')} // Go back to the previous page
   >
    
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

      {/* Dynamically load the user's image */}
      <Image
        source={{ uri: userImage || 'https://i0.wp.com/live.staticflickr.com/4762/39699055175_5876c32612_b.jpg?resize=1024%2C689&ssl=1' }} // Default image fallback
        style={styles.logo}
      />

      <Text style={[styles.welcomeText, isDarkMode && styles.darkText]}>{t.hello}!</Text>
      <Text style={[styles.userText, isDarkMode && styles.darkText]}>{}</Text>
      <Text style={[styles.description, isDarkMode && styles.darkText]}>{t.description}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.manageUsersButton]}
          onPress={() => router.replace('/Dashboard')}
        >
          <Text style={styles.buttonText}>{t.navigate}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light mode background
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#121212', // Dark mode background
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
  darkHeader: {
    backgroundColor: '#1E1E1E', // Dark mode header background
    borderBottomColor: '#333',
  },
  darkText: {
    color: '#FFFFFF', // White text for dark mode
  },
  logo: {
    width: 250,
    height: 250,
    borderRadius: 125, // Circle effect for image
    marginTop: 30,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5722',
    textAlign: 'center',
  },
  userText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF5722',
    textAlign: 'center',
    marginVertical: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '85%',
    marginTop: 30,
  },
  button: {
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageUsersButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
