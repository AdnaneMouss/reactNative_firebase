import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from './UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import app from '../firebaseConfig';

const db = getFirestore(app);

export default function WelcomeDeliveryMan() {
  const router = useRouter();
  const { email, userImage } = useUser(); // Access user email and image
  const [loading, setLoading] = useState(true);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);

  const currentDate = new Date().toDateString(); // Current date for greeting

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!email) return;

      try {
        // Query pending deliveries for this delivery man
        const deliveriesQuery = query(
          collection(db, 'Orders'),
          where('deliveryManEmail', '==', email),
          where('status', '==', 'Pending')
        );

        const querySnapshot = await getDocs(deliveriesQuery);
        setPendingDeliveries(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [email]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => alert('Profile clicked!')}>
          <Ionicons name="person-circle-outline" size={32} color="#FF9800" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/Login')}>
          <Ionicons name="log-out-outline" size={32} color="#FF9800" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.bodyContainer}>
        {/* User Image */}
        <Image
          source={{ uri: userImage || 'https://i.imgur.com/4EHm1nG.png' }}
          style={styles.logo}
        />
        <Text style={styles.welcomeText}>
          Hello, {email ? email.split('@')[0] : 'DeliveryMan'}!
        </Text>
        <Text style={styles.dateText}>{currentDate}</Text>



        {/* Quick Actions */}
        <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.quickAction}>
          <Text style={styles.quickActionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.replace('/DeliveryMan')}
            >
              <Ionicons name="list-outline" size={24} color="#FFF" />
              <Text style={styles.quickActionText}>View Deliveries</Text>
            </TouchableOpacity>

          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 5,
  },
  iconButton: {
    padding: 5,
  },
  headerText: {
    color: '#FF9800',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bodyContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 100,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  pendingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pendingText: {
    fontSize: 18,
    color: '#333',
  },
  pendingCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF5722',
    marginVertical: 5,
  },
  quickAction: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
  },
});
