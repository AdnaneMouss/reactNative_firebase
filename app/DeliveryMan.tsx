import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getFirestore, collection,getDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from './UserContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';


interface Order {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  date: string;
  status: string;
  deliverymanId: string;
}

const db = getFirestore(app);

export default function DeliveryManOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useUser(); // Logged-in deliveryman's ID
 const router = useRouter();
  const fetchAssignedOrders = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'Orders'));
      const assignedOrders: Order[] = [];

      // Filter orders where deliverymanId matches the logged-in deliveryman
      ordersSnapshot.docs.forEach((doc) => {
        const orderData = doc.data().orders || [];
        const filteredOrders = orderData.map((order: any, index: number) => ({
          ...order,
          id: `${doc.id}-${index}`, // Unique ID for each order
          parentId: doc.id, // Parent document ID for updates
        }))
        .filter((order: Order) => order.deliverymanId === userId);
        assignedOrders.push(...filteredOrders);
      });

      setOrders(assignedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch assigned orders.');
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (orderId: string, parentId: string) => {
    try {
      // Fetch the parent document
      const parentRef = doc(db, 'Orders', parentId);
      const parentDoc = await getDoc(parentRef);

      if (parentDoc.exists()) {
        const existingOrders = parentDoc.data().orders || [];

        // Update the status of the selected order
        const updatedOrders = existingOrders.map((order: any, index: number) => {
          if (`${parentId}-${index}` === orderId) {
            return { ...order, status: 'Delivered' };
          }
          return order;
        });

        // Save the updated orders back to Firestore
        await setDoc(parentRef, { orders: updatedOrders }, { merge: true });

        // Refresh the orders list
        fetchAssignedOrders();
        Alert.alert('Success', 'Order marked as Delivered.');
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      Alert.alert('Error', 'Failed to mark order as delivered.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAssignedOrders();
    }, [userId])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading assigned orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders assigned to you yet!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
            <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => alert('Profile clicked!')}>
          
        </TouchableOpacity>
        <Text style={styles.headerText}>Deliveries</Text>
   <TouchableOpacity
     style={styles.iconButton}
     onPress={() => router.replace('/SettingsDelivery')} // Replace with Settings logic if needed
   >
     <Ionicons name="settings-outline" size={32} color="orange" />
   </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderDate}>Order Date: {new Date(item.date).toLocaleString()}</Text>
            <Text style={styles.orderAddress}>Shipping Address: {item.shippingAddress}</Text>
            <Text style={styles.orderStatus}>
              Status: <Text style={{ fontWeight: 'bold' }}>{item.status || 'Pending'}</Text>
            </Text>
            <FlatList
              data={item.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
                </View>
              )}
            />
            <Text style={styles.totalText}>Total: ${item.totalAmount.toFixed(2)}</Text>
            {item.status !== 'Delivered' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => markAsDelivered(item.id, item.parentId)}
              >
                <Text style={styles.buttonText}>Mark as Delivered</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Light gray background for better contrast
    paddingHorizontal: 15,
    paddingTop: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 3, // Soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  orderAddress: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '600',
    color: '#FF9800', // Orange for status
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});

