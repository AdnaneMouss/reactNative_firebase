import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; // User context for email retrieval

const db = getFirestore(app);

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountedTotal, setDiscountedTotal] = useState(null);
  const router = useRouter();
  const { email } = useUser(); // Get email from context

  useEffect(() => {
    const fetchCart = async () => {
      if (!email) {
        Alert.alert('Error', 'User email not found!');
        return;
      }

      try {
        const cartRef = doc(db, 'Cart', email);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          const data = cartDoc.data();
          const items = data.items || [];
          setCartItems(items);
          const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
          setTotalAmount(total);
        } else {
          setCartItems([]);
          setTotalAmount(0);
          Alert.alert('Info', 'Your cart is empty.');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        Alert.alert('Error', 'Failed to fetch cart data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [email]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code.');
      return;
    }

    try {
      const promoRef = doc(db, 'PromoCodes', 'PromoCode1');
      const promoDoc = await getDoc(promoRef);

      if (promoDoc.exists()) {
        const promoData = promoDoc.data();
        if (promoCode === promoData.Code) {
          const discountPercentage = promoData.Valeur / 100;
          const newTotal = totalAmount * (1 - discountPercentage);
          setDiscountedTotal(newTotal);
          Alert.alert('Success', `Promo code applied! You saved ${promoData.Valeur}%`);
        } else {
          Alert.alert('Error', 'Invalid promo code. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Promo code not found.');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      Alert.alert('Error', 'Failed to validate promo code.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!email) {
      Alert.alert('Error', 'User email not found!');
      return;
    }

    if (!shippingAddress) {
      Alert.alert('Error', 'Please enter a valid shipping address.');
      return;
    }

    try {
      const deliverymenSnapshot = await getDocs(collection(db, 'Users'));
      const deliverymen = deliverymenSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.userType === 'DeliveryMan');

      if (deliverymen.length === 0) {
        Alert.alert('Error', 'No deliverymen available to assign the order.');
        return;
      }

      const assignedDeliveryman = deliverymen[0];
      const finalTotal = discountedTotal || totalAmount;

      const orderData = {
        items: cartItems,
        totalAmount: finalTotal,
        shippingAddress,
        deliverymanId: assignedDeliveryman.id,
        status: 'Pending',
        date: new Date().toISOString(),
      };

      const ordersRef = doc(db, 'Orders', email);
      const ordersDoc = await getDoc(ordersRef);

      const existingOrders = ordersDoc.exists() && ordersDoc.data().orders ? ordersDoc.data().orders : [];

      await setDoc(
        ordersRef,
        { orders: [...existingOrders, orderData] },
        { merge: true }
      );

      const cartRef = doc(db, 'Cart', email);
      await setDoc(cartRef, { items: [] });

      Alert.alert('Success', `Order placed successfully! Assigned to ${assignedDeliveryman.name}.`);
      router.replace('/Orders');
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/Cart')}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
              </View>
            )}
            ListFooterComponent={
              <>
                <Text style={styles.label}>Shipping Address</Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress}
                  onChangeText={setShippingAddress}
                />

                <Text style={styles.label}>Promo Code</Text>
                <View style={styles.promoContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChangeText={setPromoCode}
                  />
                  <TouchableOpacity style={styles.applyButton} onPress={validatePromoCode}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.totalText}>
                  Total Amount: ${discountedTotal ? discountedTotal.toFixed(2) : totalAmount.toFixed(2)}
                </Text>
                <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
                  <Text style={styles.orderButtonText}>Place Order</Text>
                </TouchableOpacity>
              </>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#4CAF50' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#FFFFFF', marginVertical: 5, borderRadius: 8 },
  itemName: { fontSize: 16, color: '#333' },
  itemPrice: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginLeft: 10 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginHorizontal: 10, marginVertical: 5 },
  promoContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  applyButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, marginLeft: 10 },
  applyButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  orderButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginHorizontal: 10, alignItems: 'center' },
  orderButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});
