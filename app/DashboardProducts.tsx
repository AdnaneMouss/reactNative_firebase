import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useUser } from './UserContext';
import { useRouter } from 'expo-router';
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  createdAt: string;
}

const db = getFirestore(app);

export default function DashboardProducts() {
   const router = useRouter();
  const { isDarkMode, language } = useUser(); // Use global context
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    image: '',
    description: '',
  });

  const translations = {
    English: {
      header: 'Product Dashboard',
      addProduct: 'Add New Product',
      name: 'Name',
      price: 'Price',
      imageUrl: 'Image URL',
      description: 'Description',
      category: 'Category',
      addButton: 'Add Product',
      deleteSuccess: 'Product deleted successfully.',
      deleteError: 'Failed to delete product.',
      addSuccess: 'Product added successfully.',
      addError: 'Failed to add product.',
      loading: 'Loading Products...'
    },
    French: {
      header: 'Tableau des Produits',
      addProduct: 'Ajouter un Nouveau Produit',
      name: 'Nom',
      price: 'Prix',
      imageUrl: 'URL de l\'image',
      description: 'Description',
      category: 'Catégorie',
      addButton: 'Ajouter le Produit',
      deleteSuccess: 'Produit supprimé avec succès.',
      deleteError: 'Échec de la suppression du produit.',
      addSuccess: 'Produit ajouté avec succès.',
      addError: 'Échec de l\'ajout du produit.',
      loading: 'Chargement des produits...'
    },
  };

  const t = translations[language] || translations.English;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'Products');
      const snapshot = await getDocs(productsRef);
      const productsData: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Product),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', t.addError);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    const { name, price, category, image, description } = newProduct;

    if (!name || !price || !category || !image || !description) {
      Alert.alert('Error', t.addError);
      return;
    }

    try {
      const productId = `${Date.now()}`;
      const productToAdd: Product = {
        id: productId,
        name,
        price: Number(price),
        category,
        image,
        description,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'Products', productId), productToAdd);
      setProducts((prev) => [...prev, productToAdd]);

      // Reset form
      setNewProduct({ name: '', price: 0, category: '', image: '', description: '' });

      Alert.alert('Success', t.addSuccess);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', t.addError);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'Products', productId));
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      Alert.alert('Success', t.deleteSuccess);
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', t.deleteError);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkBackground]}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
    {/* Back Button */}
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.replace('/Dashboard')} // Go back to the previous page
    >
      <Ionicons name="arrow-back-outline" size={32} color="#FF0000" />
    </TouchableOpacity>
  
    {/* Header Text */}
    <Text style={styles.headerText}>Products</Text>
  
    {/* Settings Icon */}
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.replace('/SettingsAdmin')} // Replace with Settings logic if needed
    >
      <Ionicons name="settings-outline" size={32} color="#FF0000" />
    </TouchableOpacity>
  </View>

      <View style={[styles.addProductContainer, isDarkMode && styles.darkCard]}>
        <Text style={[styles.subHeader, isDarkMode && styles.darkText]}>{t.addProduct}</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder={t.name}
          placeholderTextColor={isDarkMode ? '#CCC' : '#AAA'}
          value={newProduct.name}
          onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder={t.price}
          keyboardType="numeric"
          placeholderTextColor={isDarkMode ? '#CCC' : '#AAA'}
          value={newProduct.price?.toString()}
          onChangeText={(text) => setNewProduct({ ...newProduct, price: Number(text) })}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder={t.imageUrl}
          placeholderTextColor={isDarkMode ? '#CCC' : '#AAA'}
          value={newProduct.image}
          onChangeText={(text) => setNewProduct({ ...newProduct, image: text })}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder={t.description}
          placeholderTextColor={isDarkMode ? '#CCC' : '#AAA'}
          value={newProduct.description}
          onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder={t.category}
          placeholderTextColor={isDarkMode ? '#CCC' : '#AAA'}
          value={newProduct.category}
          onChangeText={(text) => setNewProduct({ ...newProduct, category: text })}
        />

        <TouchableOpacity style={[styles.addButton, isDarkMode && styles.darkButton]} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>{t.addButton}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.productCard, isDarkMode && styles.darkCard]}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={[styles.productText, isDarkMode && styles.darkText]}>{t.name}: {item.name}</Text>
              <Text style={[styles.productText, isDarkMode && styles.darkText]}>{t.price}: ${item.price}</Text>
              <Text style={[styles.productText, isDarkMode && styles.darkText]}>{t.category}: {item.category}</Text>
              <Text style={[styles.productText, isDarkMode && styles.darkText]}>{t.description}: {item.description}</Text>
              <Text style={[styles.productText, isDarkMode && styles.darkText]}>{t.createdAt}: {new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#FFFFFF' },
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
  addProductContainer: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 20 },
  subHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  input: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 10 },
  addButton: { backgroundColor: '#FF0000', padding: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  productCard: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 8, padding: 10, marginBottom: 10 },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  productInfo: { flex: 1 },
  productText: { fontSize: 14, color: '#333', marginBottom: 2 },
  deleteButton: { padding: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#FF0000', marginTop: 10 },
});
