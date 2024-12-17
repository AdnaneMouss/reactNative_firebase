import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import app from '../firebaseConfig';
import { useRouter } from 'expo-router';
interface PromoCode {
  id: string;
  Code: string;
  Valeur: number;
}

const db = getFirestore(app);

export default function DashboardPromoCodes() {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newPromoCode, setNewPromoCode] = useState<Partial<PromoCode>>({
    Code: '',
    Valeur: 0,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const promoCodesRef = collection(db, 'PromoCodes');
      const snapshot = await getDocs(promoCodesRef);
      const promoCodesData: PromoCode[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as PromoCode),
      }));
      setPromoCodes(promoCodesData);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      Alert.alert('Error', 'Failed to fetch promo codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromoCode = async () => {
    const { Code, Valeur } = newPromoCode;

    if (!Code || !Valeur) {
      Alert.alert('Error', 'Code and Value are required to add a promo code.');
      return;
    }

    try {
      const promoCodeId = `${Date.now()}`;
      const promoCodeToAdd: PromoCode = {
        id: promoCodeId,
        Code,
        Valeur: Number(Valeur),
      };

      await setDoc(doc(db, 'PromoCodes', promoCodeId), promoCodeToAdd);
      setPromoCodes((prev) => [...prev, promoCodeToAdd]);

      // Reset form
      setNewPromoCode({ Code: '', Valeur: 0 });

      Alert.alert('Success', 'Promo code added successfully.');
    } catch (error) {
      console.error('Error adding promo code:', error);
      Alert.alert('Error', 'Failed to add promo code.');
    }
  };

  const handleDeletePromoCode = async (promoCodeId: string) => {
    try {
      await deleteDoc(doc(db, 'PromoCodes', promoCodeId));
      setPromoCodes((prev) => prev.filter((promo) => promo.id !== promoCodeId));
      Alert.alert('Success', 'Promo code deleted successfully.');
    } catch (error) {
      console.error('Error deleting promo code:', error);
      Alert.alert('Error', 'Failed to delete promo code.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading Promo Codes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
    {/* Back Button */}
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.replace('/Dashboard')} // Go back to the previous page
    >
      <Ionicons name="arrow-back-outline" size={32} color="#FF0000" />
    </TouchableOpacity>
  
    {/* Header Text */}
    <Text style={styles.headerText}>Promo codes</Text>
  
    {/* Settings Icon */}
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.replace('/SettingsAdmin')} // Replace with Settings logic if needed
    >
      <Ionicons name="settings-outline" size={32} color="#FF0000" />
    </TouchableOpacity>
  </View>

      {/* Add New Promo Code Section */}
      <View style={styles.addPromoContainer}>
        <Text style={styles.subHeader}>Add New Promo Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Promo Code"
          value={newPromoCode.Code}
          onChangeText={(text) => setNewPromoCode({ ...newPromoCode, Code: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Value"
          keyboardType="numeric"
          value={newPromoCode.Valeur?.toString() || ''}
          onChangeText={(text) => setNewPromoCode({ ...newPromoCode, Valeur: Number(text) })}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddPromoCode}>
          <Text style={styles.addButtonText}>Add Promo Code</Text>
        </TouchableOpacity>
      </View>

      {/* Display Promo Codes */}
      <FlatList
        data={promoCodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.promoCard}>
            <View style={styles.promoInfo}>
              <Text style={styles.promoText}>Code: {item.Code}</Text>
              <Text style={styles.promoText}>Value: {item.Valeur}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeletePromoCode(item.id)}
              style={styles.deleteButton}
            >
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
  addPromoContainer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  subHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  promoInfo: { flex: 1 },
  promoText: { fontSize: 14, color: '#333', marginBottom: 2 },
  deleteButton: { padding: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#FF0000', marginTop: 10 },
});
