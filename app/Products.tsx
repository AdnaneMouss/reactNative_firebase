import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, getDocs, doc, setDoc, arrayUnion } from 'firebase/firestore';
import app from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext'; // Import the UserContext

interface Product {
  id: string;
  category: string;
  name: string;
  image: string;
  price: number;
  description: string;
}

const db = getFirestore(app);

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<string>('None');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState(false);
  const { email } = useUser(); // Get email from the global context
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsRef = collection(db, 'Products');
        const snapshot = await getDocs(productsRef);

        const fetchedProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const uniqueCategories = [
          'All',
          ...new Set(fetchedProducts.map((product) => product.category)),
        ];

        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (priceSort === 'Cheapest') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'Priciest') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, priceSort]);

  const openQuantityModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setModalVisible(true);
  };

  const addToCart = async () => {
    if (!email) {
      Alert.alert('Error', 'User email is required to add items to the cart.');
      return;
    }

    try {
      const cartRef = doc(db, 'Cart', email);

      await setDoc(
        cartRef,
        {
          items: arrayUnion({
            id: selectedProduct?.id,
            name: selectedProduct?.name,
            image: selectedProduct?.image,
            price: selectedProduct?.price,
            description: selectedProduct?.description,
            category: selectedProduct?.category,
            quantity: quantity,
            totalPrice: selectedProduct?.price * quantity,
          }),
        },
        { merge: true }
      );

      setModalVisible(false);
      Alert.alert('Success', `${selectedProduct?.name} (x${quantity}) added to your cart.`);

      // Redirect to the Cart page
      router.replace('/Cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to the cart.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => alert('Profile clicked!')}>
          <Ionicons name="person-circle-outline" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Products</Text>
   <TouchableOpacity
     style={styles.iconButton}
     onPress={() => router.replace('/Settings')} // Replace with Settings logic if needed
   >
     <Ionicons name="settings-outline" size={32} color="#4CAF50" />
   </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={styles.compactPicker}
          >
            <Picker.Item label="Sort by Category" value="All" />
            {categories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={priceSort}
            onValueChange={(value) => setPriceSort(value)}
            style={styles.compactPicker}
          >
            <Picker.Item label="Sort by Price" value="None" />
            <Picker.Item label="Cheapest to Priciest" value="Cheapest" />
            <Picker.Item label="Priciest to Cheapest" value="Priciest" />
          </Picker>
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.addToCartButton} onPress={() => openQuantityModal(item)}>
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Quantity Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Quantity</Text>
            <Picker
              selectedValue={quantity}
              onValueChange={(value) => setQuantity(value)}
              style={styles.quantityPicker}
            >
              {[...Array(10).keys()].map((num) => (
                <Picker.Item key={num + 1} label={`${num + 1}`} value={num + 1} />
              ))}
            </Picker>
            <Text style={styles.finalPrice}>
              Total: ${selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00'}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
              onPress={addToCart}
            >
              <Text style={styles.modalButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#F44336' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
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
    backgroundColor: '#FFFFFF', // Clean white background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    color: '#4CAF50', // Green header text
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  compactPicker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    color: '#4CAF50',
    fontSize: 14,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  quantityPicker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1C',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
