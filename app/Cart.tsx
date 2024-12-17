import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import app from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // To refresh data when screen is focused
import { useUser } from './UserContext'; // Import the UserContext

interface CartItem {
  id: string;
  category: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

const db = getFirestore(app);

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { email } = useUser(); // Get email from the global context

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
        setCartItems(data.items || []);
      } else {
        setCartItems([]);
        Alert.alert('Info', 'No items in the cart.');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to fetch cart data.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch cart whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [email])
  );

  const removeFromCart = async (itemToRemove: CartItem) => {
    if (!email) {
      Alert.alert('Error', 'User email not found!');
      return;
    }

    try {
      const cartRef = doc(db, 'Cart', email);

      // Remove the item from Firestore
      await updateDoc(cartRef, {
        items: arrayRemove(itemToRemove),
      });

      // Remove the item from the local state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemToRemove.id)
      );

      Alert.alert('Success', `${itemToRemove.name} removed from your cart.`);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from the cart.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#4CAF50" />
        <Text style={styles.emptyText}>Your cart is empty!</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => router.replace('/Products')}
        >
          <Text style={styles.goBackButtonText}>Go Back to Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Cart</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
              <Text style={styles.totalPrice}>Total: ${item.totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item)}
            >
              <Ionicons name="trash-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() =>
              router.push({
                pathname: '/Checkout',
                params: { email }, // Pass email to the checkout page
              })
            }
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        }
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
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  removeButton: {
    marginLeft: 10,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
