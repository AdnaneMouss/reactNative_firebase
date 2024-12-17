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
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useUser } from './UserContext'; // Import context
import { LinearGradient } from 'expo-linear-gradient';
import app from '../firebaseConfig';

export default function Welcome() {
  const router = useRouter();
  const { email, userImage } = useUser(); // Get email and userImage from context
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const currentDate = new Date().toDateString(); // Current date for greeting

  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;

      try {
        // Fetch cart data
        const cartRef = doc(db, 'Cart', email);
        const cartSnapshot = await getDoc(cartRef);
        if (cartSnapshot.exists()) {
          const cartData = cartSnapshot.data();
          setCartCount(cartData.items ? cartData.items.length : 0);
        }

        // Fetch orders data
        const ordersRef = doc(db, 'Orders', email);
        const ordersSnapshot = await getDoc(ordersRef);
        if (ordersSnapshot.exists()) {
          const ordersData = ordersSnapshot.data();
          setOrdersCount(ordersData.orders ? ordersData.orders.length : 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
   {/* Back Button */}
   <TouchableOpacity
     style={styles.iconButton}
     onPress={() => router.replace('/Welcome')} // Go back to the previous page
   >
    
   </TouchableOpacity>
 
   {/* Header Text */}
   <Text style={styles.headerText}>Home</Text>
 
   {/* Settings Icon */}
   <TouchableOpacity
     style={styles.iconButton}
     onPress={() => router.replace('/Settings')} // Replace with Settings logic if needed
   >
     <Ionicons name="settings-outline" size={32} color="#4CAF50" />
   </TouchableOpacity>
 </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.bodyContainer}>
        {/* User Image */}
        <Image
          source={{
            uri: userImage || 'https://i.imgur.com/QMJ8UOV.png', // Default image
          }}
          style={styles.logo}
        />
        <Text style={styles.welcomeText}>Hello, {email ? email.split('@')[0] : 'Guest'}!</Text>
        <Text style={styles.dateText}>{currentDate}</Text>



        {/* Quick Actions */}
        <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.quickAction}>
          <Text style={styles.quickActionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.replace('/Products')}
            >
              <Ionicons name="pricetags-outline" size={24} color="#FFF" />
              <Text style={styles.quickActionText}>View Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.replace('/Orders')}
            >
              <Ionicons name="archive-outline" size={24} color="#FFF" />
              <Text style={styles.quickActionText}>Track Orders</Text>
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
    color: '#4CAF50',
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
    color: '#4CAF50', // Orange header text for Admin
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  bodyContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: 150,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  cardCount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  quickAction: {
    width: '90%',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
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
