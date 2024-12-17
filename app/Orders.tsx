import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, doc,getDocs, getDoc, collection } from 'firebase/firestore';
import app from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext';

interface Order {
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  date: string;
  status: string; // Pending or Delivered
  deliverymanId: string; // ID of the deliveryman
}

interface Deliveryman {
  name: string;
  phone: string;
}

const db = getFirestore(app);

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliverymen, setDeliverymen] = useState<{ [key: string]: Deliveryman }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { email } = useUser();

  const fetchDeliverymen = async () => {
    try {
      const usersRef = collection(db, 'Users');
      const snapshot = await getDocs(usersRef);
      const deliverymenData: { [key: string]: Deliveryman } = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.userType === 'DeliveryMan') {
          deliverymenData[doc.id] = { name: data.name, phone: data.phone };
        }
      });

      setDeliverymen(deliverymenData);
    } catch (error) {
      console.error('Error fetching deliverymen:', error);
      Alert.alert('Error', 'Failed to fetch deliverymen data.');
    }
  };

  const fetchOrders = async () => {
    if (!email) {
      Alert.alert('Error', 'User email not found!');
      return;
    }

    try {
      const ordersRef = doc(db, 'Orders', email);
      const ordersDoc = await getDoc(ordersRef);

      if (ordersDoc.exists()) {
        const data = ordersDoc.data();
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        Alert.alert('Info', 'No orders found.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDeliverymen().then(fetchOrders);
    }, [email])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderDate}>Order Date: {new Date(item.date).toLocaleString()}</Text>
            <Text style={styles.orderAddress}>Shipping Address: {item.shippingAddress}</Text>
            <Text style={styles.orderStatus}>Status: {item.status || 'Pending'}</Text>

            {item.deliverymanId && deliverymen[item.deliverymanId] ? (
              <>
                <Text style={styles.deliverymanInfo}>
                  Deliveryman: {deliverymen[item.deliverymanId].name}
                </Text>
                <Text style={styles.deliverymanInfo}>
                  Phone: {deliverymen[item.deliverymanId].phone}
                </Text>
              </>
            ) : (
              <Text style={styles.deliverymanInfo}>Deliveryman: Not Assigned</Text>
            )}

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
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 10 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#4CAF50', marginTop: 10 },
  orderCard: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 8, marginVertical: 10 },
  orderDate: { fontSize: 14, color: '#333' },
  orderAddress: { fontSize: 14, color: '#666', marginBottom: 5 },
  orderStatus: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold', marginBottom: 5 },
  deliverymanInfo: { fontSize: 14, color: '#333', marginBottom: 5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  itemName: { fontSize: 14, color: '#333' },
  itemQuantity: { fontSize: 14, color: '#666' },
  itemPrice: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 10 },
});
